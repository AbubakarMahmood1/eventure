const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema({
  attendees: {
    type: Number,
    default: 0,
    min: [0, "Attendees cannot be negative"],
  },
  date: {
    type: Date,
    required: [true, "date required"],
  },
  description: {
    type: String,
    required: [true, "description is required"],
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    required: [true, "location is required"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "price is required"],
    min: [0, "Price cannot be negative"],
  },
  capacity: {
    type: Number,
    default: null, // null means unlimited
    min: [1, "Capacity must be at least 1"],
  },
  title: {
    type: String,
    required: [true, "title is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    trim: true,
    lowercase: true,
  },
  selectedCategory: {
    label: {
      type: String,
      required: [true, "label is required"],
    },
    value: {
      type: String,
      required: [true, "value is required"],
    },
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Add index for common queries
eventSchema.index({ email: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ createdAt: -1 });

// Virtual for checking if event is sold out
eventSchema.virtual('isSoldOut').get(function() {
  if (!this.capacity) return false;
  return this.attendees >= this.capacity;
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
