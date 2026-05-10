const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Expert = require('../models/Expert');

const createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { expertId, clientName, clientEmail, clientPhone, date, timeSlot, notes } = req.body;

    // Atomically find and mark slot as booked (no transaction needed)
    const expert = await Expert.findOneAndUpdate(
      {
        _id: expertId,
        isActive: true,
        'availability.date': date,
        'availability.slots': {
          $elemMatch: { time: timeSlot, isBooked: false },
        },
      },
      {
        $set: { 'availability.$[day].slots.$[slot].isBooked': true },
      },
      {
        arrayFilters: [{ 'day.date': date }, { 'slot.time': timeSlot, 'slot.isBooked': false }],
        new: true,
      }
    );

    if (!expert) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is no longer available. Please choose another slot.',
      });
    }

    const booking = await Booking.create({
      expert: expertId,
      expertName: expert.name,
      clientName,
      clientEmail,
      clientPhone,
      date,
      timeSlot,
      notes: notes || '',
      status: 'Pending',
    });

    // Link booking to slot
    await Expert.updateOne(
      { _id: expertId, 'availability.date': date },
      { $set: { 'availability.$[day].slots.$[slot].bookingId': booking._id } },
      { arrayFilters: [{ 'day.date': date }, { 'slot.time': timeSlot }] }
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`expert-${expertId}`).emit('slot-booked', { expertId, date, timeSlot, bookingId: booking._id });
    }

    res.status(201).json({ success: true, data: booking, message: 'Booking created successfully!' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'This slot was just booked. Please choose another.' });
    }
    console.error('createBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error creating booking' });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (status === 'Cancelled') {
      await Expert.updateOne(
        { _id: booking.expert, 'availability.date': booking.date },
        { $set: { 'availability.$[day].slots.$[slot].isBooked': false, 'availability.$[day].slots.$[slot].bookingId': null } },
        { arrayFilters: [{ 'day.date': booking.date }, { 'slot.time': booking.timeSlot }] }
      );
      const io = req.app.get('io');
      if (io) io.to(`expert-${booking.expert}`).emit('slot-freed', { expertId: booking.expert, date: booking.date, timeSlot: booking.timeSlot });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('updateBookingStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error updating booking' });
  }
};

const getBookingsByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const bookings = await Booking.find({ clientEmail: email.toLowerCase() })
      .populate('expert', 'name category avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bookings, total: bookings.length });
  } catch (error) {
    console.error('getBookingsByEmail error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching bookings' });
  }
};

module.exports = { createBooking, updateBookingStatus, getBookingsByEmail };