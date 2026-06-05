"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Video,
  GraduationCap,
  BarChart3,
  Users,
  Settings,
  Bell,
  Radio,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/context/RoleContext";
import type { UserRole } from "@/types";

// ─── Nav items with role gating ───────────────────────────────────────────────
// allowedRoles: undefined = all authenticated roles can see this
const NAV_ITEMS: {
  href: string;
  label: string;
  icon: React.ElementType;
  allowedRoles?: UserRole[];
}[] = [
  { href: "/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/events",        label: "Events",         icon: Calendar },
  { href: "/meetings",      label: "Meetings",       icon: Video },
  { href: "/stream",        label: "Live",           icon: Radio },
  { href: "/training",      label: "Training",       icon: GraduationCap },
  { href: "/programs",      label: "Programs",       icon: BookOpen },
  { href: "/analytics",     label: "Analytics",      icon: BarChart3,    allowedRoles: ["Admin", "Organizer"] },
  { href: "/users",         label: "Users",          icon: Users,         allowedRoles: ["Admin"] },
  { href: "/notifications", label: "Notifs",         icon: Bell },
  { href: "/settings",      label: "Settings",       icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useRole();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.allowedRoles || (role && item.allowedRoles.includes(role))
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-[140px] bg-[#1a0505] border-r border-[#3d1515] flex flex-col z-40">
      {/* Logo */}
      <div className="px-3 py-4 border-b border-[#3d1515] flex items-center justify-center">
        <Image
          src="/xplorenexus-logo.png"
          alt="Xplore Nexus"
          width={108}
          height={39}
          priority
          className="object-contain"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg text-xs font-medium transition-all duration-150 w-full text-center",
                isActive
                  ? "bg-[#7B1414] text-white"
                  : "text-slate-400 hover:bg-[#2d0a0a] hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Role indicator at bottom */}
      {role && (
        <div className="px-3 pb-4">
          <div className="w-full text-center py-1.5 rounded-lg bg-[#2d0a0a] border border-[#3d1515]">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider block">Logged in as</span>
            <span className="text-[10px] font-bold text-white/60">{role}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
