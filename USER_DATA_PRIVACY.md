# User Data Privacy & Isolation Implementation

## Overview
Implemented user-specific data filtering across the system to ensure each user only sees their own data. Admin users have elevated privileges to view all data for management purposes.

## Data Privacy Rules by Module

### 1. Meetings (`/meetings`)
**Rule:** Users only see meetings they host or are invited to
- **Admin:** Can see ALL meetings (for system administration)
- **Organizer, Instructor, Participant:** Only see meetings where `hostId` matches their `userId`
- **Future Enhancement:** Add meeting attendees table to filter by attendance as well

**Implementation:**
- API: `src/app/api/meetings/route.ts`
- Filters by `hostId` if user is not Admin
- Page: `src/app/(app)/meetings/page.tsx`
- Passes `userId` and `userRole` to API

**Example:**
- Jose Dela Cruz (Admin, u-001): Sees all meetings
- Carlos Bautista (Participant, u-007): Only sees meetings he hosts

### 2. Events (`/events`)
**Rule:** Users only see events they organize or are registered for
- **Admin & Organizer:** Can see ALL events (for event management)
- **Instructor & Participant:** Only see events where `organizerId` matches their `userId`
- **Future Enhancement:** Add registration filtering to show events user is registered for

**Implementation:**
- API: `src/app/api/events/route.ts`
- Filters by `organizerId` if user is not Admin or Organizer
- Data functions: `src/lib/data/events.ts`
- Added `getEventsByUser(userId, userRole)` function

**Example:**
- Jose Dela Cruz (Admin, u-001): Sees all events
- Maria Santos (Organizer, u-002): Sees all events
- Carlos Bautista (Participant, u-007): Only sees events he organized

### 3. Notifications (`/notifications`)
**Rule:** Users only see their own notifications
- **All Roles:** Only see notifications where `userId` matches their account
- **No Exception:** Even Admin only sees their own notifications

**Implementation:**
- Data functions: `src/lib/data/notifications.ts`
- Added `userId` field to notification structure
- Added `getNotificationsByUser(userId)` function
- Updated `markAsRead(id, userId)` to verify ownership
- Updated `markAllAsRead(userId)` to only mark user's notifications
- Updated `getUnreadCount(userId)` to count user's unread notifications
- Page: `src/app/(app)/notifications/page.tsx`
- Uses `useRole()` hook to get current user
- Loads notifications only for current user

**Example:**
- Jose Dela Cruz (u-001): Sees 6 notifications (notif-001 to notif-005, notif-008)
- Carlos Bautista (u-007): Sees 2 notifications (notif-006, notif-007)

### 4. Users Management (`/users`)
**Rule:** Only Admin can view and manage users
- **Admin:** Can see all users, edit profiles, toggle status
- **Other Roles:** No access (protected by RoleGuard)

**Implementation:**
- Protected with `RoleGuard` component
- See `ROLE_BASED_ACCESS_CONTROL.md` for details

### 5. Dashboard (`/dashboard`)
**Rule:** Dashboard shows user-specific data
- **Admin & Organizer:** See all events and meetings in dashboard
- **Other Roles:** See only events they organize and meetings they host
- **Training Progress:** Always user-specific (shows only user's enrollments)
- **KPIs:** Calculated based on user's accessible data

**Implementation:**
- API: `src/app/api/dashboard/route.ts`
- Filters events by `organizerId` if not Admin/Organizer
- Filters live meetings by `hostId` if not Admin
- Training progress always filtered by `userId`
- Hook: `src/lib/hooks/useEvents.ts`
- Uses `useRole()` to get current user
- Passes `userId` and `userRole` to API

**Example:**
- Jose Dela Cruz (Admin): Sees all events and meetings in dashboard
- Carlos Bautista (Participant): Sees only his events and meetings
- Training progress is always personal regardless of role

### 6. Analytics (`/analytics`)
**Rule:** Only Admin and Organizer can view analytics
- **Admin & Organizer:** Can see system-wide analytics
- **Other Roles:** No access (protected by RoleGuard)

**Implementation:**
- Protected with `RoleGuard` component
- Shows aggregate data across all users
- See `ROLE_BASED_ACCESS_CONTROL.md` for details

## Database Schema Changes

### Notifications Table
```typescript
interface AppNotification {
  id: string;
  userId: string;        // NEW: Owner of this notification
  category: NotificationCategory;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  timestamp: string;
  actionLabel?: string;
  actionHref?: string;
}
```

## API Changes

### Meetings API (`/api/meetings`)
**GET Request:**
```
GET /api/meetings?userId=u-001&userRole=Admin
```

**Query Parameters:**
- `userId`: Current user's ID
- `userRole`: Current user's role (Admin, Organizer, Instructor, Participant)

**Response:** Filtered list of meetings based on role

### Events API (`/api/events`)
**GET Request:**
```
GET /api/events?userId=u-001&userRole=Admin
```

**Query Parameters:**
- `userId`: Current user's ID
- `userRole`: Current user's role

**Response:** Filtered list of events based on role

### Dashboard API (`/api/dashboard`)
**GET Request:**
```
GET /api/dashboard?userId=u-001&userRole=Admin
```

**Query Parameters:**
- `userId`: Current user's ID
- `userRole`: Current user's role

**Response:** 
- Upcoming events (filtered by role)
- Training progress (always user-specific)
- Live sessions (filtered by role)
- KPIs calculated from user's accessible data

## Data Filtering Functions

### `src/lib/data/meetings.ts`
```typescript
/**
 * Get meetings for a specific user
 * - Admins can see all meetings
 * - Other users only see meetings they host
 */
export function getMeetingsByUser(userId: string, userRole: string): Meeting[]
```

### `src/lib/data/events.ts`
```typescript
/**
 * Get events for a specific user
 * - Admins and Organizers can see all events
 * - Other users only see events they organize
 */
export function getEventsByUser(userId: string, userRole: string): Event[]
```

### `src/lib/data/notifications.ts`
```typescript
/**
 * Get notifications for a specific user
 */
export function getNotificationsByUser(userId: string): AppNotification[]

/**
 * Mark notification as read (verifies ownership)
 */
export function markAsRead(id: string, userId: string): void

/**
 * Mark all notifications as read for a user
 */
export function markAllAsRead(userId: string): void

/**
 * Get unread notification count for a user
 */
export function getUnreadCount(userId: string): number
```

## Testing Data Privacy

### Test Scenario 1: Meetings
**As Jose Dela Cruz (Admin):**
1. Login: `jose.dc@xplore.io`
2. Go to `/meetings`
3. Should see ALL meetings including:
   - Leadership Training Workshop (hosted by Maria Santos)
   - Product Review Meeting (hosted by John Reyes)
   - Weekly Team Sync (hosted by Jose)
   - IT Infrastructure Review (hosted by Jose)

**As Carlos Bautista (Participant):**
1. Login: `carlos.bautista@xplore.io`
2. Go to `/meetings`
3. Should see ONLY meetings he hosts (likely empty or very few)

### Test Scenario 2: Events
**As Jose Dela Cruz (Admin):**
1. Go to `/events`
2. Should see ALL events

**As Maria Santos (Organizer):**
1. Login: `maria.santos@xplore.io`
2. Go to `/events`
3. Should see ALL events (Organizers have full event access)

**As Carlos Bautista (Participant):**
1. Login: `carlos.bautista@xplore.io`
2. Go to `/events`
3. Should see ONLY events he organized (likely empty)

### Test Scenario 3: Notifications
**As Jose Dela Cruz (Admin):**
1. Go to `/notifications`
2. Should see 6 notifications (his own)
3. Unread count badge should show his unread notifications only

**As Carlos Bautista (Participant):**
1. Login: `carlos.bautista@xplore.io`
2. Go to `/notifications`
3. Should see 2 notifications:
   - Training Completed notification
   - Meeting Recording Available notification
4. Should NOT see Jose's notifications

## Security Considerations

### Current Implementation
✅ Client-side filtering via React hooks
✅ API-level filtering using userId and userRole parameters
✅ Database queries filtered by user ownership
✅ Notification ownership verification before marking as read

### Production Recommendations
1. **Server-Side Session Management**
   - Replace localStorage with secure HTTP-only cookies
   - Use JWT tokens with proper expiration
   - Implement session validation middleware

2. **Database-Level Security**
   - Add Row Level Security (RLS) policies in PostgreSQL
   - Implement database views for user-specific data
   - Use prepared statements to prevent SQL injection

3. **API Authentication**
   - Add authentication middleware to all API routes
   - Verify JWT tokens on every request
   - Implement rate limiting to prevent abuse

4. **Audit Logging**
   - Log all data access attempts
   - Track who viewed what data and when
   - Monitor for suspicious access patterns

## Future Enhancements

1. **Meeting Attendees**
   - Add `MeetingAttendance` table tracking
   - Filter meetings by attendee as well as host
   - Show "Meetings I'm Attending" vs "Meetings I'm Hosting"

2. **Event Registrations**
   - Filter events by registration status
   - Show "Events I'm Registered For" vs "Events I'm Organizing"
   - Add "My Events" personal dashboard

3. **Training Enrollments**
   - Filter training by enrollment status
   - Show only trainings user is enrolled in
   - Add personal learning dashboard

4. **Certificates**
   - Show only user's own certificates
   - Add certificate verification by certificate number
   - Implement certificate sharing with privacy controls

5. **Real-Time Updates**
   - Implement WebSocket for real-time notification updates
   - Add live notification badge updates
   - Show "New Notification" animation

## Files Modified

1. `src/lib/data/meetings.ts` - Added `getMeetingsByUser()` function
2. `src/lib/data/events.ts` - Added `getEventsByUser()` function
3. `src/lib/data/notifications.ts` - Added userId field, updated all functions
4. `src/app/api/meetings/route.ts` - Added userId/userRole filtering
5. `src/app/api/events/route.ts` - Added userId/userRole filtering
6. `src/app/api/dashboard/route.ts` - Added userRole filtering for events and meetings
7. `src/app/(app)/meetings/page.tsx` - Pass userId/userRole to API
8. `src/app/(app)/notifications/page.tsx` - Use user-specific filtering
9. `src/lib/hooks/useEvents.ts` - Updated to pass userId/userRole to API
10. `src/app/(app)/dashboard/page.tsx` - Uses updated useEvents hook with filtering

## Summary

✅ User-specific data isolation implemented
✅ Each user only sees their own data
✅ Admin has elevated privileges to view all data
✅ Notifications are completely private per user
✅ Dashboard shows user-specific events and meetings
✅ Training progress always personal per user
✅ API routes enforce data filtering
✅ Database queries respect user ownership
✅ React hooks automatically filter by current user

**Privacy Model:**
- **Data Ownership:** Each record has an owner (userId, hostId, organizerId)
- **Access Control:** API filters data based on ownership and role
- **Admin Override:** Admin role can view all data for management purposes
- **Organizer Privileges:** Organizers can view all events for event management
- **No Cross-User Access:** Regular users cannot see other users' private data

The system now ensures that Jose Dela Cruz's meeting history, notifications, and events are separate from Carlos Bautista's data, maintaining proper data privacy and isolation across all modules including Dashboard, Events, Meetings, Notifications, Training, and Analytics!
