"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { DEMO_ACCOUNTS } from "@/lib/data/demo-accounts";

import type { UserRole } from "@/types";

const ROLE_COLORS: Record<UserRole, string> = {
  Admin:       "bg-[#8B1A1A]/20 border-[#8B1A1A]/30 text-[#f9a8b0]",
  Organizer:   "bg-blue-500/20 border-blue-500/30 text-blue-300",
  Instructor:  "bg-amber-500/20 border-amber-500/30 text-amber-300",
  Participant: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
};
const ROLE_BADGE: Record<UserRole, string> = {
  Admin:       "bg-[#8B1A1A] text-white",
  Organizer:   "bg-blue-600 text-white",
  Instructor:  "bg-amber-600 text-white",
  Participant: "bg-emerald-600 text-white",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    const session = localStorage.getItem("xplore_session");
    if (session) {
      router.replace("/dashboard");
    }
  }, [router]);

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("demo1234");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Invalid credentials. Please try again.");
        return;
      }
      // Persist session to localStorage (not sessionStorage)
      localStorage.setItem("xplore_session", JSON.stringify(json.data.user));
      router.push("/dashboard");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* ── Top nav ── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <Image
          src="/xplorenexus-logo.png"
          alt="Xplore Nexus"
          width={140}
          height={50}
          priority
          className="object-contain"
        />
        <a
          href="https://xploreph.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          xploreph.com ↗
        </a>
      </nav>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Product badge */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-px h-4 bg-white/20" />
          <span className="text-xs text-white/40 tracking-widest uppercase font-medium">A product by Xplore Philippines</span>
          <div className="w-px h-4 bg-white/20" />
        </div>

        {/* Nexus logo */}
        <div className="mb-3">
          <Image
            src="/xplorenexus-logo.png"
            alt="Xplore Nexus"
            width={220}
            height={80}
            priority
            className="object-contain mx-auto"
          />
        </div>

        <p className="text-white/50 text-sm mb-10 text-center max-w-sm leading-relaxed">
          Your unified platform for events, meetings, and training management.
        </p>

        <div className="w-full max-w-sm space-y-4">
          {/* ── Login card ── */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-1">Sign in to Nexus</h2>
            <p className="text-sm text-white/40 mb-6">Use your Xplore account credentials</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@xplore.io"
                  className="w-full px-4 py-3 text-sm bg-white/[0.06] border border-white/[0.10] rounded-xl
                             text-white placeholder-white/20 focus:outline-none focus:border-[#7A0010]/60
                             focus:ring-2 focus:ring-[#7A0010]/20 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Password</label>
                  <button type="button" className="text-xs text-[#f9a8b0] hover:text-white transition-colors">Forgot?</button>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 text-sm bg-white/[0.06] border border-white/[0.10] rounded-xl
                               text-white placeholder-white/20 focus:outline-none focus:border-[#7A0010]/60
                               focus:ring-2 focus:ring-[#7A0010]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#7A0010] hover:bg-[#9f1239]
                           disabled:opacity-50 disabled:cursor-not-allowed
                           text-white font-semibold text-sm py-3 rounded-xl transition-all
                           shadow-lg shadow-[#7A0010]/40 mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </div>

          {/* ── Demo accounts ── */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3 text-center">
              Demo Accounts — Click to Auto-fill
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account.email)}
                  className={`flex flex-col items-start gap-1 p-3 rounded-xl border transition-all hover:scale-[1.02] text-left ${ROLE_COLORS[account.role]}`}
                >
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${ROLE_BADGE[account.role]}`}>
                    {account.role}
                  </span>
                  <span className="text-[11px] font-semibold leading-tight">
                    {account.firstName} {account.lastName}
                  </span>
                  <span className="text-[9px] opacity-70 font-mono leading-tight truncate w-full">
                    {account.email}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[9px] text-white/20 text-center mt-3">Any password works for demo accounts</p>
          </div>
        </div>
      </div>

      {/* ── Bottom strip ── */}
      <div className="border-t border-white/5 py-4 px-8 flex items-center justify-between">
        <p className="text-xs text-white/20">© 2026 Xplore Philippines Inc. All rights reserved.</p>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
          <span className="text-xs text-white/25">All systems operational</span>
        </div>
      </div>
    </div>
  );
}
