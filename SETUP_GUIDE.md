# Xplore Nexus - Complete Setup Guide

## ✅ New Features Implemented

### 1. **Database Layer (Prisma + PostgreSQL)**
- Complete database schema with all models
- User management with roles (Admin, Organizer, Instructor, Participant)
- Events, registrations, training, meetings, certificates
- Payment tracking and analytics

**Setup:**
```bash
# 1. Install PostgreSQL locally or use Supabase
# Option A: Local PostgreSQL
# Option B: Supabase (recommended) - creates free PostgreSQL database

# 2. Set DATABASE_URL in .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/xplore_nexus"
# Or Supabase URL: postgresql://user:password@db.xxx.supabase.co:5432/postgres

# 3. Push schema to database
npm run db:push

# 4. Seed demo data
npm run db:seed

# 5. Open Prisma Studio to view data
npm run db:studio
```

### 2. **Payment Integration (Stripe)**
- Complete payment flow with Stripe
- Payment intent creation
- Webhook support for confirmations
- Payment status tracking in database

**Setup:**
```bash
# 1. Get Stripe keys from https://stripe.com
# Add to .env.local:
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_PUBLIC_KEY="pk_test_xxx"
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_xxx"

# 2. Set up webhook endpoint
# Stripe Dashboard > Webhooks > Add endpoint
# Webhook URL: https://your-app.com/api/payments/webhook
# Events: payment_intent.succeeded, payment_intent.payment_failed

# 3. Payment endpoints ready:
# POST /api/payments/create-intent - Create payment intent
# POST /api/payments/webhook - Handle Stripe webhooks
```

### 3. **Email System (Nodemailer)**
- Automated transactional emails
- Pre-built templates:
  - Registration confirmations
  - Payment receipts
  - Event reminders
  - Training certificates
  - Password resets

**Setup:**
```bash
# Add to .env.local:
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"  # Generate in Google Account Security
SMTP_FROM="noreply@xplore.io"

# Email endpoints:
# POST /api/emails/send - Send transactional email
```

### 4. **Certificate Generation (PDF)**
- Automatic PDF certificate creation
- QR code for verification
- Professional design with organization branding

**Setup:**
```bash
# Already installed: pdf-lib, qrcode

# Certificate endpoints:
# POST /api/certificates/issue - Generate and issue certificate
# GET /api/certificates?userId=XXX - Retrieve user certificates

# Certificate data will be stored in database and sent via email
```

### 5. **Detailed Reports & Analytics**
- Event-level reports (attendance, revenue, engagement)
- Training reports (completion rates, student progress)
- User reports (activity, achievements, points)
- Platform-wide analytics (KPIs, revenue, health score)

**API Endpoints:**
```
GET /api/reports/event?eventId=XXX      - Event report
GET /api/reports/training?trainingId=XXX - Training report
GET /api/reports/user?userId=XXX        - User report
GET /api/reports/analytics              - Platform analytics
```

---

## 📋 Fixed/Completed Features

### ✓ User Registration
- `POST /api/auth/register` - Create new user account
- Database validation
- Welcome notification

### ✓ Password Reset
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### ✓ Event Registration with Emails
- `POST /api/events/[id]/register` - Register for event
- Automatic confirmation email
- Ticket code generation
- Database storage

---

## 🔧 Quick Start Development

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables (.env.local):**
```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
JWT_SECRET="your-32-char-minimum-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@xplore.io"

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..."

# Zoom
NEXT_PUBLIC_ZOOM_CLIENT_ID="your-zoom-client-id"
ZOOM_CLIENT_SECRET="your-zoom-client-secret"
```

3. **Set up database:**
```bash
npm run db:push
npm run db:seed
```

4. **Start development:**
```bash
npm run dev
```

---

## 🚀 Testing Routes

### Test Authentication
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jose.dc@xplore.io","password":"hashed_password_123"}'

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@test.io","password":"test123","department":"IT"}'
```

### Test Payments
```bash
# Create payment intent
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{"registrationId":"reg-123","amount":500,"currency":"PHP"}'
```

### Test Certificates
```bash
# Issue certificate
curl -X POST http://localhost:3000/api/certificates/issue \
  -H "Content-Type: application/json" \
  -d '{"userId":"u-001","trainingId":"tr-001","certificateTitle":"Digital Marketing Fundamentals"}'

# Get user certificates
curl http://localhost:3000/api/certificates?userId=u-001
```

### Test Analytics
```bash
# Get event report
curl 'http://localhost:3000/api/reports/event?eventId=event-123'

# Get platform analytics
curl 'http://localhost:3000/api/reports/analytics?startDate=2026-01-01&endDate=2026-12-31'
```

---

## 📊 Database Models

### Core Models
- **User** - Platform users with roles
- **Event** - Events/seminars with registration
- **Training** - Training courses with enrollments
- **Meeting** - Video meetings (Jitsi/Zoom)
- **Registration** - Event registrations with payments
- **Enrollment** - Training course enrollments
- **Certificate** - Issued certificates
- **Payment** - Payment transactions
- **Notification** - User notifications
- **Feedback** - Event/training feedback

---

## 🔐 Security Notes

1. **Passwords:** Currently stored in plain text for demo (⚠️ NOT for production)
   - Use bcrypt: `npm install bcryptjs`
   - Hash on register/reset

2. **JWT:** Implement middleware to verify tokens on protected routes

3. **Payments:** Use Stripe's server-side verification for webhooks

4. **CORS:** Add CORS middleware for API security

5. **Rate Limiting:** Implement rate limiting on auth endpoints

---

## 📁 New Files Created

### Configuration
- `prisma/schema.prisma` - Database schema
- `prisma/seed.ts` - Demo data seeding
- `.env.local` - Environment variables (create manually)

### API Routes
- `src/app/api/auth/login/route.ts` - Updated with DB
- `src/app/api/auth/register/route.ts` - New user registration
- `src/app/api/auth/forgot-password/route.ts` - Password reset request
- `src/app/api/auth/reset-password/route.ts` - Password reset confirmation
- `src/app/api/payments/create-intent/route.ts` - Payment intent creation
- `src/app/api/payments/webhook/route.ts` - Stripe webhook handler
- `src/app/api/certificates/issue/route.ts` - Certificate generation
- `src/app/api/reports/event/route.ts` - Event analytics
- `src/app/api/reports/training/route.ts` - Training analytics
- `src/app/api/reports/user/route.ts` - User activity report
- `src/app/api/reports/analytics/route.ts` - Platform analytics
- `src/app/api/emails/send/route.ts` - Email service

### Libraries
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/email.ts` - Email service with templates
- `src/lib/certificate.ts` - Certificate PDF generation

### Frontend Pages Updated
- `src/app/register/page.tsx` - Now calls registration API
- `src/app/forgot-password/page.tsx` - Now calls reset request API
- `src/app/reset-password/page.tsx` - Now calls reset confirmation API

---

## 📝 Next Steps

1. **Production Database:** Deploy PostgreSQL on Supabase or Railway
2. **Email Service:** Configure Gmail App Password or SendGrid
3. **Payment Setup:** Get Stripe keys and set up webhooks
4. **Security:** Implement bcrypt for passwords
5. **Frontend Components:** Build payment UI and report dashboards
6. **Monitoring:** Set up error tracking (Sentry, Datadog)

---

## 🆘 Troubleshooting

### "Database not reachable"
- Verify DATABASE_URL in .env.local
- Check PostgreSQL is running locally or Supabase is accessible
- Run `npm run db:studio` to test connection

### "Email not sending"
- Verify SMTP credentials in .env.local
- Enable "Less secure app access" for Gmail
- Check SMTP_PORT matches (587 for TLS, 465 for SSL)

### "Prisma client not found"
- Run `npm install @prisma/client`
- Run `npm run db:push` to generate client

### "Stripe webhook not triggering"
- Verify webhook URL is publicly accessible
- Check webhook secret in .env.local
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/payments/webhook`

---

## 📚 Documentation Links

- [Prisma Docs](https://www.prisma.io/docs)
- [Stripe API](https://stripe.com/docs/api)
- [Nodemailer Docs](https://nodemailer.com/)
- [PDF-lib Docs](https://pdf-lib.js.org/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

