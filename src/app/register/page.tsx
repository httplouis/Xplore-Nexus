"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, UserPlus, ArrowLeft } from "lucide-react";
import type { AuthUser } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", department: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);

    try {
      // Call registration API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          department: form.department,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Store session and redirect
      localStorage.setItem("xplore_session", JSON.stringify(result.data.user));
      setLoading(false);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
      setLoading(false);
    }
  }

  const DEPARTMENTS = ["General", "Technology", "Marketing", "Management", "Finance", "HR", "Operations", "Sales"];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <Image
          src="/xplorenexus-logo.png"
          alt="Xplore Nexus"
          width={140}
          height={50}
          priority
          className="object-contain"
        />
        <Link href="/login" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Sign in instead
        </Link>
      </nav>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-px h-4 bg-white/20" />
          <span className="text-xs text-white/40 tracking-widest uppercase font-medium">Create your Nexus account</span>
          <div className="w-px h-4 bg-white/20" />
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 bg-[#7A0010] rounded-2xl rotate-12 opacity-30 blur-sm" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-[#B22234] to-[#7A0010] rounded-2xl flex items-center justify-center shadow-xl shadow-[#7A0010]/40">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight leading-none">Sign Up</h1>
            <p className="text-sm text-white/40 mt-0.5 font-medium tracking-wide">Nexus by Xplore Philippines</p>
          </div>
        </div>

        <p className="text-white/50 text-sm mb-10 text-center max-w-sm leading-relaxed">
          Join the platform to manage events, meetings, and training in one place.
        </p>

        <div className="w-full max-w-sm">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(["firstName", "lastName"] as const).map((k) => (
                  <div key={k}>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">
                      {k === "firstName" ? "First Name" : "Last Name"}
                    </label>
                    <input required type="text" value={form[k]} onChange={set(k)} placeholder={k === "firstName" ? "Juan" : "Dela Cruz"}
                      className="w-full px-4 py-3 text-sm bg-white/[0.06] border border-white/[0.10] rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#7A0010]/60 focus:ring-2 focus:ring-[#7A0010]/20 transition-all" />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">Email</label>
                <input required type="email" value={form.email} onChange={set("email")} placeholder="you@xplore.io"
                  className="w-full px-4 py-3 text-sm bg-white/[0.06] border border-white/[0.10] rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#7A0010]/60 focus:ring-2 focus:ring-[#7A0010]/20 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">Department</label>
                <select value={form.department} onChange={set("department")}
                  className="w-full px-4 py-3 text-sm bg-white/[0.06] border border-white/[0.10] rounded-xl text-white focus:outline-none focus:border-[#7A0010]/60 focus:ring-2 focus:ring-[#7A0010]/20 transition-all appearance-none">
                  <option value="" className="bg-[#1a0505]">Select department…</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d} className="bg-[#1a0505]">{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input required type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Min. 6 characters"
                    className="w-full px-4 py-3 pr-11 text-sm bg-white/[0.06] border border-white/[0.10] rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#7A0010]/60 focus:ring-2 focus:ring-[#7A0010]/20 transition-all" />
                  <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                <input required type="password" value={form.confirm} onChange={set("confirm")} placeholder="Repeat password"
                  className="w-full px-4 py-3 text-sm bg-white/[0.06] border border-white/[0.10] rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#7A0010]/60 focus:ring-2 focus:ring-[#7A0010]/20 transition-all" />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#7A0010] hover:bg-[#9f1239] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-lg shadow-[#7A0010]/40 mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-white/30 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-[#f9a8b0] hover:text-white transition-colors">Sign in</Link>
          </p>
        </div>
      </div>

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
