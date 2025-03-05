// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const Ticket = require('../models/ticketModel');
const multer = require('multer');
const { Parser } = require('json2csv');

const storage = multer.memoryStorage(); // Store image in memory
const upload = multer({ storage: storage });

// Home Page (List Tickets - Admin view)
router.get('/', async (req, res) => {
    try {
      const tickets = await Ticket.find().sort({ updatedAt: -1 });
  
      // Get counts for each status
      const statusCounts = await Ticket.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
  
      // Convert to an object for easier access in the template
      const counts = {};
      statusCounts.forEach(item => {
        counts[item._id] = item.count;
      });
  
      res.render('index', { tickets, counts }); // Pass counts to the template
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
        description: req.body.description,
        name: req.body.name,
        menu: req.body.menu,
        phoneNumber: req.body.phoneNumber,
        lineID: req.body.lineID,
        category: req.body.category,
        image: req.file ? { // Conditionally add image data if it exists
          data: req.file.buffer,
          contentType: req.file.mimetype
        } : null 
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
router.post('/update/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = {
      description: req.body.description,
      status: req.body.status,
      name: req.body.name,
      menu: req.body.menu,
      phoneNumber: req.body.phoneNumber,
      lineID: req.body.lineID,
      category: req.body.category,
      updatedAt: Date.now(),
    };

    // Add image to update data if a new one was uploaded
    if (req.file) {
      updateData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateData,
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

router.get('/view/:id', async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).send('Ticket not found');
      }
      res.render('view', { ticket, readOnly: true }); // Pass readOnly flag
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching ticket for view');
    }
  });

router.get('/image/:id', async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id);
  
      if (!ticket) {
        return res.status(404).send('Ticket not found'); 
      }
  
      if (!ticket.image || !ticket.image.data || !ticket.image.contentType) {
        return res.status(404).send('Image not found'); 
      }
  
      res.set('Content-Type', ticket.image.contentType);
      res.send(ticket.image.data);
  
    } catch (err) {
      console.error(err); 
      res.status(500).send('Error fetching image'); 
    }
  });

  router.get('/export', async (req, res) => {
    try {
      const tickets = await Ticket.find().sort({ updatedAt: -1 });
  
      const fields = [
        'ticketNumber',
        'description',
        'status',
        'createdAt',
        'updatedAt',
        'name',
        'menu',
        'category',
        'phoneNumber',
        'lineID'
      ];
      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse(tickets);
  
      res.set('Content-Type', 'text/csv');
      res.set('Content-Disposition', 'attachment; filename="tickets.csv"');
      res.send(csv);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error exporting tickets');
    }
  });

  router.get('/terms', (req, res) => {
    res.render('terms');
  });

module.exports = router;