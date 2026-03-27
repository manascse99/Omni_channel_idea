require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const Agent = require(path.join(__dirname, '../src/models/Agent'));
const Team = require(path.join(__dirname, '../src/models/Team'));

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas...');

    // Clear existing data
    await Agent.deleteMany({});
    await Team.deleteMany({});
    console.log('Cleared existing agents and teams...');

    // Create Teams
    const [salesTeam, supportTeam, fraudTeam] = await Team.create([
      { name: 'Sales Team', description: 'Handles loan and account opening queries' },
      { name: 'Customer Support', description: 'Handles general support and balance queries' },
      { name: 'Fraud & Alerts', description: 'Handles escalated fraud and transaction complaints' },
    ]);
    console.log('Created 3 teams...');

    // Create Agents
    const agents = await Agent.create([
      {
        name: 'Manas Srivastava',
        phone: '919999999999',
        email: 'manas@omnibank.ai',
        role: 'admin',
        teamId: salesTeam._id,
        status: 'online'
      },
      {
        name: 'Priya Sharma',
        phone: '919876543210',
        email: 'priya.sharma@omnibank.ai',
        role: 'agent',
        teamId: supportTeam._id,
        status: 'online'
      },
      {
        name: 'Karan Malhotra',
        phone: '919123456780',
        email: 'karan.malhotra@omnibank.ai',
        role: 'agent',
        teamId: fraudTeam._id,
        status: 'offline'
      },
      {
        name: 'Rima Desai',
        phone: '919000111222',
        email: 'rima.desai@omnibank.ai',
        role: 'agent',
        teamId: salesTeam._id,
        status: 'online'
      }
    ]);
    console.log(`Created ${agents.length} agents...`);

    console.log('\n✅ Database seeded successfully!');
    console.log('You can now log in using any of these agent phone numbers:');
    agents.forEach(a => {
      console.log(`   - Phone: ${a.phone}  |  Name: ${a.name}  |  Role: ${a.role}`);
    });
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDatabase();
