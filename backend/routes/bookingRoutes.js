const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createBooking, updateBookingStatus, getBookingsByEmail } = require('../controllers/bookingController');

const bookingValidation = [
  body('expertId').notEmpty().withMessage('Expert ID is required').isMongoId().withMessage('Invalid expert ID'),
  body('clientName')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('clientEmail')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('clientPhone')
    .notEmpty().withMessage('Phone is required')
    .matches(/^[+]?[\d\s\-().]{7,20}$/).withMessage('Please provide a valid phone number'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format')
    .custom((value) => {
      const today = new Date().toISOString().split('T')[0];
      if (value < today) throw new Error('Date cannot be in the past');
      return true;
    }),
  body('timeSlot')
    .notEmpty().withMessage('Time slot is required')
    .matches(/^\d{2}:\d{2}$/).withMessage('Time slot must be in HH:MM format'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

router.get('/', getBookingsByEmail);
router.post('/', bookingValidation, createBooking);
router.patch('/:id/status', updateBookingStatus);

module.exports = router;
