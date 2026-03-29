const { Client, GatewayIntentBits } = require('discord.js');
const identityService = require('./identityService');
const conversationService = require('./conversationService');

class DiscordService {
  constructor(io, socketService) {
    this.io = io;
    this.socketService = socketService;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    this.token = process.env.DISCORD_BOT_TOKEN;
  }

  async start() {
    if (!this.token) {
      console.warn('Discord Bot: DISCORD_BOT_TOKEN is missing. Skipping initialization.');
      return;
    }

    this.client.on('ready', () => {
      console.log(`Discord Bot: Logged in as ${this.client.user.tag}!`);
    });

    this.client.on('messageCreate', async (message) => {
      // 1. Ignore bot messages
      if (message.author.bot) return;

      try {
        const { content, author, channel } = message;
        const discordUserId = author.id;
        const channelId = channel.id;
        const name = author.username;

        console.log(`Discord Bot: Message from ${name} (${discordUserId}) in channel ${channelId}`);

        // 2. Resolve Identity
        const { user } = await identityService.resolveIdentity('discord', discordUserId, name);

        // 3. Process Message (FAST)
        const result = await conversationService.processIncomingMessage(user, 'discord', content, {
          discordUserId,
          channelId
        });

        // --- INSTANT UI UPDATE ---
        if (this.socketService) {
          this.socketService.emitNewMessage(result.conversation._id, result.newMessage);
        }

        // 4. BACKGROUND AI Analysis (SLOW)
        conversationService.applyAiAnalysis(
          result.conversation._id, 
          result.newMessage._id, 
          content,
          this.socketService
        );

        console.log(`Discord Bot: Message ingested (FAST) for ${name}. AI running in background.`);
      } catch (error) {
        console.error('Discord Bot: Error processing message:', error);
      }
    });

    try {
      await this.client.login(this.token);
    } catch (error) {
      console.error('Discord Bot: Failed to login:', error.message);
    }
  }

  async sendDiscordMessage(channelId, text) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel && typeof channel.send === 'function') {
        await channel.send(text);
        console.log(`Discord Bot: Replied to channel ${channelId}`);
      } else {
        console.error(`Discord Bot: Could not find channel ${channelId} or it's not a text channel.`);
      }
    } catch (error) {
      console.error('Discord Bot: Error sending message:', error.message);
      throw error;
    }
  }
}

module.exports = DiscordService;
