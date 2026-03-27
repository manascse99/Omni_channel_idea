const mongoose = require('mongoose');
require('dotenv').config();

const clearData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear collections
    const collections = ['conversations', 'messages', 'users'];
    for (const cName of collections) {
      await mongoose.connection.collection(cName).deleteMany({});
      console.log(`Cleared ${cName} collection`);
    }

    console.log('--- Data Cleared Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing data:', err);
    process.exit(1);
  }
};

clearData();
