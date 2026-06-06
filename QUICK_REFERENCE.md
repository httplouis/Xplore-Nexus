# Quick Reference: Role-Based Access & Data Privacy

## 🚀 Quick Start

### Check Current User
```typescript
import { useRole } from "@/lib/context/RoleContext";

const { user, role, isAdmin, canManage } = useRole();

console.log(user.id);        // "u-001"
console.log(user.firstName); // "Jose"
console.log(role);           // "Admin"
console.log(isAdmin);        // true
```

### Protect a Page
```typescript
import RoleGuard from "@/components/auth/RoleGuard";

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <div>Admin-only content</div>
    </RoleGuard>
  );
}
```

### Conditionally Show UI Elements
```typescript
const { isAdmin, canManage } = useRole();

return (
  <div>
    {isAdmin && <AdminButton />}
    {canManage && <CreateEventButton />}
  </div>
);
```

### Fetch User-Specific Data
```typescript
const { user, role } = useRole();

// Meetings
const res = await fetch(`/api/meetings?userId=${user.id}&userRole=${role}`);

// Events
const res = await fetch(`/api/events?userId=${user.id}&userRole=${role}`);

// Dashboard
const res = await fetch(`/api/dashboard?userId=${user.id}&userRole=${role}`);
```

## 📋 User Roles & Permissions

| Feature | Admin | Organizer | Instructor | Participant |
|---------|-------|-----------|------------|-------------|
| Dashboard | ✅ All data | ✅ All events | ✅ Own meetings | ✅ Personal |
| Events | ✅ View/Manage All | ✅ View/Manage All | ❌ No access | ❌ No access |
| Meetings | ✅ View All | ✅ View All | ✅ Host only | ❌ No access |
| Live Stream | ✅ Host | ✅ Host | ✅ Host | ❌ No access |
| Training | ✅ Personal | ✅ Personal | ✅ Personal | ✅ Personal |
| Programs | ✅ View | ✅ View | ✅ View | ✅ View |
| Analytics | ✅ View | ✅ View | ❌ No access | ❌ No access |
| Users | ✅ Manage | ❌ No access | ❌ No access | ❌ No access |
| Notifications | ✅ Own only | ✅ Own only | ✅ Own only | ✅ Own only |
| Settings | ✅ View | ✅ View | ✅ View | ✅ View |

## 🎯 Role Flags

```typescript
const {
  role,           // "Admin" | "Organizer" | "Instructor" | "Participant"
  isAdmin,        // true if Admin
  isOrganizer,    // true if Organizer
  isInstructor,   // true if Instructor
  isParticipant,  // true if Participant
  canManage,      // true if Admin or Organizer
  isAdminOnly,    // true only if Admin
} = useRole();
```

## 🔒 Data Privacy Rules

### Meetings
- **Admin:** Sees all meetings
- **Others:** See only meetings they host

### Events
- **Admin & Organizer:** See all events
- **Others:** See only events they organize

### Notifications
- **All Roles:** See ONLY their own notifications

### Training
- **All Roles:** See ONLY their own enrollments

### Certificates
- **All Roles:** See ONLY their own certificates

## 📝 Common Code Patterns

### Pattern 1: Protected Route
```typescript
// src/app/(app)/admin-only/page.tsx
import RoleGuard from "@/components/auth/RoleGuard";

export default function AdminOnlyPage() {
  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <div>Content here</div>
    </RoleGuard>
  );
}
```

### Pattern 2: Role-Based Rendering
```typescript
// Show different content based on role
const { role } = useRole();

return (
  <div>
    {role === "Admin" && <AdminDashboard />}
    {role === "Organizer" && <OrganizerDashboard />}
    {role === "Participant" && <ParticipantDashboard />}
  </div>
);
```

### Pattern 3: Conditional Actions
```typescript
// Enable/disable actions based on role
const { canManage, isAdmin } = useRole();

return (
  <div>
    <button disabled={!canManage}>Create Event</button>
    <button disabled={!isAdmin}>Delete User</button>
  </div>
);
```

### Pattern 4: API Call with User Context
```typescript
// Always pass userId and userRole to API
const { user, role } = useRole();

async function fetchData() {
  if (!user || !role) return;
  
  const res = await fetch(
    `/api/resource?userId=${user.id}&userRole=${role}`
  );
  const data = await res.json();
  return data;
}
```

### Pattern 5: User-Specific Data Hook
```typescript
// Create custom hook with user filtering
import { useRole } from "@/lib/context/RoleContext";

export function useMyData() {
  const { user, role } = useRole();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!user || !role) return;
    
    fetch(`/api/data?userId=${user.id}&userRole=${role}`)
      .then(res => res.json())
      .then(json => setData(json.data));
  }, [user, role]);

  return data;
}
```

## 🛠️ API Route Pattern

### Standard API Route with Role Filtering
```typescript
// src/app/api/resource/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "u-001";
    const userRole = searchParams.get("userRole") || "Participant";

    // Build where clause based on role
    const whereClause: any = {
      // Common filters
    };

    // Role-specific filtering
    if (userRole !== "Admin") {
      whereClause.ownerId = userId; // Filter by ownership
    }

    const data = await prisma.resource.findMany({
      where: whereClause,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

## 🎨 Sidebar Menu Configuration

```typescript
// src/components/app/Sidebar.tsx
const NAV_ITEMS = [
  { 
    href: "/dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard 
    // No allowedRoles = available to all
  },
  { 
    href: "/analytics", 
    label: "Analytics", 
    icon: BarChart3, 
    allowedRoles: ["Admin", "Organizer"] 
    // Only Admin and Organizer can see
  },
  { 
    href: "/users", 
    label: "Users", 
    icon: Users, 
    allowedRoles: ["Admin"] 
    // Only Admin can see
  },
];
```

## 📊 Test Accounts

| Name | Email | Role | Password |
|------|-------|------|----------|
| Jose Dela Cruz | jose.dc@xplore.io | Admin | (demo) |
| Maria Santos | maria.santos@xplore.io | Organizer | (demo) |
| Anna Cruz | anna.cruz@xplore.io | Instructor | (demo) |
| Carlos Bautista | carlos.bautista@xplore.io | Participant | (demo) |

## ⚡ Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check

# Run linting
npm run lint

# Check diagnostics
# Use your IDE's diagnostic tools
```

## 🐛 Troubleshooting

### User sees wrong data
```typescript
// ✅ DO: Pass user context to API
const { user, role } = useRole();
fetch(`/api/data?userId=${user.id}&userRole=${role}`)

// ❌ DON'T: Fetch without user context
fetch(`/api/data`)
```

### Page not protected
```typescript
// ✅ DO: Wrap with RoleGuard
export default function Page() {
  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <Content />
    </RoleGuard>
  );
}

// ❌ DON'T: Leave unprotected
export default function Page() {
  return <Content />;
}
```

### Menu item not hiding
```typescript
// ✅ DO: Add allowedRoles
{ 
  href: "/admin", 
  label: "Admin", 
  icon: Shield,
  allowedRoles: ["Admin"] 
}

// ❌ DON'T: Forget allowedRoles
{ 
  href: "/admin", 
  label: "Admin", 
  icon: Shield 
}
```

## 📚 Documentation Files

- `ROLE_BASED_ACCESS_CONTROL.md` - Complete RBAC documentation
- `USER_DATA_PRIVACY.md` - Data privacy implementation details
- `TESTING_USER_PRIVACY.md` - Testing procedures and scenarios
- `IMPLEMENTATION_SUMMARY.md` - Complete implementation overview
- `QUICK_REFERENCE.md` - This file (quick reference)

## 🎯 Key Takeaways

1. **Always use `useRole()` hook** to get current user context
2. **Pass `userId` and `userRole`** to all API calls that need filtering
3. **Use `RoleGuard`** to protect pages requiring specific roles
4. **Filter data on both client and server** for security
5. **Test with different user accounts** to verify isolation
6. **Notifications are always personal** - no role exceptions
7. **Admin can see all data** except notifications
8. **Organizer can manage events** and see analytics

## 💡 Pro Tips

- Use `canManage` flag for create/edit/delete actions
- Use `isAdminOnly` for admin-specific features
- Always check if `user` exists before accessing properties
- Use `role` string for exact role matching
- Use role flags (`isAdmin`, etc.) for cleaner code
- Reload user context when switching accounts
- Clear session completely on logout

## ✅ Checklist for New Features

When adding new features:

- [ ] Check if feature needs role restrictions
- [ ] Add to sidebar with appropriate `allowedRoles`
- [ ] Wrap page with `RoleGuard` if restricted
- [ ] Update API to accept `userId` and `userRole`
- [ ] Filter database queries by user ownership
- [ ] Test with all 4 user roles
- [ ] Update documentation
- [ ] Verify data isolation

---

**Need more details?** Check the complete documentation files listed above.

**Found a bug?** Refer to `TESTING_USER_PRIVACY.md` for debugging steps.

**Adding new role?** Update enum in `prisma/schema.prisma` and `src/types/index.ts`.
