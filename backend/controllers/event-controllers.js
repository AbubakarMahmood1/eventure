const Event = require("../modals/event-schema");
const Booking = require("../modals/booking-schema");
const Stripe = require("stripe");
exports.addEvent = async (req, res) => {
  try {
    const newEvent = await Event.create(req.body);
    if (newEvent) {
      return res.status(201).json({
        data: newEvent,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Failed to create event",
      error: err.message,
    });
  }
};
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ email: req.query.email });
    return res.status(200).json({
      data: events,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch events",
      error: err.message,
    });
  }
};
exports.deleteEvent = async (req, res) => {
  try {
    const { id, email } = req.query;

    if (!email) {
      return res.status(401).json({
        message: "Unauthorized: Email required",
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Authorization check: verify the user owns this event
    if (event.email !== email) {
      return res.status(403).json({
        message: "Forbidden: You can only delete your own events",
      });
    }

    await Event.findByIdAndDelete(id);
    // Delete all bookings associated with this event
    await Booking.deleteMany({ eventId: id });

    return res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to delete event",
      error: err.message,
    });
  }
};
exports.updateEvent = async (req, res) => {
  try {
    const { _id, email, ...updateData } = req.body.params.data;

    if (!email) {
      return res.status(401).json({
        message: "Unauthorized: Email required",
      });
    }

    const existingEvent = await Event.findById(_id);
    if (!existingEvent) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Authorization check: verify the user owns this event
    if (existingEvent.email !== email) {
      return res.status(403).json({
        message: "Forbidden: You can only update your own events",
      });
    }

    const event = await Event.findByIdAndUpdate(
      _id,
      { ...updateData, email: existingEvent.email }, // Preserve original email
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      event,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update event",
      error: err.message,
    });
  }
};
exports.getSingleEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.query.id);
    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }
    return res.status(200).json({
      event,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch event",
      error: err.message,
    });
  }
};

exports.getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).limit(6);

    return res.status(200).json({
      events,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch featured events",
      error: err.message,
    });
  }
};
exports.getUpcomingEvents = async (req, res) => {
  try {
    // Get today's date in "YYYY-MM-DD" format
    const today = new Date().toISOString().split("T")[0]; // e.g. "2025-05-22"

    const events = await Event.find({
      date: { $gte: today },
    })
      .sort({ date: 1 }) // earliest dates first
      .limit(6);
    return res.status(200).json({
      events,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch upcoming events",
      error: err.message,
    });
  }
};
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    return res.status(200).json({
      events,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch all events",
      error: err.message,
    });
  }
};

const stripe = Stripe(process.env.STRIPE_KEY);
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Invalid amount",
      });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents e.g., $10 = 1000
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create payment intent",
      error: error.message,
    });
  }
};
