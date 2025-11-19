/**
 * Ticket Generation Service with QR Codes
 * @module utils/ticketService
 *
 * Install dependencies:
 * npm install qrcode pdfkit
 */

const logger = require('./logger');

// Lazy load to avoid errors if not installed
let QRCode = null;
let PDFDocument = null;

try {
  QRCode = require('qrcode');
  PDFDocument = require('pdfkit');
} catch (error) {
  logger.warn('QRCode or PDFKit not installed. Run: npm install qrcode pdfkit');
}

/**
 * Generate a unique ticket ID
 * @param {string} bookingId - MongoDB booking ID
 * @param {string} eventId - MongoDB event ID
 * @returns {string} Unique ticket ID
 */
const generateTicketId = (bookingId, eventId) => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `TKT-${timestamp}-${random}-${bookingId.slice(-6)}`.toUpperCase();
};

/**
 * Generate QR code data URL
 * @param {Object} ticketData - Ticket information
 * @returns {Promise<string>} QR code as data URL
 */
const generateQRCode = async (ticketData) => {
  if (!QRCode) {
    throw new Error('QRCode library not installed');
  }

  try {
    const qrData = JSON.stringify({
      ticketId: ticketData.ticketId,
      bookingId: ticketData.bookingId,
      eventId: ticketData.eventId,
      email: ticketData.email,
      quantity: ticketData.quantity,
      timestamp: ticketData.timestamp,
    });

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
    });

    return qrCodeDataURL;
  } catch (error) {
    logger.error('Failed to generate QR code:', error);
    throw error;
  }
};

/**
 * Generate ticket PDF
 * @param {Object} ticketData - Ticket information
 * @param {Object} event - Event details
 * @param {Object} booking - Booking details
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateTicketPDF = async (ticketData, event, booking) => {
  if (!PDFDocument || !QRCode) {
    throw new Error('PDFKit or QRCode library not installed');
  }

  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      // Collect PDF data
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Generate QR code
      const qrCodeDataURL = await generateQRCode(ticketData);
      const qrCodeBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');

      // Header
      doc.fontSize(28)
        .fillColor('#7c3aed')
        .text('EVENTURE', { align: 'center' });

      doc.moveDown(0.5);

      // Event Title
      doc.fontSize(24)
        .fillColor('#000')
        .text(event.title, { align: 'center' });

      doc.moveDown(1);

      // Event Details Box
      doc.rect(50, doc.y, doc.page.width - 100, 200)
        .lineWidth(2)
        .strokeColor('#7c3aed')
        .stroke();

      doc.moveDown(1);

      // Event Information
      const eventInfoY = doc.y;
      doc.fontSize(14)
        .fillColor('#333');

      doc.text(`Date: ${new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 70, eventInfoY);

      doc.text(`Location: ${event.location}`, 70);
      doc.text(`Price: $${event.price} per ticket`, 70);
      doc.text(`Quantity: ${booking.quantity} ticket(s)`, 70);
      doc.text(`Total Paid: $${booking.totalPrice}`, 70);

      doc.moveDown(3);

      // Ticket Holder Information
      doc.fontSize(16)
        .fillColor('#7c3aed')
        .text('Ticket Holder', { underline: true });

      doc.moveDown(0.5);

      doc.fontSize(14)
        .fillColor('#333')
        .text(`Name: ${booking.name}`, 70)
        .text(`Email: ${booking.email}`, 70);

      doc.moveDown(2);

      // QR Code
      doc.fontSize(16)
        .fillColor('#7c3aed')
        .text('Scan to Verify', { align: 'center' });

      doc.moveDown(0.5);

      // Center QR code
      const qrX = (doc.page.width - 200) / 2;
      doc.image(qrCodeBuffer, qrX, doc.y, { width: 200 });

      doc.moveDown(12);

      // Ticket ID
      doc.fontSize(12)
        .fillColor('#666')
        .text(`Ticket ID: ${ticketData.ticketId}`, { align: 'center' });

      doc.moveDown(0.5);

      doc.fontSize(10)
        .fillColor('#999')
        .text(`Booking ID: ${ticketData.bookingId}`, { align: 'center' });

      // Footer
      doc.moveDown(2);
      doc.fontSize(10)
        .fillColor('#999')
        .text('Please present this ticket at the venue entrance', { align: 'center' })
        .text('For support, contact: support@eventure.com', { align: 'center' });

      // Finalize PDF
      doc.end();

    } catch (error) {
      logger.error('Failed to generate PDF:', error);
      reject(error);
    }
  });
};

/**
 * Verify a ticket QR code
 * @param {string} qrData - QR code data (JSON string)
 * @param {Function} findBooking - Function to find booking in database
 * @returns {Promise<Object>} Verification result
 */
const verifyTicket = async (qrData, findBooking) => {
  try {
    const ticketData = JSON.parse(qrData);

    if (!ticketData.ticketId || !ticketData.bookingId) {
      return {
        valid: false,
        message: 'Invalid ticket format',
      };
    }

    // Find booking in database
    const booking = await findBooking(ticketData.bookingId);

    if (!booking) {
      return {
        valid: false,
        message: 'Ticket not found',
      };
    }

    if (booking.status === 'cancelled') {
      return {
        valid: false,
        message: 'Ticket has been cancelled',
      };
    }

    if (booking.eventId.toString() !== ticketData.eventId) {
      return {
        valid: false,
        message: 'Event mismatch',
      };
    }

    return {
      valid: true,
      message: 'Ticket verified successfully',
      booking,
      ticketData,
    };

  } catch (error) {
    logger.error('Ticket verification failed:', error);
    return {
      valid: false,
      message: 'Verification failed',
      error: error.message,
    };
  }
};

/**
 * Create complete ticket package
 * @param {Object} booking - Booking object
 * @param {Object} event - Event object
 * @returns {Promise<Object>} Ticket data with QR and PDF
 */
const createTicket = async (booking, event) => {
  const ticketId = generateTicketId(booking._id.toString(), event._id.toString());

  const ticketData = {
    ticketId,
    bookingId: booking._id.toString(),
    eventId: event._id.toString(),
    email: booking.email,
    quantity: booking.quantity,
    timestamp: Date.now(),
  };

  const qrCodeDataURL = await generateQRCode(ticketData);
  const pdfBuffer = await generateTicketPDF(ticketData, event, booking);

  return {
    ticketId,
    qrCodeDataURL,
    pdfBuffer,
    ticketData,
  };
};

module.exports = {
  generateTicketId,
  generateQRCode,
  generateTicketPDF,
  verifyTicket,
  createTicket,
};
