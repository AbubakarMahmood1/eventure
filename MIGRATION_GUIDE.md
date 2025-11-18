# Database Migration Guide

## Schema Changes

The database schema has been updated to use proper data types and add new fields. This guide explains the changes and how to migrate existing data.

### Changes Made

#### Event Schema
- `date`: Changed from `String` to `Date`
- `price`: Changed from `String` to `Number`
- `capacity`: **NEW FIELD** - `Number` (nullable, default: null for unlimited)
- `attendees`: Renamed from `attandees` (typo fix)
- Added `timestamps: true` for automatic `createdAt` and `updatedAt`
- Added indexes on `email`, `date`, and `createdAt`
- Added data validation (trim, lowercase for emails, min values)

#### Booking Schema
- `totalPrice`: Changed from `String` to `Number`
- `status`: **NEW FIELD** - `String` enum: "pending", "confirmed", "cancelled" (default: "confirmed")
- `paymentIntentId`: **NEW FIELD** - `String` for Stripe payment tracking
- Added `timestamps: true` for automatic `createdAt` and `updatedAt`
- Added indexes on `email`, `eventId`, and `createdAt`
- Added data validation (trim, lowercase for emails, min values)

## Migration Options

### Option 1: Fresh Start (Recommended for Development)

If you don't have important data, the easiest option is to drop the database and start fresh:

```bash
# Connect to MongoDB
mongosh "your-connection-string"

# Drop the database
use eventure
db.dropDatabase()

# Exit
exit
```

The new schema will be automatically created when you restart your application.

### Option 2: Migrate Existing Data

If you have existing data you want to keep, run this migration script:

```javascript
// Save this as migrate.js and run with: node migrate.js

const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const DB = process.env.DATABASE_URL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

async function migrate() {
  try {
    await mongoose.connect(DB);
    console.log('Connected to database');

    const db = mongoose.connection.db;

    // Migrate Events collection
    const events = await db.collection('events').find({}).toArray();
    console.log(`Found ${events.length} events to migrate`);

    for (const event of events) {
      const updates = {};

      // Convert date from string to Date
      if (typeof event.date === 'string') {
        updates.date = new Date(event.date);
      }

      // Convert price from string to number
      if (typeof event.price === 'string') {
        updates.price = parseFloat(event.price);
      }

      // Rename attandees to attendees (typo fix)
      if (event.attandees !== undefined) {
        updates.attendees = event.attandees;
        updates.$unset = { attandees: 1 };
      }

      // Add capacity if not exists
      if (event.capacity === undefined) {
        updates.capacity = null; // unlimited
      }

      // Add timestamps if not exist
      if (!event.createdAt) {
        updates.createdAt = new Date();
        updates.updatedAt = new Date();
      }

      if (Object.keys(updates).length > 0) {
        await db.collection('events').updateOne(
          { _id: event._id },
          updates.$unset ?
            { $set: updates, $unset: updates.$unset } :
            { $set: updates }
        );
        console.log(`Migrated event: ${event.title}`);
      }
    }

    // Migrate Bookings collection
    const bookings = await db.collection('bookings').find({}).toArray();
    console.log(`Found ${bookings.length} bookings to migrate`);

    for (const booking of bookings) {
      const updates = {};

      // Convert totalPrice from string to number
      if (typeof booking.totalPrice === 'string') {
        updates.totalPrice = parseFloat(booking.totalPrice);
      }

      // Add status if not exists
      if (!booking.status) {
        updates.status = 'confirmed';
      }

      // Add timestamps if not exist
      if (!booking.createdAt) {
        updates.createdAt = new Date();
        updates.updatedAt = new Date();
      }

      if (Object.keys(updates).length > 0) {
        await db.collection('bookings').updateOne(
          { _id: booking._id },
          { $set: updates }
        );
        console.log(`Migrated booking: ${booking._id}`);
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
```

## Environment Variables

Update your `.env` files with new variables:

### Backend .env

```env
# Existing variables
DATABASE_URL=...
DATABASE_PASSWORD=...
STRIPE_KEY=...
PORT=3000

# NEW: Stripe webhook secret (get from Stripe dashboard)
STRIPE_WEBHOOK_SECRET=whsec_...

# NEW: Logging
LOG_LEVEL=info
NODE_ENV=development

# NEW: Email configuration (optional, defaults to console logging in dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=Eventure <noreply@eventure.com>
```

### Frontend .env

```env
# Existing variables
VITE_API_BASE_URL=http://localhost:3000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Existing variable (was hardcoded, now in env)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Testing After Migration

1. Start your backend:
```bash
cd backend
npm start
```

2. Test the API endpoints:
```bash
# Check API docs
curl http://localhost:3000/api-docs

# Test creating an event (should accept Date and Number types)
curl -X POST http://localhost:3000/api/add-event \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "date": "2025-12-31",
    "price": 50,
    "location": "Test Location",
    "description": "Test Description",
    "email": "test@test.com",
    "selectedCategory": {"label": "Music", "value": "music"}
  }'
```

3. Verify data types in MongoDB:
```bash
mongosh "your-connection-string"
use eventure
db.events.findOne()
db.bookings.findOne()
```

## Rollback

If you need to rollback, restore from your backup:

```bash
mongorestore --uri="your-connection-string" ./backup
```

## Notes

- Always backup your database before migrating
- Test the migration on a development/staging environment first
- The frontend doesn't need changes - it will continue sending strings, and the backend now converts them
- Capacity checking is now enforced - bookings will be rejected if event is sold out
