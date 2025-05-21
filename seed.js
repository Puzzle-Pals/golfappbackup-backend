require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hashedPassword = await bcrypt.hash('password123', 10);
  await User.deleteMany({});
  await User.create({ email: 'admin@example.com', password: hashedPassword });
  console.log('Admin user seeded');
  mongoose.connection.close();
}

seed();