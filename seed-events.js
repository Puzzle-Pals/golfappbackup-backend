require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

async function seedEvents() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is undefined');
    }
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected for seeding');
    await Event.deleteMany({});
    await Event.create([
      {
        date: '2025-06-01',
        course: 'Lake of the Sandhills',
        time: '10:00 AM',
        details: 'Weekly League Event',
      },
      {
        date: '2025-06-08',
        course: 'Lake of the Sandhills',
        time: '10:00 AM',
        details: 'Weekly League Event',
      },
    ]);
    console.log('Events seeded successfully');
  } catch (err) {
    console.error('Seeding error:', err.message, err.stack);
  } finally {
    mongoose.connection.close();
  }
}

seedEvents();