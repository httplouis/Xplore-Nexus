# Role-Based Access Control (RBAC) Implementation

## Overview
Implemented role-based access control to restrict page access and navigation based on user roles. Currently focused on **Admin** and **Participant** views.

## User Roles (Database Schema)
From `prisma/schema.prisma`:
```prisma
enum UserRole {
  ADMIN
  ORGANIZER
  INSTRUCTOR
  PARTICIPANT
}
```

## Current User Accounts
From `src/lib/data/demo-accounts.ts`:

| Name | Email | Role | Access Level |
|------|-------|------|-------------|
| Jose Dela Cruz | jose.dc@xplore.io | Admin | Full system access |
| Maria Santos | maria.santos@xplore.io | Organizer | Event/meeting management + analytics |
| Anna Cruz | anna.cruz@xplore.io | Instructor | Meeting hosting + training |
| Carlos Bautista | carlos.bautista@xplore.io | Participant | Basic user access |

## Navigation Access by Role

### Admin (Jose Dela Cruz)
✅ Dashboard
✅ Events (manage)
✅ Meetings (manage)
✅ Live Streaming (host)
✅ Training (access)
✅ Programs (view)
✅ Analytics (view)
✅ **Users (manage)** - ADMIN ONLY
✅ Notifications
✅ Settings

### Organizer
✅ Dashboard
✅ Events (manage)
✅ Meetings (manage)
✅ Live Streaming (host)
✅ Training (access)
✅ Programs (view)
✅ Analytics (view)
❌ Users - NO ACCESS
✅ Notifications
✅ Settings

### Instructor
✅ Dashboard
❌ Events - NO ACCESS
✅ Meetings (host)
✅ Live Streaming (host)
✅ Training (access)
✅ Programs (view)
❌ Analytics - NO ACCESS
❌ Users - NO ACCESS
✅ Notifications
✅ Settings

### Participant (Carlos Bautista)
✅ Dashboard
❌ Events - NO ACCESS
❌ Meetings - NO ACCESS (can attend, not create)
❌ Live Streaming - NO ACCESS (can watch, not host)
✅ Training (access)
✅ Programs (view)
❌ Analytics - NO ACCESS
❌ Users - NO ACCESS
✅ Notifications
✅ Settings

## Implementation Details

### 1. Sidebar Navigation (`src/components/app/Sidebar.tsx`)
```typescript
const NAV_ITEMS = [
  { 
    href: "/users", 
    label: "Users", 
    icon: Users, 
    allowedRoles: ["Admin"] // Only Admin can see this menu
  },
  { 
    href: "/analytics", 
    label: "Analytics", 
    icon: BarChart3, 
    allowedRoles: ["Admin", "Organizer"] // Admin and Organizer only
  },
  // ... other items
];
```

The sidebar automatically filters navigation items based on the user's role using `visibleItems`:
```typescript
const visibleItems = NAV_ITEMS.filter(
  (item) => !item.allowedRoles || (role && item.allowedRoles.includes(role))
);
```

### 2. RoleGuard Component (`src/components/auth/RoleGuard.tsx`)
A reusable component that protects routes and components:

```typescript
<RoleGuard allowedRoles={["Admin"]}>
  <AdminOnlyContent />
</RoleGuard>
```

Features:
- Redirects to login if user is not authenticated
- Redirects to dashboard if user lacks permission
- Shows "Access Denied" message for unauthorized access
- Automatically checks user role from RoleContext

### 3. Protected Pages

#### Users Page (`src/app/(app)/users/page.tsx`)
```typescript
export default function UsersPage() {
  return (
    <RoleGuard allowedRoles={["Admin"]}>
      {/* User management interface */}
    </RoleGuard>
  );
}
```
**Access:** Admin ONLY (Jose Dela Cruz)

#### Analytics Page (`src/app/(app)/analytics/page.tsx`)
```typescript
export default function AnalyticsPage() {
  return (
    <RoleGuard allowedRoles={["Admin", "Organizer"]}>
      {/* Analytics dashboard */}
    </RoleGuard>
  );
}
```
**Access:** Admin and Organizer (Jose Dela Cruz, Maria Santos)

### 4. Role Context (`src/lib/context/RoleContext.tsx`)
Provides role information throughout the app:

```typescript
const { role, user, isAdmin, isOrganizer, canManage } = useRole();
```

Available flags:
- `isAdmin` - true if role is "Admin"
- `isOrganizer` - true if role is "Organizer"
- `isInstructor` - true if role is "Instructor"
- `isParticipant` - true if role is "Participant"
- `canManage` - true if Admin or Organizer
- `isAdminOnly` - true only if Admin

## Testing Role-Based Access

### As Admin (Jose Dela Cruz)
1. Login with: `jose.dc@xplore.io`
2. Should see ALL navigation items including "Users" and "Analytics"
3. Can access all pages without restrictions

### As Participant (Carlos Bautista)
1. Login with: `carlos.bautista@xplore.io`
2. Should NOT see "Events", "Meetings", "Live", "Analytics", or "Users" in sidebar
3. Only see: Dashboard, Training, Programs, Notifications, Settings
4. Attempting to visit `/users` or `/analytics` directly will show "Access Denied"

## Security Notes

1. **Client-side protection**: Current implementation uses client-side checks
2. **Server-side needed**: For production, add API route protection
3. **Database-driven**: User roles are stored in PostgreSQL database
4. **Session management**: Uses localStorage for demo, should use secure sessions in production

## Future Enhancements

1. Add role protection to Events and Meetings pages
2. Implement API route middleware for server-side protection
3. Add permission-based actions (e.g., Admin can delete users, Organizer cannot)
4. Create audit logs for admin actions
5. Add role management UI for admins to change user roles

## Files Modified

1. `src/components/app/Sidebar.tsx` - Added role-based navigation filtering
2. `src/app/(app)/users/page.tsx` - Protected with RoleGuard for Admin only
3. `src/app/(app)/analytics/page.tsx` - Protected with RoleGuard for Admin/Organizer
4. `src/components/auth/RoleGuard.tsx` - Created new role guard component

## Database Schema
The user roles are defined in the Prisma schema and stored in the PostgreSQL database:
- Table: `User`
- Column: `role` (enum: ADMIN, ORGANIZER, INSTRUCTOR, PARTICIPANT)
- Default: PARTICIPANT

## Summary
✅ Role-based sidebar navigation implemented
✅ Admin-only access to Users page (Jose Dela Cruz)
✅ Admin/Organizer access to Analytics page
✅ Participant view has limited navigation
✅ Automatic redirection for unauthorized access
✅ Database-backed user roles

The system now properly restricts access based on user roles, with Jose Dela Cruz (Admin) having full privileges and other users having restricted access based on their roles.
