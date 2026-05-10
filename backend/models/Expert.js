const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  slots: [
    {
      time: { type: String, required: true }, // HH:MM
      isBooked: { type: Boolean, default: false },
      bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
    },
  ],
});

const expertSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Technology', 'Business', 'Design', 'Marketing', 'Finance', 'Health', 'Legal', 'Education'],
    },
    bio: { type: String, required: true },
    experience: { type: Number, required: true, min: 0 }, // years
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    hourlyRate: { type: Number, required: true },
    avatar: { type: String, default: '' },
    skills: [{ type: String }],
    availability: [timeSlotSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

expertSchema.index({ name: 'text', bio: 'text' });
expertSchema.index({ category: 1 });

module.exports = mongoose.model('Expert', expertSchema);
