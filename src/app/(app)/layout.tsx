"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { RoleProvider, useRole } from "@/lib/context/RoleContext";
import Sidebar from "@/components/app/Sidebar";
import AppHeader from "@/components/app/AppHeader";
import { ToastContainer } from "@/components/ui/Toast";

// ─── Inner shell — rendered only when session exists ─────────────────────────
function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useRole();
  const router = useRouter();
  const pathname = usePathname();

  const isJoinBypass = pathname.startsWith("/join/");
  const isMeetingRoomBypass = /^\/meetings\/[^\/]+\/room$/.test(pathname);
  const bypassAuth = isJoinBypass || isMeetingRoomBypass;

  useEffect(() => {
    if (!user && !bypassAuth) {
      router.replace("/login");
    }
  }, [user, router, bypassAuth]);

  if (!user && !bypassAuth) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <AppHeader />
      {/* Main content area — offset for sidebar (140px) + header (56px) */}
      <main className="ml-[140px] pt-14 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
      <ToastContainer />
    </div>
  );
}

// ─── Layout export — wraps everything in RoleProvider ─────────────────────────
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <AppShell>{children}</AppShell>
    </RoleProvider>
  );
}
