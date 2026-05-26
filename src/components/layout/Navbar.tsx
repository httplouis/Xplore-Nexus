"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Users,
  GraduationCap,
  ChevronDown,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const modules = [
  {
    href: "/events",
    label: "Event Management",
    icon: Calendar,
    description: "Plan and execute events end-to-end",
    color: "text-brand-400",
    bg: "bg-brand-500/10",
  },
  {
    href: "/meetings",
    label: "Meeting Coordination",
    icon: Users,
    description: "Schedule, record, and action meetings",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    href: "/training",
    label: "Training Management",
    icon: GraduationCap,
    description: "Deliver and track learning programs",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
];

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#pricing", label: "Pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-surface/90 backdrop-blur-md border-b border-surface-border shadow-xl shadow-black/20"
          : "bg-transparent"
      )}
    >
      <div className="container-xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-brand-500/20 group-hover:bg-brand-500/30 transition-colors">
              <Zap className="w-5 h-5 text-brand-400" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Xplore{" "}
              <span className="text-gradient">Nexus</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* Modules dropdown */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen((p) => !p)}
                className={cn(
                  "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  dropOpen
                    ? "text-white bg-surface-card"
                    : "text-slate-400 hover:text-white hover:bg-surface-card"
                )}
              >
                Modules
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    dropOpen && "rotate-180"
                  )}
                />
              </button>

              {/* Dropdown panel */}
              {dropOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 card-glass shadow-2xl shadow-black/40 p-2 space-y-0.5">
                  {modules.map((mod) => (
                    <Link
                      key={mod.href}
                      href={mod.href}
                      onClick={() => setDropOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-border/40 transition-colors group"
                    >
                      <div className={cn("p-2 rounded-lg", mod.bg)}>
                        <mod.icon className={cn("w-4 h-4", mod.color)} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-100 group-hover:text-white">
                          {mod.label}
                        </p>
                        <p className="text-xs text-surface-muted mt-0.5">
                          {mod.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-white bg-surface-card"
                    : "text-slate-400 hover:text-white hover:bg-surface-card"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="btn-ghost py-2 px-4 text-sm">
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary py-2 px-4 text-sm">
              Get Started
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-card transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-surface/95 backdrop-blur-md border-t border-surface-border">
          <div className="container-xl px-4 py-4 space-y-1">
            {modules.map((mod) => (
              <Link
                key={mod.href}
                href={mod.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-card transition-colors"
              >
                <mod.icon className={cn("w-4 h-4", mod.color)} />
                <span className="text-sm font-medium text-slate-300">
                  {mod.label}
                </span>
              </Link>
            ))}
            <div className="h-px my-2 divider-glow" />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-surface-card transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px my-2 divider-glow" />
            <div className="flex flex-col gap-2 pt-2 pb-2">
              <Link href="/login" className="btn-ghost justify-center">
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary justify-center">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
