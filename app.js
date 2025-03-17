// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const ticketRoutes = require('./routes/ticketRoutes');
const app = express();
const port = 3001;

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/seis_support');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.static('public'));

// Routes
app.use('/', ticketRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});