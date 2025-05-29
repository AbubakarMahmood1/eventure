const Booking = require("../modals/booking-schema");
const Event = require("../modals/event-schema");
exports.addBooking = async (req, res) => {
  try {
    console.log(req.body);
    const newBooking = await Booking.create(req.body);
    if (newBooking) {
      const updatedEvent = await Event.findByIdAndUpdate(
        req.body.eventId,
        { $inc: { attandees: 1 } }, // increment attendees by 1
        { new: true }
      );
      console.log(updatedEvent);
    }
    return res.status(200).json({
      data: newBooking,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
exports.getBookings = async (req, res) => {
  try {
    console.log("this runs");
    console.log(req.query.email);
    const bookings = await Booking.find({ email: req.query.email }).populate(
      "eventId"
    );
    // const bookings = await Booking.find().populate("eventId");
    console.log(bookings);
    return res.status(200).json({
      bookings,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
