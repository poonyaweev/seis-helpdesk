const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, unique: true },
  name: String,
  menu: String,
  category: { type: String, enum: ['Problem', 'Suggestion', 'Others'] },
  description: String,
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  image: {
    data: Buffer,
    contentType: String
  },
});

// Pre-save middleware to generate ticket number
ticketSchema.pre('save', async function (next) {
    if (!this.ticketNumber) {
      try {
        const lastTicket = await Ticket.findOne({}, {}, { sort: { ticketNumber: -1 } });
        let nextNumber = 1;
        if (lastTicket && lastTicket.ticketNumber) {
          const lastNumber = parseInt(lastTicket.ticketNumber.replace(/[^0-9]/g, ''), 10); 
          nextNumber = lastNumber + 1;
        }
        this.ticketNumber = `#${String(nextNumber).padStart(7, '0')}`;
        next();
      } catch (err) {
        next(err);
      }
    } else {
      next();
    }
  });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;