# Installation & Setup Guide

Complete guide to set up Eventure with all features enabled.

## Prerequisites

- **Node.js** 18.x or 20.x
- **MongoDB** database (local or Atlas)
- **Stripe** account for payments
- **Clerk** account for authentication

## Optional Services

- **Sentry** account for error monitoring
- **SMTP server** for email notifications (Gmail, SendGrid, etc.)

---

## Step 1: Clone and Install Dependencies

```bash
# Clone repository
git clone <your-repo-url>
cd eventure

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Installed Packages

**Backend:**
- `@sentry/node` - Error monitoring
- `qrcode` - QR code generation for tickets
- `pdfkit` - PDF ticket generation
- `winston` - Structured logging
- `stripe` - Payment processing
- `nodemailer` - Email notifications
- `swagger-jsdoc` & `swagger-ui-express` - API documentation
- `jest` & `supertest` - Testing framework

**Frontend:**
- `@sentry/react` - Error monitoring
- `@clerk/clerk-react` - Authentication
- `@stripe/react-stripe-js` - Payment UI
- `@tanstack/react-query` - Data fetching & caching

---

## Step 2: Configure Backend Environment

Create `/backend/.env` based on `/backend/.env.example`:

```env
# Database Configuration
DATABASE_URL=mongodb+srv://username:<PASSWORD>@cluster.mongodb.net/eventure?retryWrites=true&w=majority
DATABASE_PASSWORD=your_actual_password

# Stripe Configuration
STRIPE_KEY=sk_test_your_actual_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret

# Server Configuration
PORT=3000
NODE_ENV=development

# Logging Configuration
LOG_LEVEL=info

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
EMAIL_FROM=Eventure <noreply@eventure.com>

# Monitoring Configuration (optional)
SENTRY_DSN=https://your-actual-sentry-dsn@sentry.io/123456
```

### Getting API Keys

1. **MongoDB Atlas:**
   - Create free cluster at https://cloud.mongodb.com
   - Get connection string from "Connect" button
   - Replace `<PASSWORD>` with your password

2. **Stripe:**
   - Sign up at https://stripe.com
   - Get secret key from Dashboard → Developers → API keys
   - Get webhook secret: Dashboard → Developers → Webhooks → Add endpoint
   - Add endpoint: `http://your-domain/api/webhook`
   - Copy webhook secret

3. **Gmail App Password (for email):**
   - Enable 2FA on Google Account
   - Go to Google Account → Security → 2-Step Verification
   - Scroll to "App passwords" → Generate
   - Use generated password in SMTP_PASSWORD

4. **Sentry (optional):**
   - Sign up at https://sentry.io
   - Create new project
   - Copy DSN from Settings → Projects → Your Project → Client Keys

---

## Step 3: Configure Frontend Environment

Create `/frontend/.env` based on `/frontend/.env.example`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_clerk_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key

# Monitoring Configuration (optional)
VITE_SENTRY_DSN=https://your-actual-sentry-dsn@sentry.io/123456
VITE_SENTRY_DEV=false
```

### Getting Frontend Keys

1. **Clerk:**
   - Sign up at https://clerk.dev
   - Create application
   - Copy "Publishable key" from API Keys

2. **Stripe Publishable Key:**
   - Same Stripe account as backend
   - Dashboard → Developers → API keys
   - Copy "Publishable key" (starts with `pk_test_`)

---

## Step 4: Database Migration (If Existing Data)

If you have existing data with old schema:

```bash
cd backend
node migrate.js  # See MIGRATION_GUIDE.md for migration script
```

For fresh installations, skip this step.

---

## Step 5: Run Development Servers

### Terminal 1 - Backend
```bash
cd backend
npm start
# Server runs on http://localhost:3000
# API docs: http://localhost:3000/api-docs
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

---

## Step 6: Stripe Webhook Setup (Production)

### Local Development (Testing Webhooks)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# OR download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhook
# Copy webhook signing secret to STRIPE_WEBHOOK_SECRET in .env
```

### Production
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
4. Copy webhook signing secret to production .env

---

## Step 7: Verify Installation

### Backend Health Check
```bash
curl http://localhost:3000
# Should return: {"message":"Eventure API","version":"1.0.0","docs":"/api-docs"}
```

### API Documentation
Visit http://localhost:3000/api-docs to see interactive API docs

### Run Tests
```bash
cd backend
npm test
# Should show 40+ passing tests
```

---

## Step 8: Optional Features Setup

### Sentry Error Monitoring

1. **Backend:** Add `SENTRY_DSN` to `/backend/.env`
2. **Frontend:** Add `VITE_SENTRY_DSN` to `/frontend/.env`
3. Errors automatically tracked in Sentry dashboard
4. In development, errors logged to console by default

### Email Notifications

1. Configure SMTP settings in `/backend/.env`
2. In development mode, emails logged to console
3. In production (`NODE_ENV=production`), emails sent via SMTP

### QR Code Tickets

- Already installed with `qrcode` and `pdfkit` packages
- No additional configuration needed
- Tickets generated on-demand when user clicks "Download Ticket"

---

## Troubleshooting

### Backend won't start

**Error:** "Cannot find module 'qrcode'"
```bash
cd backend
npm install qrcode pdfkit
```

**Error:** "Database connection failed"
- Check DATABASE_URL and DATABASE_PASSWORD in .env
- Verify MongoDB Atlas IP whitelist (allow your IP or 0.0.0.0/0 for testing)
- Check if MongoDB cluster is running

### Frontend build fails

**Error:** "Cannot find module '@sentry/react'"
```bash
cd frontend
npm install @sentry/react
```

### Stripe webhooks not working

1. Check STRIPE_WEBHOOK_SECRET is set correctly
2. In development, use Stripe CLI for local testing
3. Verify endpoint URL in Stripe Dashboard matches your domain

### Tests failing

**Error:** "Cannot connect to test database"
```bash
# Set TEST_DATABASE_URL in .env
TEST_DATABASE_URL=mongodb://localhost:27017/eventure-test
```

---

## Production Deployment

### Environment Variables Checklist

**Backend:**
- [ ] DATABASE_URL (production MongoDB)
- [ ] DATABASE_PASSWORD
- [ ] STRIPE_KEY (production, starts with `sk_live_`)
- [ ] STRIPE_WEBHOOK_SECRET (production webhook)
- [ ] NODE_ENV=production
- [ ] SENTRY_DSN (optional)
- [ ] SMTP credentials (optional)

**Frontend:**
- [ ] VITE_API_BASE_URL (production API URL)
- [ ] VITE_CLERK_PUBLISHABLE_KEY (production key)
- [ ] VITE_STRIPE_PUBLISHABLE_KEY (production, starts with `pk_live_`)
- [ ] VITE_SENTRY_DSN (optional)

### Build Commands

```bash
# Backend (use PM2 for production)
cd backend
npm install --production
pm2 start index.js --name eventure-backend

# Frontend
cd frontend
npm run build
# Deploy dist/ folder to Vercel, Netlify, or CDN
```

### GitHub Actions CI/CD

The project includes a complete CI/CD pipeline (`.github/workflows/ci.yml`):

1. Push to `main` branch triggers production deployment
2. Push to `develop` branch triggers staging deployment
3. All PRs run automated tests

**Required GitHub Secrets:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID_BACKEND`
- `VERCEL_PROJECT_ID_FRONTEND`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `SLACK_WEBHOOK` (optional)
- `SNYK_TOKEN` (optional)

---

## Next Steps

1. ✅ Read [PERFORMANCE.md](./PERFORMANCE.md) for optimization strategies
2. ✅ Read [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for database schema details
3. ✅ Explore [API Documentation](http://localhost:3000/api-docs)
4. ✅ Run tests: `npm test`
5. ✅ Check monitoring dashboards (Sentry, if configured)

---

## Support

- **Documentation:** See `/PERFORMANCE.md`, `/MIGRATION_GUIDE.md`
- **API Reference:** http://localhost:3000/api-docs
- **Issues:** Report on GitHub repository

**Made with ❤️ for event organizers and attendees**
