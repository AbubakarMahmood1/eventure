const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create reusable transporter
const createTransporter = () => {
  // In development, use Ethereal (fake SMTP service)
  // In production, use real SMTP service (Gmail, SendGrid, etc.)

  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // Development: Log to console instead of sending
    return {
      sendMail: async (mailOptions) => {
        logger.info('Email would be sent (dev mode):', {
          to: mailOptions.to,
          subject: mailOptions.subject,
        });
        return { messageId: 'dev-' + Date.now() };
      },
    };
  }
};

const transporter = createTransporter();

// Send booking confirmation email
const sendBookingConfirmation = async (booking, event) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Eventure <noreply@eventure.com>',
      to: booking.email,
      subject: `Booking Confirmation - ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Booking Confirmed!</h1>
          <p>Hi ${booking.name},</p>
          <p>Your booking for <strong>${event.title}</strong> has been confirmed.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Event Details</h3>
            <p><strong>Event:</strong> ${event.title}</p>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Quantity:</strong> ${booking.quantity} ticket(s)</p>
            <p><strong>Total Paid:</strong> $${booking.totalPrice}</p>
          </div>

          <p>We look forward to seeing you at the event!</p>
          <p>Best regards,<br>The Eventure Team</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Booking confirmation email sent', {
      bookingId: booking._id,
      messageId: info.messageId,
    });
    return info;
  } catch (error) {
    logger.error('Failed to send booking confirmation email', {
      error: error.message,
      bookingId: booking._id,
    });
    throw error;
  }
};

// Send event creation confirmation to organizer
const sendEventCreatedEmail = async (event) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Eventure <noreply@eventure.com>',
      to: event.email,
      subject: `Event Created - ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Event Created Successfully!</h1>
          <p>Your event <strong>${event.title}</strong> has been created.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Event Details</h3>
            <p><strong>Title:</strong> ${event.title}</p>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Price:</strong> $${event.price}</p>
            ${event.capacity ? `<p><strong>Capacity:</strong> ${event.capacity}</p>` : ''}
          </div>

          <p>You can manage your event from the organizer dashboard.</p>
          <p>Best regards,<br>The Eventure Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Event creation email sent', {
      eventId: event._id,
      messageId: info.messageId,
    });
    return info;
  } catch (error) {
    logger.error('Failed to send event creation email', {
      error: error.message,
      eventId: event._id,
    });
    // Don't throw - email failure shouldn't block event creation
  }
};

module.exports = {
  sendBookingConfirmation,
  sendEventCreatedEmail,
};
