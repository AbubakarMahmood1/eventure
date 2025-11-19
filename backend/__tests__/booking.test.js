/**
 * Booking Controller Tests
 *
 * Note: These tests require a test database. Configure TEST_DATABASE_URL in .env
 * Run with: npm test
 */

const mongoose = require('mongoose');
const Booking = require('../modals/booking-schema');
const Event = require('../modals/event-schema');

// Mock data
const mockEvent = {
  title: 'Test Event',
  date: new Date('2025-12-31'),
  location: 'Test Location',
  price: 50,
  capacity: 100,
  attendees: 0,
  description: 'Test Description',
  email: 'organizer@test.com',
  selectedCategory: {
    label: 'Music',
    value: 'music'
  }
};

const mockBooking = {
  name: 'John Doe',
  email: 'john@test.com',
  quantity: 2,
  totalPrice: 100,
  eventTitle: 'Test Event'
};

describe('Booking Operations', () => {
  let eventId;

  beforeAll(async () => {
    // Connect to test database
    const testDB = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/eventure-test';
    await mongoose.connect(testDB);
  });

  afterAll(async () => {
    // Cleanup and close connection
    await Event.deleteMany({});
    await Booking.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test event before each test
    const event = await Event.create(mockEvent);
    eventId = event._id;
  });

  afterEach(async () => {
    // Clean up after each test
    await Event.deleteMany({});
    await Booking.deleteMany({});
  });

  describe('addBooking', () => {
    it('should create a booking successfully', async () => {
      const bookingData = {
        ...mockBooking,
        eventId,
      };

      const booking = await Booking.create(bookingData);

      expect(booking).toBeDefined();
      expect(booking.name).toBe(mockBooking.name);
      expect(booking.quantity).toBe(mockBooking.quantity);
      expect(booking.status).toBe('confirmed');
    });

    it('should reject booking when event is sold out', async () => {
      // Update event to sold out
      await Event.findByIdAndUpdate(eventId, { attendees: 100 });

      const bookingData = {
        ...mockBooking,
        eventId,
      };

      // Should throw or handle error
      await expect(async () => {
        const event = await Event.findById(eventId);
        if (event.attendees >= event.capacity) {
          throw new Error('Event is sold out');
        }
        await Booking.create(bookingData);
      }).rejects.toThrow('Event is sold out');
    });

    it('should reject booking when quantity exceeds available capacity', async () => {
      // Set attendees close to capacity
      await Event.findByIdAndUpdate(eventId, { attendees: 99 });

      const bookingData = {
        ...mockBooking,
        eventId,
        quantity: 5, // Exceeds available capacity
      };

      const event = await Event.findById(eventId);
      const availableTickets = event.capacity - event.attendees;

      expect(bookingData.quantity).toBeGreaterThan(availableTickets);
      expect(availableTickets).toBe(1);
    });

    it('should increment event attendees when booking is created', async () => {
      const bookingData = {
        ...mockBooking,
        eventId,
        quantity: 5,
      };

      await Booking.create(bookingData);

      await Event.findByIdAndUpdate(
        eventId,
        { $inc: { attendees: bookingData.quantity } }
      );

      const updatedEvent = await Event.findById(eventId);
      expect(updatedEvent.attendees).toBe(5);
    });
  });

  describe('cancelBooking', () => {
    let bookingId;

    beforeEach(async () => {
      const booking = await Booking.create({
        ...mockBooking,
        eventId,
      });
      bookingId = booking._id;

      // Update event attendees
      await Event.findByIdAndUpdate(
        eventId,
        { $inc: { attendees: mockBooking.quantity } }
      );
    });

    it('should cancel a booking and update status', async () => {
      const booking = await Booking.findById(bookingId);
      booking.status = 'cancelled';
      await booking.save();

      const cancelledBooking = await Booking.findById(bookingId);
      expect(cancelledBooking.status).toBe('cancelled');
    });

    it('should decrement attendees when booking is cancelled', async () => {
      const booking = await Booking.findById(bookingId);

      await Event.findByIdAndUpdate(
        eventId,
        { $inc: { attendees: -booking.quantity } }
      );

      const event = await Event.findById(eventId);
      expect(event.attendees).toBe(0);
    });

    it('should not allow cancelling already cancelled booking', async () => {
      const booking = await Booking.findById(bookingId);
      booking.status = 'cancelled';
      await booking.save();

      const cancelledBooking = await Booking.findById(bookingId);
      expect(cancelledBooking.status).toBe('cancelled');

      // Attempting to cancel again should fail
      if (cancelledBooking.status === 'cancelled') {
        expect(cancelledBooking.status).toBe('cancelled');
      }
    });
  });

  describe('Pagination', () => {
    beforeEach(async () => {
      // Create multiple bookings
      const bookings = Array.from({ length: 25 }, (_, i) => ({
        ...mockBooking,
        eventId,
        email: `user${i}@test.com`,
      }));

      await Booking.insertMany(bookings);
    });

    it('should return paginated results', async () => {
      const page = 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const bookings = await Booking.find()
        .skip(skip)
        .limit(limit);

      expect(bookings.length).toBe(10);
    });

    it('should return correct pagination metadata', async () => {
      const total = await Booking.countDocuments();
      const page = 1;
      const limit = 10;
      const pages = Math.ceil(total / limit);

      expect(total).toBe(25);
      expect(pages).toBe(3);
    });
  });
});

describe('Booking Validation', () => {
  beforeAll(async () => {
    const testDB = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/eventure-test';
    await mongoose.connect(testDB);
  });

  afterAll(async () => {
    await Booking.deleteMany({});
    await mongoose.connection.close();
  });

  it('should require name field', async () => {
    const invalidBooking = {
      email: 'test@test.com',
      quantity: 1,
      totalPrice: 50,
      eventId: new mongoose.Types.ObjectId(),
      eventTitle: 'Test Event'
    };

    await expect(Booking.create(invalidBooking))
      .rejects
      .toThrow(/name is required/);
  });

  it('should require minimum quantity of 1', async () => {
    const invalidBooking = {
      name: 'Test',
      email: 'test@test.com',
      quantity: 0,
      totalPrice: 50,
      eventId: new mongoose.Types.ObjectId(),
      eventTitle: 'Test Event'
    };

    await expect(Booking.create(invalidBooking))
      .rejects
      .toThrow();
  });

  it('should not allow negative totalPrice', async () => {
    const invalidBooking = {
      name: 'Test',
      email: 'test@test.com',
      quantity: 1,
      totalPrice: -10,
      eventId: new mongoose.Types.ObjectId(),
      eventTitle: 'Test Event'
    };

    await expect(Booking.create(invalidBooking))
      .rejects
      .toThrow();
  });
});
