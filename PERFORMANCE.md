# Performance Optimization Guide

This guide provides comprehensive strategies to optimize the Eventure application for production-scale performance.

## Table of Contents
1. [Backend Optimization](#backend-optimization)
2. [Frontend Optimization](#frontend-optimization)
3. [Database Optimization](#database-optimization)
4. [Caching Strategies](#caching-strategies)
5. [Monitoring & Profiling](#monitoring--profiling)
6. [Deployment Optimization](#deployment-optimization)

---

## Backend Optimization

### 1. API Response Optimization

#### Enable Compression
```javascript
// In index.js
const compression = require('compression');
app.use(compression());
```

Install: `npm install compression`

#### Use Lean Queries
```javascript
// Instead of:
const events = await Event.find();

// Use lean() for read-only operations:
const events = await Event.find().lean();
// This returns plain JavaScript objects instead of Mongoose documents (~5-10x faster)
```

#### Implement Field Projection
```javascript
// Don't fetch unnecessary fields
const events = await Event.find()
  .select('title date location price') // Only fetch needed fields
  .lean();
```

#### Use Connection Pooling
```javascript
// In index.js, set Mongoose connection pool size
mongoose.connect(DB, {
  maxPoolSize: 10, // Maximum 10 concurrent connections
  minPoolSize: 2,  // Keep at least 2 connections open
});
```

### 2. Request Optimization

#### Rate Limiting
```javascript
// Install: npm install express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

app.use('/api/', limiter);
```

#### Request Timeout
```javascript
// Install: npm install express-timeout-handler
const timeout = require('express-timeout-handler');

app.use(timeout.handler({
  timeout: 30000, // 30 seconds
  onTimeout: (req, res) => {
    res.status(503).json({ error: 'Request timeout' });
  },
}));
```

### 3. Async/Await Optimization

#### Use Promise.all for Parallel Operations
```javascript
// Bad - Sequential (slower)
const events = await Event.find();
const bookings = await Booking.find();

// Good - Parallel (faster)
const [events, bookings] = await Promise.all([
  Event.find(),
  Booking.find(),
]);
```

#### Avoid N+1 Query Problem
```javascript
// Bad - N+1 queries
const events = await Event.find();
for (const event of events) {
  event.bookingCount = await Booking.countDocuments({ eventId: event._id });
}

// Good - Use aggregation
const events = await Event.aggregate([
  {
    $lookup: {
      from: 'bookings',
      localField: '_id',
      foreignField: 'eventId',
      as: 'bookings',
    },
  },
  {
    $addFields: {
      bookingCount: { $size: '$bookings' },
    },
  },
]);
```

---

## Frontend Optimization

### 1. Code Splitting

#### Lazy Load Routes
```javascript
// In your router setup
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const EventPage = lazy(() => import('./pages/EventPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/event/:id" element={<EventPage />} />
        <Route path="/booking/:id" element={<BookingPage />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. Image Optimization

#### Use WebP Format
```javascript
// Convert images to WebP for 25-35% smaller file size
// Use online tools or: npm install sharp

// Example using sharp:
const sharp = require('sharp');
sharp('image.jpg')
  .webp({ quality: 80 })
  .toFile('image.webp');
```

#### Implement Lazy Loading
```javascript
// In your React components
<img
  src={event.image}
  alt={event.title}
  loading="lazy" // Native lazy loading
/>
```

#### Use Image CDN
- Upload images to Cloudinary, AWS S3 + CloudFront, or similar
- Serve optimized, resized images
- Enable automatic format conversion (WebP, AVIF)

### 3. React Optimization

#### Use React.memo for Expensive Components
```javascript
// EventCard.jsx
import { memo } from 'react';

const EventCard = memo(({ event }) => {
  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <p>{event.description}</p>
    </div>
  );
});

export default EventCard;
```

#### Use useMemo for Expensive Calculations
```javascript
import { useMemo } from 'react';

function EventList({ events, filter }) {
  const filteredEvents = useMemo(() => {
    return events.filter(e => e.category === filter);
  }, [events, filter]); // Only recompute when events or filter changes

  return <>{filteredEvents.map(e => <EventCard key={e._id} event={e} />)}</>;
}
```

#### Use useCallback for Event Handlers
```javascript
import { useCallback } from 'react';

function BookingForm() {
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    // Handle submission
  }, []); // Function reference stays the same

  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### Virtualize Long Lists
```javascript
// Install: npm install react-window
import { FixedSizeList as List } from 'react-window';

function EventList({ events }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <EventCard event={events[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={events.length}
      itemSize={150}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

### 4. Bundle Size Optimization

#### Analyze Bundle Size
```bash
# Install analyzer
npm install --save-dev vite-plugin-bundle-analyzer

# Add to vite.config.js
import { visualizer } from 'vite-plugin-bundle-analyzer';

export default {
  plugins: [
    visualizer({ open: true }),
  ],
};
```

#### Tree Shaking
```javascript
// Bad - Imports entire library
import _ from 'lodash';

// Good - Import only what you need
import debounce from 'lodash/debounce';
```

#### Remove Unused Dependencies
```bash
# Find unused dependencies
npx depcheck

# Remove them
npm uninstall <package-name>
```

---

## Database Optimization

### 1. Indexing Strategy

Current indexes (already implemented):
```javascript
// In event-schema.js
eventSchema.index({ email: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ 'selectedCategory.value': 1 });

// In booking-schema.js
bookingSchema.index({ email: 1 });
bookingSchema.index({ eventId: 1 });
bookingSchema.index({ createdAt: -1 });
```

Check index usage:
```javascript
// In MongoDB shell
db.events.explain("executionStats").find({ date: { $gte: new Date() } });
```

### 2. Query Optimization

#### Use Aggregation Pipeline for Complex Queries
```javascript
// Example: Get events with booking statistics
const eventsWithStats = await Event.aggregate([
  {
    $match: { date: { $gte: new Date() } } // Filter first
  },
  {
    $lookup: {
      from: 'bookings',
      localField: '_id',
      foreignField: 'eventId',
      as: 'bookings'
    }
  },
  {
    $addFields: {
      totalBookings: { $size: '$bookings' },
      totalRevenue: { $sum: '$bookings.totalPrice' }
    }
  },
  {
    $project: { bookings: 0 } // Don't return bookings array
  }
]);
```

#### Limit Document Size
```javascript
// Keep documents under 16MB (MongoDB limit)
// Store large data (images, files) in GridFS or external storage (S3)
```

### 3. Database Connection Optimization

```javascript
// Set up read preference for read-heavy operations
const events = await Event.find().read('secondaryPreferred');
// Reads from secondary replica set members when possible

// Use write concern for critical operations
await Booking.create(bookingData, { w: 'majority' });
// Ensures write is acknowledged by majority of replica set members
```

---

## Caching Strategies

### 1. HTTP Caching Headers

```javascript
// In index.js
app.use((req, res, next) => {
  // Cache static assets for 1 year
  if (req.url.match(/\.(jpg|jpeg|png|gif|svg|css|js|woff|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Cache API responses for 5 minutes
  else if (req.url.startsWith('/api/get-events')) {
    res.setHeader('Cache-Control', 'public, max-age=300');
  }
  // Don't cache user-specific data
  else if (req.url.startsWith('/api/get-bookings')) {
    res.setHeader('Cache-Control', 'private, no-cache');
  }
  next();
});
```

### 2. In-Memory Caching with Redis

```bash
npm install redis
```

```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache featured events for 10 minutes
exports.getFeaturedEvents = async (req, res) => {
  const cacheKey = 'featured-events';

  // Try to get from cache
  const cached = await client.get(cacheKey);
  if (cached) {
    return res.json({ data: JSON.parse(cached) });
  }

  // If not cached, fetch from database
  const events = await Event.find({ date: { $gte: new Date() } })
    .sort({ date: 1 })
    .limit(6)
    .lean();

  // Store in cache for 10 minutes
  await client.setEx(cacheKey, 600, JSON.stringify(events));

  return res.json({ data: events });
};
```

### 3. Client-Side Caching

React Query already provides excellent caching:
```javascript
// In your query configuration
const { data } = useQuery({
  queryKey: ['events'],
  queryFn: fetchEvents,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

---

## Monitoring & Profiling

### 1. Backend Performance Monitoring

#### Use Sentry Performance Monitoring
Already implemented in `backend/utils/sentry.js`

```javascript
// Add transaction tracking
const Sentry = require('@sentry/node');

app.get('/api/get-events', async (req, res) => {
  const transaction = Sentry.startTransaction({
    op: 'http.server',
    name: 'GET /api/get-events',
  });

  try {
    const events = await Event.find();
    res.json({ data: events });
  } finally {
    transaction.finish();
  }
});
```

#### Use Winston for Performance Logging
```javascript
// In controllers
const startTime = Date.now();
const events = await Event.find();
logger.info('Query executed', {
  operation: 'Event.find',
  duration: Date.now() - startTime,
  resultCount: events.length,
});
```

### 2. Frontend Performance Monitoring

#### Web Vitals
```bash
npm install web-vitals
```

```javascript
// In main.jsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(metric);
  // Send to your analytics service
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

#### React DevTools Profiler
1. Install React DevTools browser extension
2. Open DevTools → Profiler tab
3. Click "Record" and interact with your app
4. Analyze render times and identify slow components

---

## Deployment Optimization

### 1. Production Build

#### Frontend Build Optimization
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
      },
    },
  },
};
```

#### Backend Optimization
```javascript
// Use PM2 for process management
npm install -g pm2

// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'eventure-backend',
    script: './index.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
  }],
};

// Start with: pm2 start ecosystem.config.js
```

### 2. CDN Setup

#### Use CDN for Static Assets
- Upload frontend build to CDN (Cloudflare, AWS CloudFront)
- Serve images, CSS, JS from CDN
- Enable HTTP/2 and Brotli compression

#### Example Cloudflare Configuration
- Enable "Auto Minify" for JS, CSS, HTML
- Enable "Brotli" compression
- Set Browser Cache TTL to 4 hours for HTML, 1 year for assets
- Enable "Always Online" for failover

### 3. Database Deployment

#### Use MongoDB Atlas
- Automatic scaling
- Built-in backups
- Performance monitoring
- Connection pooling

#### Connection String Optimization
```javascript
mongoose.connect(DB, {
  maxPoolSize: 50,
  wtimeoutMS: 2500,
  retryWrites: true,
  w: 'majority',
});
```

---

## Performance Checklist

### Backend
- [ ] Enable gzip/brotli compression
- [ ] Implement rate limiting
- [ ] Use lean() for read-only queries
- [ ] Implement Redis caching for hot paths
- [ ] Use aggregation pipelines for complex queries
- [ ] Set up proper database indexes
- [ ] Enable connection pooling
- [ ] Use PM2 cluster mode in production

### Frontend
- [ ] Implement code splitting and lazy loading
- [ ] Optimize images (WebP, lazy loading, CDN)
- [ ] Use React.memo, useMemo, useCallback appropriately
- [ ] Virtualize long lists
- [ ] Remove unused dependencies
- [ ] Enable production build minification
- [ ] Implement service worker for offline support
- [ ] Use CDN for static assets

### Database
- [ ] Create indexes on frequently queried fields
- [ ] Use lean queries where possible
- [ ] Implement pagination for large datasets
- [ ] Monitor slow queries
- [ ] Set up read replicas for read-heavy workloads

### Monitoring
- [ ] Set up Sentry error tracking
- [ ] Monitor Web Vitals
- [ ] Track API response times
- [ ] Set up alerts for high error rates
- [ ] Monitor database query performance

---

## Performance Testing

### Load Testing with Artillery
```bash
npm install -g artillery

# Create load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: '/api/get-events'
      - get:
          url: '/api/get-featured-events'

# Run test
artillery run load-test.yml
```

### Frontend Performance Testing
```bash
# Lighthouse CI
npm install -g @lhci/cli

# Run audit
lhci autorun --collect.url=http://localhost:5173
```

---

## Target Performance Metrics

### Backend
- API response time: < 200ms (p95)
- Database query time: < 100ms (p95)
- Error rate: < 0.1%
- Uptime: > 99.9%

### Frontend
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms

### Database
- Query execution time: < 50ms (p95)
- Connection pool utilization: < 70%
- Index hit rate: > 95%

---

## Additional Resources

- [Web.dev Performance Guide](https://web.dev/performance/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [MongoDB Performance Best Practices](https://www.mongodb.com/docs/manual/administration/analyzing-mongodb-performance/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
