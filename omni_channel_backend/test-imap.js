const imaps = require('imap-simple');
require('dotenv').config({ path: '/Users/manassrivastava/Desktop/omni_channel/omni_channel_backend/.env' });

const config = {
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

async function testConnection() {
  try {
    console.log(`Connecting as ${config.imap.user}...`);
    const connection = await imaps.connect(config);
    console.log('SUCCESS: Connected to IMAP');
    
    await connection.openBox('INBOX');
    console.log('SUCCESS: Opened INBOX');
    
    const searchCriteria = ['UNSEEN'];
    const fetchOptions = { bodies: ['HEADER', 'TEXT', ''] };
    const messages = await connection.search(searchCriteria, fetchOptions);
    console.log(`FOUND: ${messages.length} UNSEEN messages`);
    
    connection.end();
  } catch (err) {
    console.error('ERROR:', err);
  }
}

testConnection();
