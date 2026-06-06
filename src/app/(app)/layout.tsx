"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { RoleProvider, useRole } from "@/lib/context/RoleContext";
import { MeetingProvider } from "@/lib/context/MeetingContext";
import Sidebar from "@/components/app/Sidebar";
import AppHeader from "@/components/app/AppHeader";
import MeetingFloatingControls from "@/components/app/MeetingFloatingControls";
import { ToastContainer } from "@/components/ui/Toast";

// ─── Inner shell — rendered only when session exists ─────────────────────────
function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useRole();
  const router = useRouter();

  useEffect(() => {
    // Always redirect to login if no user session
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  // Show nothing while redirecting
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#8B1A1A] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <AppHeader />
      {/* Main content area — offset for sidebar (140px) + header (56px) */}
      <main className="ml-[140px] pt-14 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
      <MeetingFloatingControls />
      <ToastContainer />
    </div>
  );
}

// ─── Layout export — wraps everything in RoleProvider + MeetingProvider ──────
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <MeetingProvider>
        <AppShell>{children}</AppShell>
      </MeetingProvider>
    </RoleProvider>
  );
}
