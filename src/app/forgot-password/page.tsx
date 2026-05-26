"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) { setError("Please enter a valid email address."); return; }
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to process request");
        setLoading(false);
        return;
      }

      setLoading(false);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link");
      setLoading(false);
    }
  }

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
          <ArrowLeft className="w-3 h-3" /> Back to Sign In
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-px h-4 bg-white/20" />
          <span className="text-xs text-white/40 tracking-widest uppercase font-medium">Password Recovery</span>
          <div className="w-px h-4 bg-white/20" />
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 bg-[#7A0010] rounded-2xl rotate-12 opacity-30 blur-sm" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-[#B22234] to-[#7A0010] rounded-2xl flex items-center justify-center shadow-xl shadow-[#7A0010]/40">
              <Mail className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight leading-none">Reset</h1>
            <p className="text-sm text-white/40 mt-0.5 font-medium tracking-wide">your password</p>
          </div>
        </div>

        <p className="text-white/50 text-sm mb-10 text-center max-w-sm leading-relaxed">
          Enter your account email and we&apos;ll send you a link to reset your password.
        </p>

        <div className="w-full max-w-sm">
          {sent ? (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-400" />
                </div>
              </div>
              <div>
                <p className="text-white font-semibold text-lg">Check your inbox</p>
                <p className="text-white/50 text-sm mt-2 leading-relaxed">
                  We sent a password reset link to <span className="text-white/80 font-medium">{email}</span>.
                  The link expires in 24 hours.
                </p>
              </div>
              <Link href="/login"
                className="block w-full text-center bg-[#7A0010] hover:bg-[#9f1239] text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-lg shadow-[#7A0010]/40">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">Email address</label>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@xplore.io" autoFocus
                    className="w-full px-4 py-3 text-sm bg-white/[0.06] border border-white/[0.10] rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#7A0010]/60 focus:ring-2 focus:ring-[#7A0010]/20 transition-all" />
                </div>
                {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#7A0010] hover:bg-[#9f1239] disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-lg shadow-[#7A0010]/40">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {loading ? "Sending link…" : "Send Reset Link"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/5 py-4 px-8 flex items-center justify-between">
        <p className="text-xs text-white/20">© 2026 Xplore Philippines Inc. All rights reserved.</p>
      </div>
    </div>
  );
}
