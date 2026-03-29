const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const identityService = require('./identityService');
const conversationService = require('./conversationService');

class MailReceiver {
  constructor(io, socketService) {
    this.io = io;
    this.socketService = socketService;
    this.processedUids = new Set(); // Session-level deduplication
    this.isReconnecting = false;
    this.fetchInterval = null;
    this.blacklist = [
      'facebookmail.com',
      'linkedin.com',
      'twitter.com',
      'noreply',
      'notifications'
    ];
    this.config = {
      imap: {
        user: process.env.GMAIL_USER,
        password: process.env.GMAIL_APP_PASSWORD,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: { 
          rejectUnauthorized: false,
          servername: 'imap.gmail.com'
        },
        authTimeout: 10000,
        connTimeout: 10000
      }
    };

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('IMAP: Skipping initialization. GMAIL_USER or GMAIL_APP_PASSWORD not set.');
      return;
    }
  }

  async start() {
    if (this.isReconnecting) return;
    try {
      this.isReconnecting = true;
      console.log('IMAP: Connecting to Gmail...');
      
      // Clear old interval if exists
      if (this.fetchInterval) clearInterval(this.fetchInterval);

      const connection = await imaps.connect(this.config);
      this.connection = connection;
      this.isReconnecting = false;
      
      console.log('IMAP: Connection Successful');

      await connection.openBox('INBOX');
      console.log('IMAP: Inbox Opened. Polling for unseen mail...');

      // Handle connection errors (prevents server crash on ECONNRESET)
      connection.on('error', (err) => {
        console.error('IMAP: Connection Error detected:', err.message);
        this.connection = null;
        // Trigger a restart after a short delay
        setTimeout(() => this.start(), 5000);
      });

      // Initial check
      await this.fetchUnseen();

      // Setup Polling (5-second intervals for real-time feel)
      this.fetchInterval = setInterval(() => this.fetchUnseen(), 5000);

    } catch (err) {
      this.isReconnecting = false;
      console.error('IMAP: Error during start-up:', err.message);
      // Retry after 30 seconds
      setTimeout(() => this.start(), 30000);
    }
  }

  async fetchUnseen() {
    if (!this.connection) return;
    try {
      const searchCriteria = ['UNSEEN'];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT', ''],
        markSeen: true
      };

      const messages = await this.connection.search(searchCriteria, fetchOptions);
      
      if (messages.length === 0) {
        // Only log periodically to avoid spamming the console
        if (Math.random() < 0.1) console.log('IMAP: No new UNSEEN messages found.');
        return;
      }

      console.log(`IMAP: Search found ${messages.length} UNSEEN raw messages.`);

      // Filter out UIDs already processed in this session
      const newMessages = messages.filter(msg => {
        const isProcessed = this.processedUids.has(msg.attributes.uid);
        if (isProcessed) console.log(`IMAP: UID ${msg.attributes.uid} already processed, skipping.`);
        return !isProcessed;
      });
      
      if (newMessages.length === 0) {
        console.log('IMAP: All found messages were already processed.');
        return;
      }

      console.log(`IMAP: Found ${newMessages.length} truly new message(s) to parse.`);

      for (const item of newMessages) {
        const id = item.attributes.uid;
        this.processedUids.add(id);
        
        const all = item.parts.find(part => part.which === '');
        if (!all) {
          console.warn(`IMAP: Could not find full body for UID ${id}`);
          continue;
        }

        try {
          const parsed = await simpleParser(all.body);
          const from = parsed.from?.value[0]?.address;

          console.log(`IMAP: Parsing message UID ${id} from: ${from}`);

          // Loop prevention: Ignore emails from the system's own email
          if (!from || from.toLowerCase() === process.env.GMAIL_USER.toLowerCase()) {
            console.log(`IMAP: Ignoring message from self: ${from}`);
            continue;
          }

          // Blacklist Filter: Ignore notifications from social media or automated bots
          const isBlacklisted = this.blacklist.some(domain => from.toLowerCase().includes(domain));
          if (isBlacklisted) {
            console.log(`IMAP: Skipping blacklisted sender: ${from}`);
            continue;
          }

          const senderName = parsed.from?.value[0]?.name || from.split('@')[0];
          const subject = parsed.subject || 'No Subject';
          const body = parsed.text || 'Empty Body';
          const messageId = parsed.messageId;

          // 1. Process Message (FAST)
          const result = await conversationService.processIncomingMessage(
            { email: from, name: senderName }, // User info
            'email',
            body,
            { emailSubject: subject, imapUid: id, messageId: messageId }
          );

          if (result.alreadyProcessed) return;

          console.log(`IMAP: Message ingested (FAST) for ${from}.`);

          // --- INSTANT UI UPDATE ---
          if (this.socketService) {
            this.socketService.emitNewMessage(result.conversation._id, result.newMessage);
          }

          // 2. BACKGROUND AI Analysis (SLOW)
          conversationService.applyAiAnalysis(
            result.conversation._id, 
            result.newMessage._id, 
            body,
            this.socketService
          );
        } catch (err) {
          console.error(`IMAP: Error processing item ${id}:`, err);
        }
      }
    } catch (err) {
      console.error('IMAP: Fetch Error:', err);
    }
  }
}

module.exports = MailReceiver;
