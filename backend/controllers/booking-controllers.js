const Booking = require("../modals/booking-schema");
const Event = require("../modals/event-schema");
exports.addBooking = async (req, res) => {
  try {
    // Convert totalPrice from string to number
    const bookingData = {
      ...req.body,
      totalPrice: parseFloat(req.body.totalPrice),
    };

    // Check event capacity before creating booking
    const event = await Event.findById(req.body.eventId);
    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Check if event is sold out
    if (event.capacity && event.attendees >= event.capacity) {
      return res.status(400).json({
        message: "Event is sold out",
      });
    }

    // Check if quantity exceeds available capacity
    if (event.capacity && (event.attendees + req.body.quantity) > event.capacity) {
      const availableTickets = event.capacity - event.attendees;
      return res.status(400).json({
        message: `Only ${availableTickets} tickets remaining`,
        availableTickets,
      });
    }

    const newBooking = await Booking.create(bookingData);
    if (newBooking) {
      await Event.findByIdAndUpdate(
        req.body.eventId,
        { $inc: { attendees: req.body.quantity } }, // increment by quantity
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
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { email: req.query.email };

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("eventId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    return res.status(200).json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + bookings.length < total,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch bookings",
      error: err.message,
    });
  }
};
