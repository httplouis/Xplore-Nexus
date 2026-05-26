"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, KeyRound, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get("token") || "demo-token";

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          confirmPassword: confirm,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to reset password");
        setLoading(false);
        return;
      }

      setLoading(false);
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <Image
          src="/xplorenexus-logo.png"
          alt="Xplore Nexus"
          width={140}
          height={50}
          priority
          className="object-contain"
        />
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 bg-[#7A0010] rounded-2xl rotate-12 opacity-30 blur-sm" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-[#B22234] to-[#7A0010] rounded-2xl flex items-center justify-center shadow-xl shadow-[#7A0010]/40">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight leading-none">New Password</h1>
            <p className="text-sm text-white/40 mt-0.5 font-medium tracking-wide">Set a secure password below</p>
          </div>
        </div>

        <div className="w-full max-w-sm">
          {done ? (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-400" />
                </div>
              </div>
              <p className="text-white font-semibold">Password updated!</p>
              <p className="text-white/50 text-sm">Redirecting you to sign in…</p>
            </div>
          ) : (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">New Password</label>
                  <div className="relative">
                    <input required type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters"
                      className="w-full px-4 py-3 pr-11 text-sm bg-white/[0.06] border border-white/[0.10] rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#7A0010]/60 focus:ring-2 focus:ring-[#7A0010]/20 transition-all" />
                    <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                  <input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password"
                    className="w-full px-4 py-3 text-sm bg-white/[0.06] border border-white/[0.10] rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#7A0010]/60 focus:ring-2 focus:ring-[#7A0010]/20 transition-all" />
                </div>
                {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#7A0010] hover:bg-[#9f1239] disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-lg shadow-[#7A0010]/40">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  {loading ? "Updating…" : "Set New Password"}
                </button>
              </form>
              <p className="text-center text-xs text-white/30 mt-4">
                <Link href="/login" className="text-[#f9a8b0] hover:text-white transition-colors">Back to Sign In</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
