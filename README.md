# Eventure

A modern event booking and management platform built with React, Node.js, Express, and MongoDB.

## ✨ Features

### Core Functionality
- 🎫 **Event Creation & Management** - Create, update, and delete events
- 📅 **Event Browsing** - Browse, filter, and search events
- 💳 **Secure Payments** - Stripe integration with payment webhooks & refunds
- 🎟️ **Booking System** - Book tickets with capacity management
- 📱 **QR Code Tickets** - Download PDF tickets with QR codes
- ↩️ **Booking Cancellation** - Cancel bookings with automatic refunds (24h policy)
- ✅ **Ticket Verification** - Scan QR codes to verify tickets at events
- 👥 **User Authentication** - Clerk-based authentication
- 📧 **Email Notifications** - Booking confirmations and event updates

### Technical Features
- 🔒 **Authorization** - Users can only edit/delete their own events
- 📊 **Pagination** - Efficient handling of large datasets
- 🎯 **Capacity Management** - Automatic sold-out detection
- 📝 **API Documentation** - Swagger/OpenAPI docs at `/api-docs`
- 🔍 **Logging** - Winston-based structured logging
- ✅ **Testing** - Comprehensive Jest test suite (40+ tests)
- 🗄️ **Database Indexes** - Optimized queries
- 📐 **Type Safety** - JSDoc type hints throughout codebase
- 🚀 **CI/CD** - GitHub Actions pipeline with automated testing
- 📡 **Monitoring** - Sentry error tracking & performance monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB database
- Stripe account
- Clerk account

### Installation

1. **Clone & Install**
```bash
cd backend && npm install
cd ../frontend && npm install
```

2. **Configure Environment** (See `.env.example` files)

3. **Run**
```bash
# Backend: npm start (port 3000)
# Frontend: npm run dev (port 5173)
```

### API Documentation
Visit http://localhost:3000/api-docs

## 📈 Recent Improvements (Nov 2025)

### Critical Fixes (DO IMMEDIATELY)
- ✅ Fixed typos (frontned→frontend, attandees→attendees)
- ✅ Removed 50+ console.logs
- ✅ Secured environment variables
- ✅ Fixed booking MongoDB ID bug
- ✅ Added authorization checks
- ✅ Improved error handling

### Production Ready (DO SOON)
- ✅ Proper database types (Date, Number)
- ✅ Event capacity limits & sold-out detection
- ✅ API pagination & search/filter
- ✅ Winston structured logging
- ✅ Stripe webhook processing
- ✅ Jest testing framework
- ✅ Swagger/OpenAPI documentation
- ✅ Nodemailer email service

### Advanced Features (DO EVENTUALLY)
- ✅ **JSDoc Type Hints** - Full type definitions without TypeScript
- ✅ **CI/CD Pipeline** - GitHub Actions with matrix testing
- ✅ **Sentry Monitoring** - Error tracking & performance monitoring
- ✅ **QR Code Tickets** - PDF generation with QR codes for verification
- ✅ **Booking Cancellation** - Full refund processing with 24h policy
- ✅ **Comprehensive Tests** - 40+ test cases for events & bookings
- ✅ **Performance Guide** - Complete optimization strategies (PERFORMANCE.md)

## 📚 Documentation

- [Migration Guide](./MIGRATION_GUIDE.md) - Database schema updates
- [Performance Guide](./PERFORMANCE.md) - Optimization strategies
- [API Docs](http://localhost:3000/api-docs) - Swagger documentation

## 🧪 Testing

```bash
cd backend
npm test              # Run tests
npm run test:watch    # Watch mode
```

## 🤝 Contributing

See full README at project root for contribution guidelines.

---

**Made with ❤️ for event organizers and attendees**