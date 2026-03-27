const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const identityService = require('./identityService');
const conversationService = require('./conversationService');

class MailReceiver {
  constructor(io, socketService) {
    this.io = io;
    this.socketService = socketService;
    this.processedUids = new Set(); // Session-level deduplication
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
    try {
      console.log('IMAP: Connecting to Gmail...');
      const connection = await imaps.connect(this.config);
      this.connection = connection;
      
      console.log('IMAP: Connection Successful');

      await connection.openBox('INBOX');
      console.log('IMAP: Inbox Opened. Polling for unseen mail...');

      // Initial check
      await this.fetchUnseen();

      // Setup Polling (5-second intervals for real-time feel)
      setInterval(() => this.fetchUnseen(), 5000);

    } catch (err) {
      console.error('IMAP: Error during start-up:', err);
      // Retry after 60 seconds
      setTimeout(() => this.start(), 60000);
    }
  }

  async fetchUnseen() {
    try {
      const searchCriteria = ['UNSEEN'];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT', ''],
        markSeen: true
      };

      const messages = await this.connection.search(searchCriteria, fetchOptions);
      
      if (messages.length === 0) return;

      // Filter out UIDs already processed in this session
      const newMessages = messages.filter(msg => !this.processedUids.has(msg.attributes.uid));
      
      if (newMessages.length === 0) return;

      console.log(`IMAP: Found ${newMessages.length} truly new message(s)`);

      for (const item of newMessages) {
        const id = item.attributes.uid;
        this.processedUids.add(id);
        
        const all = item.parts.find(part => part.which === '');
        if (!all) continue;

        try {
          const parsed = await simpleParser(all.body);
          const from = parsed.from?.value[0]?.address;

          if (!from || from.toLowerCase() === process.env.GMAIL_USER.toLowerCase()) continue;

          const senderName = parsed.from?.value[0]?.name || from.split('@')[0];
          const subject = parsed.subject || 'No Subject';
          const body = parsed.text || 'Empty Body';
          const messageId = parsed.messageId;

          console.log(`IMAP: Handling [UID: ${id}, ID: ${messageId}] from ${from}`);

          // 1. Resolve Identity
          const identityService = require('./identityService');
          const { user } = await identityService.resolveIdentity('email', from, senderName);

          // 2. Process Message
          const { conversation, newMessage, aiMessage } = await conversationService.processIncomingMessage(
            user,
            'email',
            body,
            { emailSubject: subject, imapUid: id, messageId: messageId }
          );

          if (this.socketService) {
            this.socketService.emitAiResults(conversation, newMessage, aiMessage);
          }
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
