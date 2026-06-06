"use client";

import { useRole } from "@/lib/context/RoleContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { UserRole } from "@/types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  /** Redirect path if user doesn't have access (default: /dashboard) */
  fallbackPath?: string;
}

/**
 * RoleGuard - Protects routes/components based on user role
 * 
 * Usage:
 * <RoleGuard allowedRoles={["Admin"]}>
 *   <AdminOnlyContent />
 * </RoleGuard>
 */
export default function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = "/dashboard" 
}: RoleGuardProps) {
  const { role, user } = useRole();
  const router = useRouter();

  useEffect(() => {
    // If no user or role, redirect to login
    if (!user || !role) {
      router.push("/login");
      return;
    }

    // If user doesn't have required role, redirect to fallback
    if (!allowedRoles.includes(role)) {
      router.push(fallbackPath);
    }
  }, [role, user, allowedRoles, fallbackPath, router]);

  // Don't render if no access
  if (!user || !role || !allowedRoles.includes(role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
