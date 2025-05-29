const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
  quantity: {
    type: Number,
    required: [true, "quantity is required"],
  },
  totalPrice: {
    type: String,
    required: [true, "totalPrice is required"],
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event", // The model name of the referenced collection
    required: [true, "eventId is required"],
  },
  eventTitle: {
    type: String,
    required: [true, "event title is required"],
  },
});
const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
