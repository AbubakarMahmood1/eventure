const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./config.env" });
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger');
const logger = require("./utils/logger");
const eventControllers = require("./controllers/event-controllers");
const bookingControllers = require("./controllers/booking-controllers");
const webhookControllers = require("./controllers/webhook-controllers");
const app = express();

// Middleware
app.use(cors());

// Stripe webhook needs raw body, so add it before express.json()
app.post("/api/webhook",
  express.raw({ type: 'application/json' }),
  webhookControllers.handleStripeWebhook
);

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

const DB = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB)
  .then(() => {
    logger.info("Database connected successfully");
  })
  .catch((err) => {
    logger.error("Database connection failed", { error: err.message });
    process.exit(1);
  });

/////----------------routes
// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//event routes
app.get("/", (req, res) => {
  return res.json({
    message: "Eventure API",
    version: "1.0.0",
    docs: "/api-docs"
  });
});
//event routes
app.post("/api/add-event", eventControllers.addEvent);
app.get("/api/get-events", eventControllers.getEvents);
app.delete("/api/delete-event", eventControllers.deleteEvent);
app.put("/api/update-event", eventControllers.updateEvent);
app.get("/api/get-event", eventControllers.getSingleEvent);
app.get("/api/get-featured-events", eventControllers.getFeaturedEvents);
app.get("/api/get-upcoming-events", eventControllers.getUpcomingEvents);
app.get("/api/get-all-events", eventControllers.getAllEvents);
app.post("/api/create-payment-intent", eventControllers.createPaymentIntent);
//booking routes
app.post("/api/add-booking", bookingControllers.addBooking);
app.get("/api/get-bookings", bookingControllers.getBookings);
app.post("/api/cancel-booking/:bookingId", bookingControllers.cancelBooking);
app.get("/api/download-ticket/:bookingId", bookingControllers.downloadTicket);
app.post("/api/verify-ticket", bookingControllers.verifyTicket);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
