const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const Team = require('../models/Team');
const Settings = require('../models/Settings');
const OtpToken = require('../models/OtpToken');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const emailService = require('../services/emailService');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const transporter = emailService.transporter;

// --- MIDDLEWARE ---
const authenticateAgent = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.agentId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Failed to authenticate token' });
  }
};

// --- AUTH APIs ---

router.post('/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const emailLower = email.toLowerCase();
    
    // Check if agent exists
    const agent = await Agent.findOne({ email: emailLower });
    const isNewUser = !agent;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Save/Update OTP in DB
    await OtpToken.findOneAndUpdate(
      { email: emailLower },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Send Email via Nodemailer
    const mailOptions = {
      from: `"OmniBank AI" <${process.env.GMAIL_USER}>`,
      to: emailLower,
      subject: isNewUser ? 'Welcome to OmniBank AI - Your Registration OTP' : 'OmniBank AI - Your Login OTP',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0F2F55;">OmniBank AI</h2>
          <p>Hello,</p>
          <p>${isNewUser ? 'Welcome to the platform! Please use the following code to complete your registration:' : 'Use the following code to log in to your account:'}</p>
          <div style="background: #f4f7f6; padding: 20px; text-align: center; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #00CCA3;">${otp}</span>
          </div>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">This code will expire in 5 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 10px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] OTP sent to ${emailLower}: ${otp}`);

    res.json({ success: true, message: 'OTP sent to email', isNewUser });
  } catch (err) {
    console.error('[AUTH] Send OTP Error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/auth/verify-otp', async (req, res) => {
  const { email, otp, name } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const emailLower = email.toLowerCase();
    const record = await OtpToken.findOne({ email: emailLower });

    if (!record || record.otp !== otp || record.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // OTP is valid - delete it
    await OtpToken.deleteOne({ email: emailLower });

    // Check if agent exists, if not create one
    let agent = await Agent.findOne({ email: emailLower });
    
    if (!agent) {
      if (!name) {
        return res.status(400).json({ error: 'Name is required for first-time registration' });
      }

      // Security Passkey Check for New Agents
      const { passkey } = req.body;
      if (passkey !== '123456') {
        return res.status(403).json({ error: 'Invalid security passkey. Registration denied.' });
      }

      // Find a default team (e.g., Customer Support)
      const defaultTeam = await Team.findOne({ name: 'Customer Support' });

      agent = await Agent.create({
        name: name,
        email: emailLower,
        phone: `auto_${Date.now()}`,
        role: 'agent',
        teamId: defaultTeam?._id || null,
        status: 'online'
      });
      console.log(`[AUTH] New Agent Registered & Assigned to Team: ${name} (${emailLower})`);
    }


    // Update status to online if needed
    if (agent.status === 'offline') {
      agent.status = 'online';
    }

    // Assign team if missing
    if (!agent.teamId) {
      const defaultTeam = await Team.findOne({ name: 'Customer Support' });
      if (defaultTeam) {
        agent.teamId = defaultTeam._id;
        console.log(`[AUTH] Assigned existing agent ${agent.name} to Customer Support team`);
      }
    }

    await agent.save();


    // Generate JWT
    const token = jwt.sign(
      { id: agent._id, email: agent.email, role: agent.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
        teamId: agent.teamId,
        phone: agent.phone,
        bio: agent.bio,
        location: agent.location,
        department: agent.department,
        timezone: agent.timezone
      }
    });
  } catch (err) {
    console.error('[AUTH] Verify OTP Error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});


// --- DASHBOARD APIs ---

router.get('/dashboard/stats', async (req, res) => {
  try {
    const total = await Conversation.countDocuments();
    const aiResolved = await Conversation.countDocuments({ status: 'resolved' }); // count actually resolved
    const pending = await Conversation.countDocuments({ status: { $in: ['open', 'escalated'] } });
    
    // Calculate real Avg Response Time (simplified)
    const lastFive = await Conversation.find().limit(5).sort({ updatedAt: -1 });
    let totalDiff = 0;
    let count = 0;
    
    for (const conv of lastFive) {
      const msgs = await Message.find({ conversationId: conv._id }).sort({ timestamp: 1 }).limit(2);
      if (msgs.length >= 2 && msgs[0].senderType === 'user' && msgs[1].senderType === 'agent') {
        totalDiff += (msgs[1].timestamp - msgs[0].timestamp);
        count++;
      }
    }
    
    const avgMs = count > 0 ? totalDiff / count : 120000; // fallback to 120s
    const avgSeconds = Math.round(avgMs / 1000);
    const avgResponseTime = avgSeconds > 60 ? `${Math.floor(avgSeconds/60)}m ${avgSeconds%60}s` : `${avgSeconds}s`;

    res.json({
      total,
      aiResolved,
      pending,
      avgResponseTime
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/agents/me', authenticateAgent, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'phone', 'bio', 'location', 'department', 'timezone', 'role', 'teamId'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const agent = await Agent.findByIdAndUpdate(req.agentId, filteredUpdates, { new: true }).populate('teamId');
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    res.json({ success: true, agent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CONVERSATION APIs ---

router.get('/conversations', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Optional filters could apply here, e.g. status, intent
    const filter = {}; 
    
    const conversations = await Conversation.find(filter)
      .populate('userId', 'phone email name lastSeen channelHistory firstInteractionAt lastChannel')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Conversation.countDocuments(filter);

    res.json({ conversations, total, page });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/conversations/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('userId', 'phone email name tags channelHistory duplicateWarning preferredChannel')
      .populate('assignedTeam', 'name');
    
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const messages = await Message.find({ conversationId: conversation._id })
      .populate('metadata.agentId', 'name')
      .sort({ timestamp: 1 });

    res.json({ conversation, messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update single conversation as read
router.patch('/conversations/:id/read', authenticateAgent, async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ success: true, isRead: conversation.isRead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all current conversations as read
router.post('/conversations/read-all', authenticateAgent, async (req, res) => {
  try {
    await Conversation.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id).populate('userId');
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const { content, agentId } = req.body;

    const newMessage = await Message.create({
      conversationId: conversation._id,
      userId: conversation.userId?._id,
      channel: conversation.lastChannel || 'webchat',
      senderType: 'agent',
      content: content,
      isRead: true,
      metadata: { agentId: agentId || req.agentId }
    });

    // Handle Email Delivery
    console.log(`[DEBUG] Checking email delivery for conversation ${conversation._id}. Channel: ${conversation.lastChannel}`);
    if (conversation.lastChannel === 'email' && conversation.userId?.email) {
      // Fetch latest user message for threading context
      const lastUserMsg = await Message.findOne({ 
        conversationId: conversation._id, 
        senderType: 'user' 
      }).sort({ timestamp: -1 });

      console.log(`[DEBUG] Last user message found: ${!!lastUserMsg}. MessageId: ${lastUserMsg?.metadata?.messageId}`);

      if (lastUserMsg && lastUserMsg.metadata?.messageId) {
        console.log(`[EMAIL] Agent replying to ${conversation.userId.email} with Subject: ${lastUserMsg.metadata.emailSubject}`);
        try {
          await emailService.sendReply(
            conversation.userId.email,
            content,
            lastUserMsg.metadata.emailSubject || 'Re: Message Received',
            lastUserMsg.metadata.messageId
          );
        } catch (emailErr) {
          console.error('[EMAIL] Agent reply failed:', emailErr);
        }
      } else {
        console.warn(`[EMAIL] Cannot send reply: No messageId found in metadata for threading.`);
      }
    }

    // Handle Telegram Delivery
    if (conversation.lastChannel === 'telegram' && conversation.userId?.telegramChatId) {
      const chatId = conversation.userId.telegramChatId;
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      
      console.log(`[TELEGRAM] Agent replying to chatId: ${chatId}`);
      try {
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          chat_id: chatId,
          text: content
        });
      } catch (tgErr) {
        console.error('[TELEGRAM] Agent reply failed:', tgErr.response?.data || tgErr.message);
      }
    }

    conversation.status = 'open';
    conversation.lastMessage = content.substring(0, 50);
    conversation.updatedAt = new Date();
    await conversation.save();

    // Emit Socket event so UI updates
    const io = req.app.get('socketio');
    if (io) {
      io.to(conversation._id.toString()).emit('new_message', {
        conversationId: conversation._id,
        message: newMessage,
        channel: conversation.lastChannel
      });
    }

    res.json({ message: newMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AI & ROUTING APIs ---

// --- AI & ROUTING APIs ---

router.get('/conversations/:id/ai-suggestion', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id).populate('userId');
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const name = conversation.userId?.name || 'Customer';
    const intent = conversation.intent || 'general query';
    
    // Simple logic-based suggestion (Note: messaging UI currently doesn't show this by request)
    let suggestion = `Hello ${name}, I understand you're reaching out about ${intent}. How can I assist you further?`;
    if (intent.toLowerCase().includes('loan')) {
      suggestion = `Hello ${name}, I see you're interested in our loan products. Based on your profile, I can help you check eligibility for an instant loan of up to ₹5,00,000. Would you like to proceed?`;
    } else if (intent.toLowerCase().includes('fraud')) {
       suggestion = `Hello ${name}, I've prioritized your fraud alert. I am reviewing the recent transactions on your account now. Please stay on the line.`;
    }

    res.json({ suggestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/dashboard/activity', async (req, res) => {
  try {
    // Fetch last 5 conversations as activity
    const recent = await Conversation.find()
      .populate('userId', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);

    const activities = recent.map(c => {
      let title = `New Conversation from ${c.userId?.name || 'User'}`;
      let type = 'neutral';
      
      if (c.status === 'resolved') {
        title = `Resolved Conversation with ${c.userId?.name || 'User'}`;
        type = 'success';
      } else if (c.status === 'escalated') {
        title = `Escalated Ticket for ${c.userId?.name || 'User'}`;
        type = 'alert';
      }

      return {
        title,
        time: `System • ${new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type
      };
    });

    res.json({ activities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/conversations/:id/assign', async (req, res) => {
  try {
    const { teamId, agentId } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(req.params.id, {
      assignedTeam: teamId || null,
      assignedTo: agentId || null,
      status: 'open'
    }, { new: true });

    // Emit socket event
    const io = req.app.get('socketio');
    if (io) {
      io.emit('conversation_updated', {
        conversationId: conversation._id,
        status: 'open',
        assignedTo: agentId || null,
        assignedTeam: teamId || null
      });
    }

    res.json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/conversations/:id/resolve', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    conversation.status = 'resolved';
    await conversation.save();

    // Increment agent resolvedToday count if one is assigned
    if (conversation.assignedTo) {
      await Agent.findByIdAndUpdate(conversation.assignedTo, {
        $inc: { resolvedToday: 1 }
      });
    }

    // Emit socket event
    const io = req.app.get('socketio');
    if (io) {
      io.emit('conversation_updated', {
        conversationId: conversation._id,
        status: 'resolved'
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/conversations/:id/escalate', async (req, res) => {
  try {
    const { targetAgentId } = req.body;
    const updateData = { status: 'escalated' };
    if (targetAgentId) {
      updateData.assignedTo = targetAgentId;
    }

    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).populate('assignedTo', 'name email');
    
    // Emit socket event
    const io = req.app.get('socketio');
    if (io) {
      io.emit('conversation_updated', {
        conversationId: conversation._id,
        status: 'escalated',
        assignedTo: conversation.assignedTo
      });
    }
    
    res.json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ANALYTICS APIs ---

router.get('/analytics/overview', async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments();
    const conversations = await Conversation.find().limit(100);
    
    // Calculate AI Resolution Rate
    const totalConvos = await Conversation.countDocuments();
    const resolvedConvos = await Conversation.countDocuments({ status: 'resolved' });
    const aiResolvedRate = totalConvos > 0 ? Math.round((resolvedConvos / totalConvos) * 100) : 0;

    // Calculate Avg Sentiment
    const sentimentSum = conversations.reduce((acc, c) => acc + (c.sentiment === 'positive' ? 5 : c.sentiment === 'neutral' ? 3 : 1), 0);
    const avgSentiment = conversations.length > 0 ? (sentimentSum / conversations.length).toFixed(1) : "0.0";
    
    // Calculate Sentiment Trend (Last 7 days vs previous 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    
    const recentConvos = await Conversation.find({ updatedAt: { $gte: sevenDaysAgo } });
    const olderConvos = await Conversation.find({ updatedAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } });
    
    const recentScore = recentConvos.reduce((acc, c) => acc + (c.sentiment === 'positive' ? 5 : c.sentiment === 'neutral' ? 3 : 1), 0) / (recentConvos.length || 1);
    const olderScore = olderConvos.reduce((acc, c) => acc + (c.sentiment === 'positive' ? 5 : c.sentiment === 'neutral' ? 3 : 1), 0) / (olderConvos.length || 1);
    
    const diff = recentScore - olderScore;
    const sentimentTrend = diff >= 0 ? `+${((diff/5)*100).toFixed(1)}%` : `${((diff/5)*100).toFixed(1)}%`;

    // Top Intent
    const intentCounts = {};
    conversations.forEach(c => {
      if (c.intent) intentCounts[c.intent] = (intentCounts[c.intent] || 0) + 1;
    });
    const topIntent = Object.entries(intentCounts).sort((a,b) => b[1] - a[1])[0] || ["General", 0];
    const topIntentRate = totalConvos > 0 ? Math.round((topIntent[1] / totalConvos) * 100) : 0;

    // NPS Calculation
    const promoters = conversations.filter(c => c.sentiment === 'positive').length;
    const detractors = conversations.filter(c => c.sentiment === 'negative').length;
    const nps = conversations.length > 0 ? Math.round(((promoters - detractors) / conversations.length) * 100) : 0;

    // Avg Confidence calculation
    const avgConfidenceResult = await Conversation.aggregate([
      { $group: { _id: null, avgConf: { $avg: "$aiConfidence" } } }
    ]);
    const modelConfidenceNum = avgConfidenceResult.length > 0 ? avgConfidenceResult[0].avgConf : 0;
    const modelConfidence = `${modelConfidenceNum.toFixed(1)}%`;

    // Messages per second (Last 24h)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const msgsLast24h = await Message.countDocuments({ timestamp: { $gte: last24h } });
    const avgMessagesPerSec = (msgsLast24h / 86400).toFixed(3);

    res.json({
      totalMessages,
      aiResolvedRate: `${aiResolvedRate}%`,
      avgSentiment,
      nps: nps.toFixed(1),
      sentimentTrend,
      topIntent: {
        name: topIntent[0],
        rate: `${topIntentRate}%`
      },
      aiMetrics: {
        modelConfidence,
        intentAccuracy: modelConfidence, // Using confidence as a proxy for accuracy since we don't have human validation data yet
        autoResolveRate: `${aiResolvedRate}%`,
        avgMessagesPerSec
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics/charts', async (req, res) => {
  try {
    // Channel Distribution
    const channelData = await Conversation.aggregate([
      { $group: { _id: "$lastChannel", count: { $sum: 1 } } }
    ]);

    // Intent Breakdown
    const intentData = await Conversation.aggregate([
      { $group: { _id: "$intent", count: { $sum: 1 } } }
    ]);

    // Sentiment Distribution
    const sentimentData = await Conversation.aggregate([
      { $group: { _id: "$sentiment", count: { $sum: 1 } } }
    ]);

    // Volume Chart (Last 7 days real aggregation)
    const volumeData = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0,0,0,0));
      const endOfDay = new Date(d.setHours(23,59,59,999));
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

      const counts = await Conversation.aggregate([
        { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: "$lastChannel", count: { $sum: 1 } } }
      ]);

      const dayObj = { name: dayName, WhatsApp: 0, Email: 0, WebChat: 0, Telegram: 0 };
      counts.forEach(c => {
        if (c._id === 'whatsapp') dayObj.WhatsApp = c.count;
        if (c._id === 'email') dayObj.Email = c.count;
        if (c._id === 'webchat') dayObj.WebChat = c.count;
        if (c._id === 'telegram') dayObj.Telegram = c.count;
      });
      volumeData.push(dayObj);
    }

    res.json({
      channels: channelData.map(d => ({ name: d._id || 'Unknown', value: d.count })),
      intents: intentData.map(d => ({ name: d._id || 'General', value: d.count })),
      sentiments: sentimentData.map(d => ({ name: d._id || 'Neutral', value: d.count })),
      volume: volumeData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/analytics/escalations', async (req, res) => {
  try {
    const escalations = await Conversation.find({ status: 'escalated' })
      .populate('userId', 'name phone')
      .populate('assignedTo', 'name')
      .limit(10);
    
    res.json({ escalations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TEAM & AGENT APIs ---

router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find();
    const agents = await Agent.find();
    const conversations = await Conversation.find();

    const teamsWithStats = teams.map(team => {
      const teamAgents = agents.filter(a => a.teamId && a.teamId.toString() === team._id.toString());
      const teamConvos = conversations.filter(c => c.assignedTeam && c.assignedTeam.toString() === team._id.toString());
      
      return {
        _id: team._id,
        name: team.name,
        tag: team.name.includes('Sales') ? 'HIGH AUTHORITY' : 'STANDARD',
        agents: teamAgents.length,
        active: teamConvos.length,
        description: team.description
      };
    });

    res.json({ teams: teamsWithStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/teams/:teamId/agents', async (req, res) => {
  try {
    const agents = await Agent.find({ teamId: req.params.teamId });
    res.json({ agents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/agents', async (req, res) => {
  try {
    const agents = await Agent.find().populate('teamId');
    res.json({ agents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SETTINGS APIs ---

router.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({}); // Create default settings if none exist
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const updates = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(updates);
    } else {
      // Deep merge or specific field updates
      if (updates.ai) settings.ai = { ...settings.ai, ...updates.ai };
      if (updates.branding) settings.branding = { ...settings.branding, ...updates.branding };
      if (updates.channels) settings.channels = { ...settings.channels, ...updates.channels };
      settings.updatedAt = Date.now();
    }
    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// BROADCAST APIs
// ─────────────────────────────────────────────
const Broadcast = require('../models/Broadcast');

// Helper: send a single broadcast
async function executeBroadcast(broadcast) {
  try {
    let users = [];
    if (broadcast.channel === 'telegram') {
      users = await User.find({ telegramChatId: { $exists: true, $ne: null } }, 'telegramChatId name').lean();
    } else {
      users = await User.find({ email: { $exists: true, $ne: null } }, 'email name').lean();
    }

    await Broadcast.findByIdAndUpdate(broadcast._id, {
      status: 'sending',
      totalRecipients: users.length,
    });

    let sentCount = 0;
    let failedCount = 0;

    for (const user of users) {
      try {
        if (broadcast.channel === 'telegram') {
          // Send via Telegram Bot API
          await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: user.telegramChatId,
            text: broadcast.body
          });
        } else {
          // Send via SMTP
          await transporter.sendMail({
            from: `"OMNI Platform" <${process.env.GMAIL_USER}>`,
            to: user.email,
            subject: broadcast.subject,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
                <h2 style="color: #1A2B4A; margin-bottom: 16px;">${broadcast.subject}</h2>
                <div style="color: #374151; line-height: 1.6; white-space: pre-line;">${broadcast.body}</div>
                <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
                <p style="color: #9CA3AF; font-size: 12px; text-align: center;">This message was sent via OMNI Platform.</p>
              </div>
            `,
          });
        }
        sentCount++;
      } catch (e) {
        console.error(`Broadcast failed for user ${user._id}:`, e.message);
        failedCount++;
      }
    }

    await Broadcast.findByIdAndUpdate(broadcast._id, {
      status: 'sent',
      sentCount,
      failedCount,
      sentAt: new Date(),
    });
  } catch (err) {
    console.error('Execute Broadcast Error:', err);
    await Broadcast.findByIdAndUpdate(broadcast._id, {
      status: 'failed',
      error: err.message,
    });
  }
}

// Background scheduler: poll every 30 seconds for scheduled broadcasts
setInterval(async () => {
  try {
    const due = await Broadcast.find({
      status: 'scheduled',
      scheduledAt: { $lte: new Date() },
    });
    for (const b of due) {
      executeBroadcast(b); // non-blocking
    }
  } catch (err) {
    console.error('[Broadcast Scheduler]', err.message);
  }
}, 30000);

// POST /broadcasts — create immediate or scheduled broadcast
router.post('/broadcasts', authenticateAgent, async (req, res) => {
  const { subject, body, scheduledAt, channel } = req.body;
  if (!body) {
    return res.status(400).json({ error: 'Message body is required.' });
  }
  if (channel === 'email' && !subject) {
    return res.status(400).json({ error: 'Subject is required for Email broadcasts.' });
  }

  try {
    const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();
    const broadcast = await Broadcast.create({
      subject: subject || 'No Subject',
      body,
      channel: channel || 'email',
      scheduledAt: isScheduled ? new Date(scheduledAt) : null,
      status: isScheduled ? 'scheduled' : 'queued',
      createdBy: req.agentId,
    });

    if (!isScheduled) {
      // Send immediately in background
      executeBroadcast(broadcast);
    }

    res.json({ success: true, broadcast });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /broadcasts — list all broadcasts
router.get('/broadcasts', authenticateAgent, async (req, res) => {
  try {
    const broadcasts = await Broadcast.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .lean();
    res.json({ broadcasts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /broadcasts/:id — cancel a scheduled broadcast
router.delete('/broadcasts/:id', authenticateAgent, async (req, res) => {
  try {
    const b = await Broadcast.findById(req.params.id);
    if (!b) return res.status(404).json({ error: 'Not found' });
    if (b.status !== 'scheduled') {
      return res.status(400).json({ error: 'Only scheduled broadcasts can be cancelled.' });
    }
    await Broadcast.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


