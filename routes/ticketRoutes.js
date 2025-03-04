// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const Ticket = require('../models/ticketModel');
const multer = require('multer');

const storage = multer.memoryStorage(); // Store image in memory
const upload = multer({ storage: storage });

// Home Page (List Tickets - Admin view)
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ updatedAt: -1 });
    res.render('index', { tickets });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching tickets');
  }
});

// Create Ticket Form
router.get('/create', (req, res) => {
  res.render('create');
});

// Create Ticket Post
router.post('/create', upload.single('image'), async (req, res) => {
    try {
      const newTicket = new Ticket({
        title: req.body.title,
        description: req.body.description,
        image: {
          data: req.file.buffer,
          contentType: req.file.mimetype
        }
      });
      await newTicket.save();
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error creating ticket');
    }
  });

// Update Ticket Form
router.get('/update/:id', async (req, res) => {
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
router.post('/update/:id', async (req, res) => {
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

router.get('/image/:id', async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket || !ticket.image) {
        return res.status(404).send('Image not found');
      }
      res.set('Content-Type', ticket.image.contentType);
      res.send(ticket.image.data);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching image');
    }
  });

module.exports = router;