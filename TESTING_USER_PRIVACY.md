# Testing User Data Privacy & Role-Based Access

## Overview
This guide provides step-by-step instructions to test that user data is properly isolated and role-based access control is working correctly.

## Test Accounts

| Name | Email | Role | User ID | Password |
|------|-------|------|---------|----------|
| Jose Dela Cruz | jose.dc@xplore.io | Admin | u-001 | (demo) |
| Maria Santos | maria.santos@xplore.io | Organizer | u-002 | (demo) |
| Anna Cruz | anna.cruz@xplore.io | Instructor | u-004 | (demo) |
| Carlos Bautista | carlos.bautista@xplore.io | Participant | u-007 | (demo) |

## Test Scenarios

### Test 1: Navigation Menu - Role-Based Visibility

**Test as Admin (Jose Dela Cruz):**
1. Login with `jose.dc@xplore.io`
2. Check sidebar navigation
3. ✅ Should see ALL menu items:
   - Dashboard
   - Events
   - Meetings
   - Live
   - Training
   - Programs
   - Analytics
   - **Users** (Admin only)
   - Notifications
   - Settings
4. Role indicator at bottom should show "Admin"

**Test as Participant (Carlos Bautista):**
1. Login with `carlos.bautista@xplore.io`
2. Check sidebar navigation
3. ✅ Should see LIMITED menu items:
   - Dashboard
   - Training
   - Programs
   - Notifications
   - Settings
4. ❌ Should NOT see:
   - Events
   - Meetings
   - Live
   - Analytics
   - Users
5. Role indicator should show "Participant"

**Expected Result:** Navigation menu adapts based on user role

---

### Test 2: Meetings Page - User-Specific Data

**Test as Admin (Jose Dela Cruz):**
1. Login as Admin
2. Navigate to `/meetings`
3. ✅ Should see ALL meetings:
   - Leadership Training Workshop (hosted by Maria Santos)
   - Product Review Meeting (hosted by John Reyes)
   - Weekly Team Sync (hosted by Jose Dela Cruz)
   - IT Infrastructure Review (hosted by Jose Dela Cruz)
4. Should be able to see meetings from all hosts

**Test as Participant (Carlos Bautista):**
1. Login as Participant
2. Try to navigate to `/meetings` (should not be visible in menu)
3. If accessing directly via URL, should see limited data
4. ✅ Should only see meetings where Carlos is the host
5. ❌ Should NOT see Maria's or John's meetings

**Expected Result:** 
- Admin sees all meetings
- Participant only sees their own hosted meetings

---

### Test 3: Events Page - Role-Based Access

**Test as Admin (Jose Dela Cruz):**
1. Login as Admin
2. Navigate to `/events`
3. ✅ Should see ALL events:
   - Annual Strategy Summit 2026 (organized by Maria Santos)
   - Product Launch Webinar (organized by John Reyes)
   - Team Building Activity (organized by Jose Dela Cruz)
   - HR Policy Town Hall (organized by Jose Dela Cruz)
4. Should be able to create, edit, and delete events

**Test as Organizer (Maria Santos):**
1. Login with `maria.santos@xplore.io`
2. Navigate to `/events`
3. ✅ Should see ALL events (Organizers have full event access)
4. Should be able to manage all events

**Test as Participant (Carlos Bautista):**
1. Login as Participant
2. Try to navigate to `/events` (should not be visible in menu)
3. ❌ Should NOT have access to events page
4. If accessed directly, should redirect or show access denied

**Expected Result:** 
- Admin and Organizer see all events
- Participant has no access to events management

---

### Test 4: Notifications - Complete Isolation

**Test as Admin (Jose Dela Cruz):**
1. Login as Admin
2. Navigate to `/notifications`
3. ✅ Should see 6 notifications (notif-001 to notif-005, notif-008):
   - Event Starting Soon
   - Meeting Invitation
   - New Module Published
   - Scheduled Maintenance
   - Registration Confirmed
   - New Feature: Live Streaming
4. ❌ Should NOT see Carlos's notifications
5. Unread count should show only Jose's unread notifications (3 unread)

**Test as Participant (Carlos Bautista):**
1. Login as Participant
2. Navigate to `/notifications`
3. ✅ Should see ONLY 2 notifications:
   - Training Completed 🎉 (notif-006)
   - Meeting Recording Available (notif-007)
4. ❌ Should NOT see Jose's or any other user's notifications
5. Unread count should show only Carlos's unread (1 unread)

**Mark as Read Test:**
1. As Carlos, mark "Training Completed" as read
2. Logout and login as Jose
3. ✅ Jose's notifications should be unchanged
4. Login back as Carlos
5. ✅ "Training Completed" should still be marked as read

**Expected Result:** 
- Notifications are completely isolated per user
- Even Admin only sees their own notifications
- Mark as read only affects current user's notifications

---

### Test 5: Dashboard - User-Specific Summary

**Test as Admin (Jose Dela Cruz):**
1. Login as Admin
2. View Dashboard
3. ✅ "Upcoming Events" should show all upcoming events (up to 3)
4. ✅ "Training Progress" should show Jose's training enrollments
5. ✅ Live session (if any) should show any live meeting
6. KPIs should reflect system-wide stats

**Test as Participant (Carlos Bautista):**
1. Login as Participant
2. View Dashboard
3. ✅ "Upcoming Events" should show only events Carlos organizes
4. ✅ "Training Progress" should show Carlos's training enrollments
5. ✅ Live session should show only meetings Carlos hosts (if live)
6. KPIs should reflect Carlos's personal stats

**Expected Result:**
- Dashboard shows user-specific data
- Admin sees system-wide view
- Participant sees personal view only

---

### Test 6: Users Management - Admin Only

**Test as Admin (Jose Dela Cruz):**
1. Login as Admin
2. Navigate to `/users`
3. ✅ Should see user management page
4. ✅ Should see all users listed:
   - Jose Dela Cruz (Admin)
   - Maria Santos (Organizer)
   - Anna Cruz (Instructor)
   - Carlos Bautista (Participant)
5. Should be able to:
   - View user details
   - Toggle user status (Active/Inactive)
   - Filter by role and status

**Test as Participant (Carlos Bautista):**
1. Login as Participant
2. Try to navigate to `/users` (should not be in menu)
3. Try accessing `/users` directly via URL
4. ❌ Should see "Access Denied" message
5. Should be redirected to `/dashboard`

**Expected Result:**
- Only Admin can access user management
- Other roles are blocked by RoleGuard

---

### Test 7: Analytics - Admin & Organizer Only

**Test as Admin (Jose Dela Cruz):**
1. Login as Admin
2. Navigate to `/analytics`
3. ✅ Should see analytics dashboard with:
   - KPI cards (Total Participants, Events Hosted, etc.)
   - Attendance Trend chart
   - Engagement Distribution
   - Training Completion Rate
4. Should show system-wide analytics

**Test as Organizer (Maria Santos):**
1. Login with `maria.santos@xplore.io`
2. Navigate to `/analytics`
3. ✅ Should see same analytics dashboard
4. Should have full access

**Test as Participant (Carlos Bautista):**
1. Login as Participant
2. Try to navigate to `/analytics` (should not be in menu)
3. Try accessing `/analytics` directly via URL
4. ❌ Should see "Access Denied" message
5. Should be redirected to `/dashboard`

**Expected Result:**
- Admin and Organizer can view analytics
- Other roles are blocked

---

### Test 8: Cross-User Data Leakage

**Test Scenario:**
1. Login as Jose (Admin) and note his data:
   - Number of meetings
   - Number of events
   - Notifications count
   - Training progress

2. Logout and login as Carlos (Participant)

3. ✅ Verify Carlos sees completely different data:
   - Different meetings list
   - Different events (or none)
   - Different notifications
   - Different training progress

4. ❌ Carlos should NOT see any of Jose's:
   - Private meetings
   - Organized events (unless invited)
   - Notifications
   - Training enrollments

**Expected Result:** Complete data isolation between users

---

### Test 9: Direct URL Access Attempts

**Test as Participant (Carlos Bautista):**
1. Login as Participant
2. Try to access restricted URLs directly:

**URL:** `/users`
- ❌ Should show "Access Denied" or redirect to `/dashboard`
- Should NOT show user management interface

**URL:** `/analytics`
- ❌ Should show "Access Denied" or redirect to `/dashboard`
- Should NOT show analytics data

**URL:** `/events`
- ❌ Should either show access denied or show only Carlos's events
- Should NOT show all system events

**Expected Result:** 
- Unauthorized pages are protected
- Direct URL access is blocked
- User is redirected or shown error

---

### Test 10: Session Persistence & Logout

**Test Session Persistence:**
1. Login as Jose (Admin)
2. Navigate around (Dashboard, Events, Users, Analytics)
3. Refresh the page (F5)
4. ✅ Should remain logged in as Jose
5. ✅ Should maintain same access level
6. ✅ Data should remain consistent

**Test Logout:**
1. Click logout/sign out
2. ✅ Should be redirected to login page
3. Try to access `/dashboard`
4. ❌ Should redirect to login
5. ✅ Session should be completely cleared

**Test Cross-Session:**
1. Login as Jose in one browser tab
2. Open new tab and login as Carlos
3. ✅ Each tab should show correct user's data
4. ✅ No data should leak between sessions

**Expected Result:**
- Sessions are properly maintained
- Logout clears session completely
- Multiple users can be logged in separately

---

## Test Checklist Summary

### Role-Based Navigation
- [ ] Admin sees all menu items including Users and Analytics
- [ ] Organizer sees Events, Meetings, Analytics (no Users)
- [ ] Instructor sees Meetings, Live (no Events, Analytics, Users)
- [ ] Participant sees only Dashboard, Training, Programs, Notifications, Settings

### Data Privacy
- [ ] Meetings filtered by user (Admin sees all, others see own)
- [ ] Events filtered by role (Admin/Organizer see all, others see own)
- [ ] Notifications completely isolated per user
- [ ] Dashboard shows user-specific data
- [ ] Training progress always personal

### Access Control
- [ ] Users page: Admin only
- [ ] Analytics page: Admin and Organizer only
- [ ] Events page: Admin and Organizer only
- [ ] Meetings page: Admin, Organizer, Instructor only

### Security
- [ ] Direct URL access is protected
- [ ] RoleGuard blocks unauthorized access
- [ ] API filters data by user and role
- [ ] No data leakage between users
- [ ] Sessions properly managed

## Common Issues & Solutions

### Issue: "Can't see my meetings"
**Solution:** Check if user is the host. Only hosts (and Admin) can see meetings.

### Issue: "Dashboard shows no events"
**Solution:** Participant role only sees events they organize. This is expected.

### Issue: "Can access restricted page"
**Solution:** Check if RoleGuard is properly implemented on the page.

### Issue: "Seeing other user's notifications"
**Solution:** Check userId filtering in notifications data fetch.

### Issue: "Menu items not hiding"
**Solution:** Check that `allowedRoles` array is properly configured in Sidebar.tsx.

## Automated Test Commands

```bash
# Check TypeScript compilation
npm run build

# Run linting
npm run lint

# Check for diagnostics (if using Kiro)
# Navigate to each file and check for red squiggles
```

## Security Best Practices Verified

✅ **Authentication:** User session is checked before showing data
✅ **Authorization:** Role is verified for page access
✅ **Data Filtering:** API filters by userId and userRole
✅ **Client Protection:** RoleGuard prevents unauthorized component access
✅ **Server Protection:** API routes filter data before sending
✅ **Session Management:** User context is properly maintained
✅ **Data Isolation:** Each user only sees their own data
✅ **Admin Override:** Admin can access all data for management

## Testing Complete! 🎉

If all tests pass, the system successfully implements:
- **Role-Based Access Control (RBAC)**
- **User Data Privacy & Isolation**
- **Secure API Filtering**
- **Protected Route Access**

Users like Jose Dela Cruz (Admin) and Carlos Bautista (Participant) now have completely separate data views with appropriate access levels!
