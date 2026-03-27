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
        const { user } = await identityService.resolveIdentity('whatsapp', phone);

        // Optionally update name if newly available
        if (contact && contact.profile && contact.profile.name && !user.name) {
          user.name = contact.profile.name;
          await user.save();
        }

        // 2. Process Message + Run AI Pipeline
        const result = await conversationService.processIncomingMessage(user, 'whatsapp', content, {
          whatsappMsgId: msgId
        });

        console.log(`Successfully processed WhatsApp message for user ${user._id}. Intended Reply: ${result.aiResult.reply}`);
        
        // 3. Emit Socket event for real-time dashboard update (AI-ready)
        if (req.socketService) {
          req.socketService.emitAiResults(result.conversation, result.newMessage, result.aiMessage);
        }
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

    // 2. Process Message + Run AI Pipeline
    const result = await conversationService.processIncomingMessage(user, 'email', textBody, {
      emailSubject: subject
    });

    console.log(`Successfully processed Email webhook for user ${user._id}`);
  } catch (error) {
    console.error('Error processing Email webhook:', error);
  }
});

module.exports = router;
