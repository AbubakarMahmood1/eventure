const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./config.env" });
const eventControllers = require("./controllers/event-controllers");
const bookingControllers = require("./controllers/booking-controllers");
const app = express();
app.use(cors());
app.use(express.json());
const DB = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB)
  .then(() => {
    // Database connected successfully
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });

/////----------------routes
//event routes
app.get("/", (req, res) => {
  return res.send("hi from backend");
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
const PORT = process.env.PORT || 3000;
app.listen(PORT);
