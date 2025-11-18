const Booking = require("../modals/booking-schema");
const Event = require("../modals/event-schema");
exports.addBooking = async (req, res) => {
  try {
    const newBooking = await Booking.create(req.body);
    if (newBooking) {
      await Event.findByIdAndUpdate(
        req.body.eventId,
        { $inc: { attendees: 1 } }, // increment attendees by 1
        { new: true }
      );
    }
    return res.status(201).json({
      data: newBooking,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to create booking",
      error: err.message,
    });
  }
};
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ email: req.query.email }).populate(
      "eventId"
    );
    return res.status(200).json({
      bookings,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch bookings",
      error: err.message,
    });
  }
};
