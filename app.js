// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ticketRoutes = require('./routes/ticketRoutes'); // Import the ticket routes
const app = express();
const port = 3001;

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/helpdesk');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Routes
app.use('/', ticketRoutes); // Use the ticket routes

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});