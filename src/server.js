const express = require('express');
   const mongoose = require('mongoose');
   const cors = require('cors');
   const dotenv = require('dotenv');
   const eventRoutes = require('./routes/events');

   dotenv.config();

   const app = express();

   app.use(cors({
     origin: 'https://bp-golf-app.vercel.app',
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
   }));
   app.use(express.json());

   mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
     .then(() => console.log('MongoDB connected'))
     .catch(err => console.error(err));

   app.use('/api/events', eventRoutes);

   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));