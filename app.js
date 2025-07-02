// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const axios = require('axios');
const cors = require('cors');
const ticketRoutes = require('./routes/ticketRoutes');
const app = express();
const port = 3001;

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/seis-support');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// SEIS API Proxy Endpoint
app.post('/api/seis-login', async (req, res) => {
  try {
    const response = await axios.post(
      'https://seis1.ocsc.go.th/api/user_detail_login/login',
      { PER_CARDNO: 1129900444776 },
      {
        headers: {
          'Authorization': 'Bearer c_V112c~-122d88B119b@J*Q71Y121Z87E119M109M@Y122F106Z106E@N109M122Y106Y119M106Z106Z68Z104N122B109O68c$',
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('SEIS API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to connect to SEIS API',
      details: error.response?.data || error.message
    });
  }
});

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.static('public'));

// Routes
app.use('/', ticketRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});