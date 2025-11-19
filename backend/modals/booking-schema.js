const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    trim: true,
    lowercase: true,
  },
  quantity: {
    type: Number,
    required: [true, "quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  totalPrice: {
    type: Number,
    required: [true, "totalPrice is required"],
    min: [0, "Total price cannot be negative"],
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: [true, "eventId is required"],
  },
  eventTitle: {
    type: String,
    required: [true, "event title is required"],
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "confirmed",
  },
  paymentIntentId: {
    type: String, // Stripe payment intent ID
    trim: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Add indexes for common queries
bookingSchema.index({ email: 1 });
bookingSchema.index({ eventId: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
