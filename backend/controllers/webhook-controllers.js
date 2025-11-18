const Stripe = require("stripe");
const logger = require("../utils/logger");
const Booking = require("../modals/booking-schema");

const stripe = Stripe(process.env.STRIPE_KEY);

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error("Stripe webhook secret is not configured");
    return res.status(500).send("Webhook secret not configured");
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error("Webhook signature verification failed", { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        logger.info("PaymentIntent succeeded", {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount
        });

        // Update booking status to confirmed
        await Booking.findOneAndUpdate(
          { paymentIntentId: paymentIntent.id },
          { status: 'confirmed' },
          { new: true }
        );
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        logger.warn("PaymentIntent failed", {
          paymentIntentId: failedPayment.id
        });

        // Update booking status to pending or cancelled
        await Booking.findOneAndUpdate(
          { paymentIntentId: failedPayment.id },
          { status: 'cancelled' },
          { new: true }
        );
        break;

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object;
        logger.info("PaymentIntent canceled", {
          paymentIntentId: canceledPayment.id
        });

        await Booking.findOneAndUpdate(
          { paymentIntentId: canceledPayment.id },
          { status: 'cancelled' },
          { new: true }
        );
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    logger.error("Error processing webhook", {
      error: err.message,
      eventType: event.type
    });
    res.status(500).send("Webhook processing failed");
  }
};
