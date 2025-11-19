const Booking = require("../modals/booking-schema");
const Event = require("../modals/event-schema");
const Stripe = require("stripe");
const logger = require("../utils/logger");

const stripe = Stripe(process.env.STRIPE_KEY);

/**
 * Create a new booking
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
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

/**
 * Cancel a booking and process refund
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(401).json({
        message: "Unauthorized: Email required",
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId).populate('eventId');

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Authorization check
    if (booking.email !== email) {
      return res.status(403).json({
        message: "Forbidden: You can only cancel your own bookings",
      });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        message: "Booking already cancelled",
      });
    }

    // Check cancellation policy (e.g., can't cancel within 24 hours of event)
    const event = booking.eventId;
    const eventDate = new Date(event.date);
    const now = new Date();
    const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);

    if (hoursUntilEvent < 24) {
      return res.status(400).json({
        message: "Cannot cancel within 24 hours of event",
        hoursUntilEvent: Math.round(hoursUntilEvent),
      });
    }

    // Process refund if payment was made
    let refund = null;
    if (booking.paymentIntentId) {
      try {
        refund = await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
          reason: 'requested_by_customer',
        });

        logger.info('Refund processed', {
          bookingId: booking._id,
          refundId: refund.id,
          amount: refund.amount,
        });
      } catch (stripeError) {
        logger.error('Refund failed', {
          bookingId: booking._id,
          error: stripeError.message,
        });

        return res.status(500).json({
          message: "Cancellation initiated but refund failed. Please contact support.",
          error: stripeError.message,
        });
      }
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Decrement event attendees count
    await Event.findByIdAndUpdate(
      booking.eventId,
      { $inc: { attendees: -booking.quantity } },
      { new: true }
    );

    logger.info('Booking cancelled', {
      bookingId: booking._id,
      eventId: booking.eventId,
      refundId: refund?.id,
    });

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
      refund: refund ? {
        id: refund.id,
        amount: refund.amount / 100, // Convert cents to dollars
        status: refund.status,
      } : null,
    });

  } catch (err) {
    logger.error('Cancel booking failed', { error: err.message });
    return res.status(500).json({
      message: "Failed to cancel booking",
      error: err.message,
    });
  }
};

/**
 * Download ticket with QR code
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
exports.downloadTicket = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(401).json({
        message: "Unauthorized: Email required",
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId).populate('eventId');

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Authorization check
    if (booking.email !== email) {
      return res.status(403).json({
        message: "Forbidden: You can only download your own tickets",
      });
    }

    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        message: `Cannot download ticket. Booking status: ${booking.status}`,
      });
    }

    // Generate ticket with QR code
    try {
      const ticketService = require('../utils/ticketService');
      const ticket = await ticketService.createTicket(booking, booking.eventId);

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="ticket-${booking._id}.pdf"`
      );

      res.send(ticket.pdfBuffer);

      logger.info('Ticket downloaded', {
        bookingId: booking._id,
        ticketId: ticket.ticketId,
      });

    } catch (ticketError) {
      logger.error('Ticket generation failed', {
        bookingId: booking._id,
        error: ticketError.message,
      });

      return res.status(500).json({
        message: "Ticket generation failed. Install required packages: npm install qrcode pdfkit",
        error: ticketError.message,
      });
    }

  } catch (err) {
    logger.error('Download ticket failed', { error: err.message });
    return res.status(500).json({
      message: "Failed to download ticket",
      error: err.message,
    });
  }
};

/**
 * Verify a ticket QR code
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
exports.verifyTicket = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        message: "QR data required",
      });
    }

    const ticketService = require('../utils/ticketService');

    const findBooking = async (bookingId) => {
      return await Booking.findById(bookingId).populate('eventId');
    };

    const result = await ticketService.verifyTicket(qrData, findBooking);

    if (result.valid) {
      logger.info('Ticket verified', {
        ticketId: result.ticketData.ticketId,
        bookingId: result.ticketData.bookingId,
      });

      return res.status(200).json({
        valid: true,
        message: result.message,
        booking: result.booking,
        event: result.booking.eventId,
      });
    } else {
      return res.status(400).json({
        valid: false,
        message: result.message,
      });
    }

  } catch (err) {
    logger.error('Verify ticket failed', { error: err.message });
    return res.status(500).json({
      message: "Ticket verification failed",
      error: err.message,
    });
  }
};
