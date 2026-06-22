# Xplore Nexus - Intern Turnover Guide

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
   - Meetings: `/api/meetings/*`
   - Certificates: `/api/certificates/*`
   - Reports: `/api/reports/*` (event, training, user, analytics)
   - Emails: `/api/emails/send`

3. **Frontend Pages**
   - Authentication pages: login, register, forgot-password, reset-password
   - Dashboard overview
   - Events management (list, create, view, edit)
   - Meetings management (list, schedule, view)
   - Training management (catalog, enroll, view)
   - Analytics dashboard
   - User management (admin only)
   - Settings pages

4. **Integrations**
   - Stripe payment integration (webhooks ready)
   - Email system with Nodemailer (templates built)
   - Certificate generation with pdf-lib + QR codes
   - Zoom/Jitsi meeting integration (partial - needs completion)

### 🔧 Current Development Focus
According to the proposal and recent commits, the **video meeting features (Zoom integration)** are the primary focus for completion before the internship ends.### 🚨 Prototype Scope & Incomplete / Non-Functional Features
> [!IMPORTANT]
> **Prototype Status:** The current system is in a **foundational prototype / MVP stage**. While the visual layout files, routing, and database models are fully structured, many features are simulated and not fully integrated with a production database.
>
> * **localStorage Dependency:** Most frontend dashboards, payments, reports, and events pages run on client-side `localStorage` (Demo Mode) for testing. They need to be switched to utilize the Prisma database API endpoints (`/api/*`).
> * **Training Module Limitation:** Currently, **only exactly one training course module** (Microsoft Office Specialist: Excel Associate) is functional in the UI. Sourcing, course creation, syllabus editing, and lesson uploads are static placeholders and not yet connected to the PostgreSQL database.
> * **Jitsi Demonstration Limit:** Embedded Jitsi iframe calls are limited to **5 minutes per meeting** on the free public server (`meet.jit.si`). Upgrade to a paid 8x8 account or set up a self-hosted Jitsi Meet server for unlimited meeting lengths.
> * **Zoom Integration (Non-Functional):** The Zoom scheduler lacks active OAuth credentials and needs S2S Helper library completion.
> * **Security Gaps:** Plain-text credentials are used in demo modes. Hashing (bcryptjs) and protected JWT middleware are not fully enforced in the backend.

## Technical Stack Summary
- **Frontend**: Next.js 14.2.3 (TypeScript), Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase recommended)
- **Authentication**: JWT-based with Supabase Auth
- **Payments**: Stripe/PayMongo integration
- **Email**: Nodemailer with SMTP
- **Certificates**: pdf-lib + qrcode
- **Video**: Zoom API (primary focus for completion)

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

# Zoom (NEXT STEPS - Primary Focus)
NEXT_PUBLIC_ZOOM_CLIENT_ID="your-zoom-client-id"
ZOOM_CLIENT_SECRET="your-zoom-client-secret"
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

### 5. Test User Accounts & Credentials
For local development testing, user acceptance testing (UAT), and rapid prototyping, the application database (and demo localStorage) contains several pre-configured test user accounts representing different roles.

| Role / Account Name | Email Address / Username | Password Placeholder | Access Rights & Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | `john@xplore.com` | `[ENTER ADMIN PASSWORD MANUALLY]` | Full administrative access. Authorized to manage events, schedule meetings, create training courses, view global reporting dashboards, and configure system settings. |
| **Participant / User** | `sarah@xplore.com` | `[ENTER PARTICIPANT PASSWORD MANUALLY]` | Standard participant access. Authorized to browse the course catalog, register for events, enroll in classes, join Jitsi meetings, download issued certificates, and test Stripe checkout simulation. |
| **Instructor** | `instructor@xplore.com` | `[ENTER INSTRUCTOR PASSWORD MANUALLY]` | Instructor portal access. Authorized to manage assigned training syllabi, upload course content modules, track student enrollment progress, and schedule training classes. |
| **Event Organizer** | `organizer@xplore.com` | `[ENTER ORGANIZER PASSWORD MANUALLY]` | Event coordinator access. Authorized to create and manage seminars/events, track registrations, schedule meeting links, and generate attendance reports. |

> [!CAUTION]
> **Credential Exposure Warning:** To ensure system security, the actual passwords for these test accounts are left blank. The developer/owner must fill them in manually. Since these accounts may grant administrative access to the development and staging environments, **DO NOT** commit the populated credentials file to GitHub or any public version control systems. Always list `.env.local` and production documentation folders in your `.gitignore`.

## 🎯 Primary Focus: Video Meeting Features Completion

Based on the proposal and code analysis, the **Zoom integration for meeting features** needs completion. Here's what needs to be done:

### Current State of Meeting Features
- Meeting model exists in Prisma schema with Zoom fields:
  - `meetingUrl String?` // Jitsi or Zoom URL
  - `meetingProvider String @default("jitsi")` // jitsi, zoom
  - `zoomMeetingId String?`
- Basic meeting pages exist:
  - `/app/(app)/meetings/page.tsx` (list view)
  - `/app/(app)/meetings/create` (schedule form)
  - `/app/(app)/meetings/[id]/room.tsx` (meeting room)
  - `/app/api/meetings/route.ts` (API endpoint)

### What Needs to be Completed

#### 1. Zoom API Integration
**Files to work on:**
- `src/lib/zoom.ts` (was deleted - needs recreation)
- `src/app/api/meetings/route.ts` (enhance for Zoom)
- `src/app/(app)/meetings/create/page.tsx` (enhance form)
- `src/app/(app)/meetings/[id]/room/page.tsx` (enhance joining)

**Specific Tasks:**
- [ ] Recreate Zoom helper library (`src/lib/zoom.ts`)
- [ ] Implement OAuth flow for Zoom API (if needed) or JWT authentication
- [ ] Create meeting via Zoom API when scheduling
- [ ] Join meeting via Zoom SDK or redirect when accessing meeting room
- [ ] Handle meeting lifecycle (start, end, recording)
- [ ] Store Zoom meeting IDs and URLs in database
- [ ] Add error handling for Zoom API failures

#### 2. Meeting UI Enhancements
**Files to enhance:**
- `src/app/(app)/meetings/create/page.tsx`
- `src/app/(app)/meetings/[id]/room/page.tsx`
- `src/components/meeting/*` (if exists)

**Specific Tasks:**
- [ ] Add provider selection (Jitsi/Zoom) in meeting creation form
- [ ] Show appropriate join button based on provider
- [ ] Display meeting status (Upcoming, Live, Completed)
- [ ] Show participant count and host information
- [ ] Add meeting controls for host (if Zoom host)

#### 3. API Endpoint Enhancements
**File:** `src/app/api/meetings/route.ts`

**Specific Tasks:**
- [ ] Enhance POST endpoint to create Zoom meetings when provider=zoom
- [ ] Enhance GET endpoint to return Zoom join URLs
- [ ] Add webhook handling for Zoom events (if needed)
- [ ] Implement proper error responses

### 4. Testing Procedures
- [ ] Test meeting creation with both Jitsi and Zoom providers
- [ ] Test joining meetings from the meeting room page
- [ ] Verify meeting data is correctly stored in database
- [ ] Test error handling (invalid credentials, API limits, etc.)
- [ ] Check responsive design on mobile devices

## 📁 Important Files to Review

### Core Backend
- `prisma/schema.prisma` - Database models (especially Meeting model)
- `src/lib/prisma.ts` - Prisma client singleton
- `src/app/api/meetings/route.ts` - Meeting API endpoints
- `src/app/api/auth/*` - Authentication (for understanding token handling)

### Frontend Components
- `src/app/(app)/meetings/` - Meeting pages
- `src/components/layout/` - Navbar, Footer, Sidebar
- `src/app/layout.tsx` - Root layout
- `src/app/page.tsx` - Home page

### Configuration
- `.env.example` - Environment variable template
- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS setup
- `tsconfig.json` - TypeScript configuration

### Documentation
- `SETUP_GUIDE.md` - Detailed setup instructions
- `PROJECT PROPOSAL (Final).docx` - Original requirements (reference)
- `xplore_nexus_timeline.md` - Development timeline

## 🎥 Percipio Skillsoft Video Sourcing Guide
Sourcing high-quality video content is essential to expanding the course catalog on Xplore Nexus. Since direct API integrations with Percipio's private video delivery network are not part of the current MVP scope, the following step-by-step procedure is used for manually downloading training videos from Percipio Skillsoft and uploading them to the platform's training modules:

1. **Install Browser Extension (Video DownloadHelper):**
   Open Google Chrome or Mozilla Firefox and search for the browser extension named **"Video DownloadHelper"**. Add the extension to your browser. Once installed, its icon (three colored spheres) will appear in your browser's toolbar/extension list.
2. **Access Percipio and Locate Certification:**
   Log in to your Percipio Skillsoft account. Go to the **Certification Center** and search/browse for the certification program you wish to source (for example, `vendorLogoMO-210: Microsoft Office Specialist: Excel Associate (Microsoft 365 Apps)`).
3. **Open Certification Syllabus & Course:**
   Click **Find** and select the certification page to view the syllabus tree. Click on any specific course in the syllabus list to open the video player with the lesson contents on the side panel.
4. **Play Video and Download Chapters:**
   Start playing the lesson video. While it is playing, click the **Video DownloadHelper** extension icon in your browser toolbar. The extension will highlight the active video stream. Click on it, select **Download**, and choose a folder on your computer to save the file.
5. **Integrate with Xplore Nexus:**
   Once the video files are saved locally, copy the lesson titles/descriptions and upload the video files to your cloud storage bucket (e.g., Supabase Storage). Link the public/authenticated URLs to the corresponding training modules in the Xplore Nexus Admin Training Portal. Repeat this workflow for each video in the syllabus.
6. **Alternative Sourcing Methods:**
   This manual process is currently the only tested workflow for securing offline course chapters. However, this is completely optional; developers are free to use any legitimate media downloader or alternative tools they prefer.

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
   
6. **Jitsi Demonstration Limit**: In the demo/prototype configuration, the public Jitsi Meet iframe API (meet.jit.si) limits embedded meeting sessions to exactly 5 minutes per session.
   - **Action needed**: For production, upgrade to Jitsi's paid enterprise tier (via 8x8 Developer Platform) or set up a self-hosted private Jitsi Meet server. (Note: The 5-minute cap only applies to embedded iframe calls, not standard browser redirects to the public room URL via "Open in New Tab").

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
- **Zoom API**: https://marketplace.zoom.us/docs/api-reference/zoom-api
- **Stripe API**: https://stripe.com/docs/api
- **Nodemailer**: https://nodemailer.com/about/

### Project Specific
- Review the extracted proposal text (`extracted_proposal.txt`)
- Examine the Figma design (if accessible): https://dijon-small-23782660.figma.site/
- Study existing API routes for patterns
- Look at authentication flow in `/app/(app)/layout.tsx`

## 📈 Success Criteria for Internship Completion

By the end of your internship, you should aim to have:

1. **✅ Video Meeting Features Complete**
   - Users can schedule meetings with Zoom provider option
   - Meetings scheduled with Zoom create actual Zoom meetings
   - Users can join Zoom meetings directly from the platform
   - Meeting data (URL, ID, provider) correctly stored in database
   - Proper error handling for Zoom API failures
   - Both Jitsi and Zoom providers functional

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
   - Walk through the video meeting implementation
   - Show how to test the features
   - Point out any known issues or areas needing attention

4. **Final Checks**
   - Run `pnpm dev` and verify application starts correctly
   - Test core authentication flow (register → login → dashboard)
   - Test event creation and registration
   - **MOST IMPORTANT**: Test meeting scheduling and joining with both providers
   - Verify database connectivity and seed data

## 💡 Encouragement and Next Steps

You've inherited a well-structured foundation with most core features implemented. The video meeting completion is a meaningful and achievable goal that will significantly enhance the platform's value.

Focus on:
1. Understanding the existing meeting-related code
2. Implementing the Zoom integration step by step
3. Testing thoroughly with both sandbox and real Zoom accounts (if available)
4. Maintaining code quality consistent with the rest of the project

Remember that the goal is to deliver a functional prototype, not necessarily a perfect production system. Prioritize getting the core Zoom meeting functionality working reliably over edge cases or advanced features.

Good luck with completing the video meeting features! The organization will benefit greatly from your work on unifying their event, meeting, and training management into this single platform.

---
*Turnover document prepared for Xplore Nexus intern handover - June 4, 2026*