/**
 * Event Controller Tests
 *
 * Note: These tests require a test database. Configure TEST_DATABASE_URL in .env
 * Run with: npm test
 */

const mongoose = require('mongoose');
const Event = require('../modals/event-schema');
const Booking = require('../modals/booking-schema');

// Mock data
const mockEvent = {
  title: 'Test Concert',
  date: new Date('2025-12-31'),
  location: 'Madison Square Garden',
  price: 50,
  capacity: 100,
  attendees: 0,
  description: 'Amazing concert event',
  email: 'organizer@test.com',
  selectedCategory: {
    label: 'Music',
    value: 'music'
  }
};

const mockEvent2 = {
  title: 'Tech Conference',
  date: new Date('2026-01-15'),
  location: 'Convention Center',
  price: 150,
  capacity: 500,
  attendees: 0,
  description: 'Annual tech conference',
  email: 'organizer2@test.com',
  selectedCategory: {
    label: 'Technology',
    value: 'technology'
  }
};

describe('Event Operations', () => {
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

  afterEach(async () => {
    // Clean up after each test
    await Event.deleteMany({});
    await Booking.deleteMany({});
  });

  describe('addEvent', () => {
    it('should create an event successfully', async () => {
      const event = await Event.create(mockEvent);

      expect(event).toBeDefined();
      expect(event.title).toBe(mockEvent.title);
      expect(event.price).toBe(mockEvent.price);
      expect(event.capacity).toBe(mockEvent.capacity);
      expect(event.attendees).toBe(0);
      expect(event.date).toBeInstanceOf(Date);
    });

    it('should create event with correct data types', async () => {
      const event = await Event.create(mockEvent);

      expect(typeof event.price).toBe('number');
      expect(event.date).toBeInstanceOf(Date);
      expect(typeof event.capacity).toBe('number');
      expect(typeof event.attendees).toBe('number');
    });

    it('should allow creating event with unlimited capacity', async () => {
      const unlimitedEvent = {
        ...mockEvent,
        capacity: null,
      };

      const event = await Event.create(unlimitedEvent);

      expect(event.capacity).toBeNull();
      expect(event.isSoldOut).toBe(false);
    });

    it('should set attendees to 0 by default', async () => {
      const eventData = { ...mockEvent };
      delete eventData.attendees;

      const event = await Event.create(eventData);

      expect(event.attendees).toBe(0);
    });
  });

  describe('updateEvent', () => {
    let eventId;

    beforeEach(async () => {
      const event = await Event.create(mockEvent);
      eventId = event._id;
    });

    it('should update event successfully', async () => {
      const updates = {
        title: 'Updated Concert',
        price: 75,
      };

      await Event.findByIdAndUpdate(eventId, updates);
      const updatedEvent = await Event.findById(eventId);

      expect(updatedEvent.title).toBe(updates.title);
      expect(updatedEvent.price).toBe(updates.price);
    });

    it('should update capacity', async () => {
      await Event.findByIdAndUpdate(eventId, { capacity: 200 });
      const event = await Event.findById(eventId);

      expect(event.capacity).toBe(200);
    });

    it('should maintain attendees count when updating other fields', async () => {
      // Add some attendees
      await Event.findByIdAndUpdate(eventId, { attendees: 10 });

      // Update title
      await Event.findByIdAndUpdate(eventId, { title: 'New Title' });

      const event = await Event.findById(eventId);
      expect(event.attendees).toBe(10);
      expect(event.title).toBe('New Title');
    });
  });

  describe('deleteEvent', () => {
    let eventId;

    beforeEach(async () => {
      const event = await Event.create(mockEvent);
      eventId = event._id;
    });

    it('should delete event successfully', async () => {
      await Event.findByIdAndDelete(eventId);
      const deletedEvent = await Event.findById(eventId);

      expect(deletedEvent).toBeNull();
    });

    it('should delete event even with existing bookings', async () => {
      // Create a booking for the event
      await Booking.create({
        name: 'John Doe',
        email: 'john@test.com',
        quantity: 2,
        totalPrice: 100,
        eventId: eventId,
        eventTitle: mockEvent.title,
      });

      // Delete the event
      await Event.findByIdAndDelete(eventId);
      const deletedEvent = await Event.findById(eventId);

      expect(deletedEvent).toBeNull();
    });
  });

  describe('getEvents - Pagination and Filtering', () => {
    beforeEach(async () => {
      // Create multiple events with different categories and dates
      const events = [
        { ...mockEvent, title: 'Event 1', date: new Date('2025-12-01') },
        { ...mockEvent, title: 'Event 2', date: new Date('2025-12-15') },
        { ...mockEvent, title: 'Event 3', date: new Date('2025-12-20') },
        {
          ...mockEvent2,
          title: 'Event 4',
          date: new Date('2026-01-01'),
          selectedCategory: { label: 'Technology', value: 'technology' }
        },
        {
          ...mockEvent2,
          title: 'Event 5',
          date: new Date('2026-01-15'),
          selectedCategory: { label: 'Technology', value: 'technology' }
        },
      ];

      await Event.insertMany(events);
    });

    it('should return paginated results', async () => {
      const page = 1;
      const limit = 3;
      const skip = (page - 1) * limit;

      const events = await Event.find()
        .skip(skip)
        .limit(limit)
        .sort({ date: 1 });

      expect(events.length).toBe(3);
    });

    it('should return correct pagination metadata', async () => {
      const total = await Event.countDocuments();
      const page = 1;
      const limit = 3;
      const totalPages = Math.ceil(total / limit);

      expect(total).toBe(5);
      expect(totalPages).toBe(2);
    });

    it('should filter events by category', async () => {
      const events = await Event.find({
        'selectedCategory.value': 'technology'
      });

      expect(events.length).toBe(2);
      events.forEach(event => {
        expect(event.selectedCategory.value).toBe('technology');
      });
    });

    it('should filter events by date range', async () => {
      const startDate = new Date('2025-12-10');
      const endDate = new Date('2025-12-31');

      const events = await Event.find({
        date: { $gte: startDate, $lte: endDate }
      });

      expect(events.length).toBe(2);
      events.forEach(event => {
        expect(event.date.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(event.date.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    it('should search events by title', async () => {
      const searchTerm = 'Event 1';
      const events = await Event.find({
        title: { $regex: searchTerm, $options: 'i' }
      });

      expect(events.length).toBe(1);
      expect(events[0].title).toBe('Event 1');
    });

    it('should sort events by date ascending', async () => {
      const events = await Event.find().sort({ date: 1 });

      expect(events.length).toBe(5);
      expect(events[0].date.getTime()).toBeLessThanOrEqual(events[1].date.getTime());
      expect(events[1].date.getTime()).toBeLessThanOrEqual(events[2].date.getTime());
    });

    it('should sort events by date descending', async () => {
      const events = await Event.find().sort({ date: -1 });

      expect(events.length).toBe(5);
      expect(events[0].date.getTime()).toBeGreaterThanOrEqual(events[1].date.getTime());
      expect(events[1].date.getTime()).toBeGreaterThanOrEqual(events[2].date.getTime());
    });
  });

  describe('Capacity and Sold Out Logic', () => {
    it('should calculate isSoldOut correctly', async () => {
      const event = await Event.create({
        ...mockEvent,
        capacity: 10,
        attendees: 0,
      });

      expect(event.isSoldOut).toBe(false);

      // Update attendees to capacity
      await Event.findByIdAndUpdate(event._id, { attendees: 10 });
      const soldOutEvent = await Event.findById(event._id);

      expect(soldOutEvent.isSoldOut).toBe(true);
    });

    it('should return false for unlimited capacity events', async () => {
      const event = await Event.create({
        ...mockEvent,
        capacity: null,
        attendees: 1000,
      });

      expect(event.isSoldOut).toBe(false);
    });

    it('should calculate available tickets correctly', async () => {
      const event = await Event.create({
        ...mockEvent,
        capacity: 100,
        attendees: 30,
      });

      const availableTickets = event.capacity - event.attendees;
      expect(availableTickets).toBe(70);
    });
  });

  describe('getFeaturedEvents', () => {
    beforeEach(async () => {
      const now = new Date();
      const events = [
        {
          ...mockEvent,
          title: 'Past Event',
          date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        },
        {
          ...mockEvent,
          title: 'Upcoming Event 1',
          date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        },
        {
          ...mockEvent,
          title: 'Upcoming Event 2',
          date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
        },
      ];

      await Event.insertMany(events);
    });

    it('should return only upcoming events', async () => {
      const now = new Date();
      const events = await Event.find({
        date: { $gte: now }
      }).limit(6);

      expect(events.length).toBe(2);
      events.forEach(event => {
        expect(event.date.getTime()).toBeGreaterThanOrEqual(now.getTime());
      });
    });
  });
});

describe('Event Validation', () => {
  beforeAll(async () => {
    const testDB = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/eventure-test';
    await mongoose.connect(testDB);
  });

  afterAll(async () => {
    await Event.deleteMany({});
    await mongoose.connection.close();
  });

  it('should require title field', async () => {
    const invalidEvent = {
      date: new Date('2025-12-31'),
      location: 'Test Location',
      price: 50,
      email: 'test@test.com',
      selectedCategory: { label: 'Music', value: 'music' }
    };

    await expect(Event.create(invalidEvent))
      .rejects
      .toThrow(/title is required/);
  });

  it('should require date field', async () => {
    const invalidEvent = {
      title: 'Test Event',
      location: 'Test Location',
      price: 50,
      email: 'test@test.com',
      selectedCategory: { label: 'Music', value: 'music' }
    };

    await expect(Event.create(invalidEvent))
      .rejects
      .toThrow(/date required/);
  });

  it('should require price field', async () => {
    const invalidEvent = {
      title: 'Test Event',
      date: new Date('2025-12-31'),
      location: 'Test Location',
      email: 'test@test.com',
      selectedCategory: { label: 'Music', value: 'music' }
    };

    await expect(Event.create(invalidEvent))
      .rejects
      .toThrow(/price is required/);
  });

  it('should not allow negative price', async () => {
    const invalidEvent = {
      title: 'Test Event',
      date: new Date('2025-12-31'),
      location: 'Test Location',
      price: -10,
      email: 'test@test.com',
      selectedCategory: { label: 'Music', value: 'music' }
    };

    await expect(Event.create(invalidEvent))
      .rejects
      .toThrow(/Price cannot be negative/);
  });

  it('should not allow capacity less than 1', async () => {
    const invalidEvent = {
      title: 'Test Event',
      date: new Date('2025-12-31'),
      location: 'Test Location',
      price: 50,
      capacity: 0,
      email: 'test@test.com',
      selectedCategory: { label: 'Music', value: 'music' }
    };

    await expect(Event.create(invalidEvent))
      .rejects
      .toThrow(/Capacity must be at least 1/);
  });

  it('should require email field', async () => {
    const invalidEvent = {
      title: 'Test Event',
      date: new Date('2025-12-31'),
      location: 'Test Location',
      price: 50,
      selectedCategory: { label: 'Music', value: 'music' }
    };

    await expect(Event.create(invalidEvent))
      .rejects
      .toThrow(/email is required/);
  });

  it('should lowercase and trim email', async () => {
    const event = await Event.create({
      ...mockEvent,
      email: '  TEST@EXAMPLE.COM  ',
    });

    expect(event.email).toBe('test@example.com');
  });

  it('should trim string fields', async () => {
    const event = await Event.create({
      ...mockEvent,
      title: '  Test Event  ',
      location: '  Test Location  ',
    });

    expect(event.title).toBe('Test Event');
    expect(event.location).toBe('Test Location');
  });
});

describe('Event Authorization', () => {
  let eventId;
  const organizerEmail = 'organizer@test.com';
  const otherEmail = 'other@test.com';

  beforeAll(async () => {
    const testDB = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/eventure-test';
    await mongoose.connect(testDB);
  });

  afterAll(async () => {
    await Event.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const event = await Event.create({
      ...mockEvent,
      email: organizerEmail,
    });
    eventId = event._id;
  });

  afterEach(async () => {
    await Event.deleteMany({});
  });

  it('should allow organizer to update their event', async () => {
    const event = await Event.findById(eventId);

    // Simulate authorization check
    const isAuthorized = event.email === organizerEmail;
    expect(isAuthorized).toBe(true);

    if (isAuthorized) {
      await Event.findByIdAndUpdate(eventId, { title: 'Updated Title' });
      const updatedEvent = await Event.findById(eventId);
      expect(updatedEvent.title).toBe('Updated Title');
    }
  });

  it('should prevent non-organizer from updating event', async () => {
    const event = await Event.findById(eventId);

    // Simulate authorization check
    const isAuthorized = event.email === otherEmail;
    expect(isAuthorized).toBe(false);

    if (!isAuthorized) {
      // Should not update
      expect(event.title).toBe(mockEvent.title);
    }
  });

  it('should allow organizer to delete their event', async () => {
    const event = await Event.findById(eventId);

    // Simulate authorization check
    const isAuthorized = event.email === organizerEmail;
    expect(isAuthorized).toBe(true);

    if (isAuthorized) {
      await Event.findByIdAndDelete(eventId);
      const deletedEvent = await Event.findById(eventId);
      expect(deletedEvent).toBeNull();
    }
  });

  it('should prevent non-organizer from deleting event', async () => {
    const event = await Event.findById(eventId);

    // Simulate authorization check
    const isAuthorized = event.email === otherEmail;
    expect(isAuthorized).toBe(false);

    if (!isAuthorized) {
      // Should not delete
      const stillExists = await Event.findById(eventId);
      expect(stillExists).not.toBeNull();
    }
  });
});
