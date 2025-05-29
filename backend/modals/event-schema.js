const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema({
  attandees: {
    type: Number,
    default: 0,
  },
  date: {
    type: String,
    required: [true, "date required"],
  },
  description: {
    type: String,
    required: [true, "description is required"],
  },
  image: {
    type: String,
  },
  location: {
    type: String,
    required: [true, "location is required"],
  },
  price: {
    type: String,
    required: [true, "price is required"],
  },
  title: {
    type: String,
    required: [true, "title is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
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
});
const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
