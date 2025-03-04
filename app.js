// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/helpdesk');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Schema
const ticketSchema = new mongoose.Schema({
    ticketNumber: { type: String, unique: true }, // Ticket number as string
    title: String,
    description: String,
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  
  // Pre-save middleware to generate ticket number
  ticketSchema.pre('save', async function (next) {
    if (!this.ticketNumber) {
      try {
        const lastTicket = await Ticket.findOne({}, {}, { sort: { ticketNumber: -1 } });
        let nextNumber = 1;
        if (lastTicket && lastTicket.ticketNumber) {
          const lastNumber = parseInt(lastTicket.ticketNumber.replace('SEIS', ''), 10);
          nextNumber = lastNumber + 1;
        }
        this.ticketNumber = `SEIS${String(nextNumber).padStart(7, '0')}`;
        next();
      } catch (err) {
        next(err);
      }
    } else {
      next();
    }
  });
  
  const Ticket = mongoose.model('Ticket', ticketSchema);
  
  // Middleware
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.set('view engine', 'ejs');
  app.use(express.static('public'));
  
  // Routes
  
  // Home Page (List Tickets - Admin view)
  app.get('/', async (req, res) => {
    try {
      const tickets = await Ticket.find().sort({ updatedAt: -1 });
      res.render('index', { tickets });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching tickets');
    }
  });
  
  // Create Ticket Form
  app.get('/create', (req, res) => {
    res.render('create');
  });
  
  // Create Ticket Post
  app.post('/create', async (req, res) => {
    try {
      const newTicket = new Ticket({
        title: req.body.title,
        description: req.body.description,
      });
      await newTicket.save();
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error creating ticket');
    }
  });
  
  // Update Ticket Form
  app.get('/update/:id', async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).send('Ticket not found');
      }
      res.render('update', { ticket });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching ticket for update');
    }
  });
  
  // Update Ticket Post
  app.post('/update/:id', async (req, res) => {
    try {
      const updatedTicket = await Ticket.findByIdAndUpdate(
        req.params.id,
        {
          title: req.body.title,
          description: req.body.description,
          status: req.body.status,
          updatedAt: Date.now(),
        },
        { new: true }
      );
      if (!updatedTicket) {
        return res.status(404).send('Ticket not found');
      }
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error updating ticket');
    }
  });
  
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });