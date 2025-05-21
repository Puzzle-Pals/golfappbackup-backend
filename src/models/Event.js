const mongoose = require('mongoose');

   const eventSchema = new mongoose.Schema({
     date: { type: String, required: true },
     time: { type: String, required: true },
     course: { type: String, required: true },
     details: { type: String },
   });

   module.exports = mongoose.model('Event', eventSchema);