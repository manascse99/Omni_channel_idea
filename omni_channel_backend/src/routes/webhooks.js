const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const identityService = require('../services/identityService');
const conversationService = require('../services/conversationService');

// Verify Token used for WhatsApp Cloud API setup
const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;
const APP_SECRET = process.env.META_APP_SECRET;

/**
 * 1. WhatsApp Webhook Verification (GET)
 * Meta will send a GET request here during setup to verify the URL
 */
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  return res.sendStatus(400);
});

/**
 * 2. WhatsApp Incoming Messages (POST)
 */
router.post('/whatsapp', async (req, res) => {
  // CRITICAL RULE: Always respond 200 immediately to prevent Meta from retrying
  res.sendStatus(200);

  // Read message from payload
  const body = req.body;
  if (body.object === 'whatsapp_business_account') {
    try {
      const entry = body.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;

      if (value.messages && value.messages.length > 0) {
        const message = value.messages[0];
        const contact = value.contacts[0];

        const phone = message.from; // Customer's phone number
        const content = message.text ? message.text.body : '[Media Message]';
        const msgId = message.id;

        // Deduplication Check
        const isDupe = await conversationService.isDuplicateWhatsAppMessage(msgId);
        if (isDupe) {
          console.log(`Duplicate WhatsApp message ignored: ${msgId}`);
          return;
        }

        // 1. Resolve Identity
        const { user } = await identityService.resolveIdentity('whatsapp', phone).populate('userId', 'phone email name lastSeen channelHistory firstInteractionAt lastChannel telegramChatId discordUserId');

        // Optionally update name if newly available
        if (contact && contact.profile && contact.profile.name && !user.name) {
          user.name = contact.profile.name;
          await user.save();
        }

        // 2. Process Message (FAST)
        const result = await conversationService.processIncomingMessage(user, 'whatsapp', content, {
          whatsappMsgId: msgId
        });

        // --- INSTANT UI UPDATE ---
        if (req.socketService) {
          req.socketService.emitNewMessage(result.conversation._id, result.newMessage);
        }

        // 3. BACKGROUND AI Analysis (SLOW)
        // We do not await this, letting it run in the background
        conversationService.applyAiAnalysis(
          result.conversation._id, 
          result.newMessage._id, 
          content,
          req.socketService
        );

        console.log(`Successfully ingested WhatsApp message for user ${user._id}. AI running in background.`);
      }
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
    }
  }
});

/**
 * 3. Email Webhook (SendGrid Inbound Parse)
 * SendGrid sends a multipart/form-data POST
 */
// NOTE: For testing without grid middleware, we assume body contains parsed fields
router.post('/email', async (req, res) => {
  // CRITICAL RULE: Send 200 OK immediately
  res.sendStatus(200);

  try {
    const fromEmail = req.body.from; // Usually "Name <email@domain.com>"
    const subject = req.body.subject;
    const textBody = req.body.text; // The plain text content

    if (!fromEmail || !textBody) return;

    // Extract raw email address
    const emailMatch = fromEmail.match(/<([^>]+)>/);
    const email = emailMatch ? emailMatch[1] : fromEmail;

    // 1. Resolve Identity
    const { user } = await identityService.resolveIdentity('email', email);

    // 2. Process Message (FAST)
    const result = await conversationService.processIncomingMessage(user, 'email', textBody, {
      emailSubject: subject
    });

    // --- INSTANT UI UPDATE ---
    if (req.socketService) {
      req.socketService.emitNewMessage(result.conversation._id, result.newMessage);
    }

    // 3. BACKGROUND AI Analysis (SLOW)
    conversationService.applyAiAnalysis(
      result.conversation._id, 
      result.newMessage._id, 
      textBody,
      req.socketService
    );

    console.log(`Successfully ingested Email webhook for user ${user._id}. AI running in background.`);
  } catch (error) {
    console.error('Error processing Email webhook:', error);
  }
});

/**
 * 4. Telegram Incoming Messages (POST)
 */
router.post('/telegram', async (req, res) => {
  // CRITICAL RULE: Always respond 200 immediately
  res.sendStatus(200);

  const body = req.body;
  console.log('Telegram Webhook Received:', JSON.stringify(body, null, 2));

  if (body.message && body.message.text) {
    try {
      const message = body.message;
      const chatId = message.chat.id.toString();
      const text = message.text;
      const firstName = message.from.first_name || '';
      const lastName = message.from.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Telegram User';

      // 1. Resolve Identity
      const { user } = await identityService.resolveIdentity('telegram', chatId, fullName);

      // 2. Process Message (FAST)
      const result = await conversationService.processIncomingMessage(user, 'telegram', text, {
        telegramChatId: chatId
      });

      // --- INSTANT UI UPDATE ---
      if (req.socketService) {
        req.socketService.emitNewMessage(result.conversation._id, result.newMessage);
      }

      // 3. BACKGROUND AI Analysis (SLOW)
      conversationService.applyAiAnalysis(
        result.conversation._id, 
        result.newMessage._id, 
        text,
        req.socketService
      );

      console.log(`Successfully ingested Telegram message for user ${user._id}. AI running in background.`);
    } catch (error) {
      console.error('Error processing Telegram webhook:', error);
    }
  }
});

module.exports = router;
