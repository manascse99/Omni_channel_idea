const axios = require('axios');
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const NGROK_URL = 'https://insectlike-fertilely-dino.ngrok-free.dev';
const WEBHOOK_URL = `${NGROK_URL}/webhook/telegram`;

async function setWebhook() {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}`);
    console.log('TELEGRAM_WEBHOOK_STATUS:', response.data);
  } catch (error) {
    console.error('FAILED_TO_SET_WEBHOOK:', error.response?.data || error.message);
  }
}

setWebhook();
