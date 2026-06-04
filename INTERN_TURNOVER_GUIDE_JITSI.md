# Xplore Nexus - Intern Turnover Guide (Jitsi Focus)

## Project Overview
Xplore Nexus is a centralized SaaS platform designed to streamline event management, meeting coordination, and training delivery within Informatics Holdings Philippines, Inc. The platform integrates key operational components into a single system to eliminate fragmented workflows and provide a seamless user experience.

## Current System Status (as of June 4, 2026)

### ✅ Completed Features
Based on the codebase analysis and setup guide:

1. **Database Layer (Prisma + PostgreSQL/Supabase)**
   - Complete database schema with all models implemented
   - User management with roles (Admin, Organizer, Instructor, Participant)
   - Events, registrations, training, meetings, certificates models
   - Payment tracking and analytics tables

2. **API Endpoints Implemented**
   - Authentication: `/api/auth/*` (login, register, forgot-password, reset-password)
   - Payments: `/api/payments/*` (create-intent, webhook)
   - Events: `/api/events/*` and `/api/events/[id]/*`
   - Training: `/api/training/*` and `/api/training/[id]/*`
   - Meetings: `/api/meetings/*` (Jitsi-focused)
   - Certificates: `/api/certificates/*`
   - Reports: `/api/reports/*` (event, training, user, analytics)
   - Emails: `/api/emails/send`

3. **Frontend Pages**
   - Authentication pages: login, register, forgot-password, reset-password
   - Dashboard overview
   - Events management (list, create, view, edit)
   - Meetings management (list, schedule, view) - Jitsi integrated
   - Training management (catalog, enroll, view)
   - Analytics dashboard
   - User management (admin only)
   - Settings pages

4. **Integrations**
   - Stripe payment integration (webhooks ready)
   - Email system with Nodemailer (templates built)
   - Certificate generation with pdf-lib + QR codes
   - **Jitsi meeting integration** (primary focus - needs completion/enhancement)

### 🔧 Current Development Focus
According to your clarification, the **Jitsi meeting features** are the primary focus for completion before the internship ends, not Zoom API.

## Technical Stack Summary
- **Frontend**: Next.js 14.2.3 (TypeScript), Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase recommended)
- **Authentication**: JWT-based with Supabase Auth
- **Payments**: Stripe/PayMongo integration
- **Email**: Nodemailer with SMTP
- **Certificates**: pdf-lib + qrcode
- **Video**: **Jitsi Meet** (primary focus for completion/enhancement)

## Setup Instructions for Next Intern

### 1. Environment Setup
```bash
# Clone repository (if not already done)
git clone <repository-url>
cd xplore-nexus

# Install dependencies (USE PNPM as specified)
pnpm install

# Copy environment template
cp .env.example .env.local
```

### 2. Required Environment Variables (.env.local)
```env
# Database (Supabase)
DATABASE_URL="postgresql://[user]:[password]@[host]:5432/postgres"

# Authentication
JWT_SECRET="your-32-char-minimum-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@xplore.io"

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_PUBLIC_KEY="pk_test_xxx"
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_xxx"

# Jitsi (CURRENT FOCUS)
# Jitsi typically doesn't require API keys for basic usage
# But you may need to configure:
NEXT_PUBLIC_JITSI_DOMAIN="meet.jit.si"  # or your self-hosted domain
# If using token authentication:
# JITSI_APP_ID="your-app-id"
# JITSI_APP_SECRET="your-app-secret"
```

### 3. Database Setup
```bash
# Push schema to database
pnpm run db:push

# Seed initial data (if needed)
pnpm run db:seed

# Optional: View data in studio
pnpm run db:studio
```

### 4. Development Server
```bash
pnpm dev
# App available at http://localhost:3000
```

## 🎯 Primary Focus: Jitsi Meeting Features Completion/Enhancement

Based on your clarification, you're working with **Jitsi** for video meetings, not Zoom. Here's what needs to be done to complete/enhance the Jitsi meeting features:

### Current State of Meeting Features (Jitsi)
- Meeting model exists in Prisma schema with Jitsi-relevant fields:
  - `meetingUrl String?` // Jitsi or Zoom URL (will be Jitsi URL)
  - `meetingProvider String @default("jitsi")` // jitsi, zoom (currently defaulted to jitsi)
- Basic meeting pages exist:
  - `/app/(app)/meetings/page.tsx` (list view)
  - `/app/(app)/meetings/create` (schedule form)
  - `/app/(app)/meetings/[id]/room/page.tsx` (meeting room)
  - `/app/api/meetings/route.ts` (API endpoint)

### What Needs to be Completed/Enhanced

#### 1. Jitsi Integration Enhancement
**Files to work on:**
- `src/lib/jitsi.ts` (may need creation or enhancement)
- `src/app/api/meetings/route.ts` (enhance for Jitsi)
- `src/app/(app)/meetings/create/page.tsx` (enhance form)
- `src/app/(app)/meetings/[id]/room/page.tsx` (enhance joining UI)

**Specific Tasks:**
- [ ] Ensure Jitsi meeting URLs are properly generated
- [ ] Implement any needed Jitsi API calls (if using self-hosted with authentication)
- [ ] Enhance meeting room page to properly embed Jitsi iframe
- [ ] Add features like: lobby controls, recording options (if available), participant management
- [ ] Handle meeting lifecycle events (start, end) via Jitsi API if applicable
- [ ] Store correct Jitsi meeting URLs in database
- [ ] Add error handling for Jitsi connection failures

#### 2. Meeting UI Enhancements
**Files to enhance:**
- `src/app/(app)/meetings/create/page.tsx`
- `src/app/(app)/meetings/[id]/room/page.tsx`
- `src/components/meeting/*` (if exists)

**Specific Tasks:**
- [ ] Confirm provider is set to "jitsi" by default (check form)
- [ ] Improve meeting room UI with Jitsi iframe embedding
- [ ] Display meeting status (Upcoming, Live, Completed)
- [ ] Show participant count and host information
- [ ] Add meeting controls: mute/unmute, video on/off, screen share (via Jitsi API)
- [ ] Implement lobby/waiting room features if using secure domain
- [ ] Add option to invite others to meeting
- [ ] Show meeting details: title, description, scheduled time

#### 3. API Endpoint Enhancements
**File:** `src/app/api/meetings/route.ts`

**Specific Tasks:**
- [ ] Ensure POST endpoint generates proper Jitsi meeting URLs
- [ ] Format: `https://meet.jit.si/[meeting-name]` or similar
- [ ] Add meeting password/security options if needed
- [ ] Enhance GET endpoint to return correct meeting data
- [ ] Add endpoints for meeting controls if needed (start recording, etc.)
- [ ] Implement proper error responses

### 4. Testing Procedures
- [ ] Test meeting creation generates valid Jitsi URLs
- [ ] Test joining meetings from the meeting room page loads Jitsi correctly
- [ ] Verify meeting data is correctly stored in database
- [ ] Test basic Jitsi features: audio/video, screen sharing, chat
- [ ] Test error handling (invalid meeting URLs, connection issues)
- [ ] Check responsive design on mobile devices
- [ ] Test meeting scheduling for future dates
- [ ] Verify past meetings show as completed

## 📁 Important Files to Review

### Core Backend
- `prisma/schema.prisma` - Database models (especially Meeting model)
- `src/lib/prisma.ts` - Prisma client singleton
- `src/app/api/meetings/route.ts` - Meeting API endpoints
- `src/app/api/auth/*` - Authentication (for understanding token handling)

### Frontend Components
- `src/app/(app)/meetings/` - Meeting pages (PRIMARY FOCUS)
- `src/components/layout/` - Navbar, Footer, Sidebar
- `src/app/layout.tsx` - Root layout
- `src/app/page.tsx` - Home page

### Potential Jitsi Helper
- `src/lib/jitsi.ts` - May need creation/enhancement
- `src/lib/utils.ts` - General utilities

### Configuration
- `.env.example` - Environment variable template
- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS setup
- `tsconfig.json` - TypeScript configuration

### Documentation
- `SETUP_GUIDE.md` - Detailed setup instructions
- `PROJECT PROPOSAL (Final).docx` - Original requirements (reference)
- `xplore_nexus_timeline.md` - Development timeline

## 🔍 Code Quality & Standards

### Naming Conventions
- Use camelCase for variables and functions
- Use PascalCase for components and types
- Use UPPER_SNAKE_CASE for constants and environment variables
- Prefix boolean variables with `is`, `has`, `should`, etc.

### File Organization
- Components: `src/components/`
- Pages: `src/app/` (Next.js App Router)
- API Routes: `src/app/api/`
- Libraries: `src/lib/`
- Styles: Tailwind CSS classes (no CSS files except globals.css)
- Types: `src/types/` or inline with JSDoc

### Best Practices Observed
- Proper error handling with try/catch in API routes
- Environment variable usage with process.env
- Prisma client singleton pattern
- Role-based access control in API routes
- Form validation (likely using Zod or similar)

## 🚨 Known Issues & Limitations

### From SETUP_GUIDE.md Security Notes:
1. **Passwords**: Currently stored in plain text for demo (⚠️ NOT for production)
   - **Action needed**: Implement bcryptjs for password hashing
   
2. **JWT**: Implement middleware to verify tokens on protected routes
   - **Status**: Likely partially implemented, needs verification
   
3. **Payments**: Use Stripe's server-side verification for webhooks
   - **Status**: Webhook endpoint exists, verification needs checking
   
4. **CORS**: Add CORS middleware for API security
   - **Status**: Needs investigation
   
5. **Rate Limiting**: Implement rate limiting on auth endpoints
   - **Status**: Not implemented

### Jitsi-Specific Considerations:
- [ ] If using self-hosted Jitsi, need to configure domain and possibly authentication
- [ ] Public Jitsi (meet.jit.si) has no authentication - meetings are accessible by anyone with the link
- [ ] For production, may need to implement JWT tokens for Jitsi security
- [ ] Consider recording options and storage if needed
- [ ] Check browser compatibility for Jitsi features

### Technical Debt Items:
- [ ] Password security (bcrypt implementation)
- [ ] Comprehensive error boundaries
- [ ] Loading states and skeletons for better UX
- [ ] Accessibility improvements (aria labels, keyboard navigation)
- [ ] SEO optimization for public pages
- [ ] Comprehensive testing (unit, integration, e2e)
- [ ] Performance optimization (code splitting, image optimization)
- [ ] Docker configuration for easier deployment
- [ ] CI/CD pipeline enhancements

## 📚 Learning Resources

### Technology Specific
- **Next.js App Router**: https://nextjs.org/docs/app
- **Prisma ORM**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Jitsi Meet API**: https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe
- **Jitsi Meet External API**: https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-external-api
- **Stripe API**: https://stripe.com/docs/api
- **Nodemailer**: https://nodemailer.com/about/

### Project Specific
- Review the extracted proposal text (`extracted_proposal.txt`)
- Examine the Figma design (if accessible): https://dijon-small-23782660.figma.site/
- Study existing API routes for patterns
- Look at authentication flow in `/app/(app)/layout.tsx`
- Check current meeting implementation in `/app/(app)/meetings/`

## 📈 Success Criteria for Internship Completion

By the end of your internship, you should aim to have:

1. **✅ Jitsi Meeting Features Complete/Enhanced**
   - Users can schedule meetings that generate valid Jitsi URLs
   - Meeting room page properly loads Jitsi interface
   - Basic Jitsi features work: audio/video, screen sharing, chat
   - Meeting data (URL, provider) correctly stored in database
   - Proper error handling for meeting failures
   - Responsive design works on mobile and desktop

2. **✅ System Stability**
   - No regressions in existing functionality
   - All previously working features still functional
   - Database migrations work correctly
   - Environment setup documented and working

3. **✅ Documentation**
   - Code is well-commented where complex logic exists
   - README updated if significant changes made
   - Any new environment variables documented in .env.example

4. **✅ Best Practices Followed**
   - Consistent with existing code style
   - Proper error handling
   - Secure implementation (no secrets in client code)
   - Responsive design considerations

## 🤝 Final Handover Process

Before your internship ends:

1. **Code Review**
   - Ensure all code is committed and pushed to main branch
   - Create a pull request for review if using branch workflow
   - Address any feedback from reviewers

2. **Documentation Update**
   - Update SETUP_GUIDE.md if new setup steps needed
   - Ensure .env.example reflects all required variables
   - Update this turnover guide if you discover additional important info

3. **Knowledge Transfer**
   - Schedule a handover meeting with your supervisor
   - Walk through the Jitsi meeting implementation
   - Show how to test the features
   - Point out any known issues or areas needing attention

4. **Final Checks**
   - Run `pnpm dev` and verify application starts correctly
   - Test core authentication flow (register → login → dashboard)
   - Test event creation and registration
   - **MOST IMPORTANT**: Test meeting scheduling and joining with Jitsi
   - Verify database connectivity and seed data
   - Test on different browsers (Chrome, Firefox, Safari) if possible

## 💡 Encouragement and Next Steps

You've inherited a well-structured foundation with most core features implemented. The Jitsi meeting enhancement is a meaningful and achievable goal that will significantly enhance the platform's value.

Focus on:
1. Understanding the existing meeting-related code
2. Implementing/enhancing the Jitsi integration step by step
3. Testing thoroughly with the Jitsi iframe API
4. Maintaining code quality consistent with the rest of the project

Remember that the goal is to deliver a functional prototype, not necessarily a perfect production system. Prioritize getting the core Jitsi meeting functionality working reliably over edge cases or advanced features.

Good luck with completing the Jitsi meeting features! The organization will benefit greatly from your work on unifying their event, meeting, and training management into this single platform.

---
*Turnover document prepared for Xplore Nexus intern handover - June 4, 2026*