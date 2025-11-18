# Eventure

A modern event booking and management platform built with React, Node.js, Express, and MongoDB.

## ✨ Features

### Core Functionality
- 🎫 **Event Creation & Management** - Create, update, and delete events
- 📅 **Event Browsing** - Browse, filter, and search events
- 💳 **Secure Payments** - Stripe integration with payment webhooks
- 🎟️ **Booking System** - Book tickets with capacity management
- 👥 **User Authentication** - Clerk-based authentication
- 📧 **Email Notifications** - Booking confirmations and event updates

### Technical Features
- 🔒 **Authorization** - Users can only edit/delete their own events
- 📊 **Pagination** - Efficient handling of large datasets
- 🎯 **Capacity Management** - Automatic sold-out detection
- 📝 **API Documentation** - Swagger/OpenAPI docs at `/api-docs`
- 🔍 **Logging** - Winston-based structured logging
- ✅ **Testing** - Jest test framework setup
- 🗄️ **Database Indexes** - Optimized queries

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

### Critical Fixes
- ✅ Fixed typos (frontned→frontend, attandees→attendees)
- ✅ Removed 50+ console.logs
- ✅ Secured environment variables
- ✅ Fixed booking MongoDB ID bug
- ✅ Added authorization checks
- ✅ Improved error handling

### New Features
- ✅ Proper database types (Date, Number)
- ✅ Event capacity limits
- ✅ API pagination & search
- ✅ Winston logging
- ✅ Stripe webhooks
- ✅ Testing framework
- ✅ API documentation
- ✅ Email service

## 📚 Documentation

- [Migration Guide](./MIGRATION_GUIDE.md) - Database schema updates
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