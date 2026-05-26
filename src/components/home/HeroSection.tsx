import Link from "next/link";
import { ArrowRight, Play, Shield, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04] pointer-events-none" />

      {/* Ambient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl animate-pulse-slow animate-delay-500 pointer-events-none" />

      <div className="container-xl px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Eyebrow badge */}
          <div className="flex justify-center animate-fade-in">
            <div className="badge-glow">
              <Sparkles className="w-3 h-3" />
              Enterprise Operations Platform
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight animate-slide-up animate-delay-100">
            One platform.
            <br />
            <span className="text-gradient">Three superpowers.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-surface-muted max-w-2xl mx-auto leading-relaxed animate-slide-up animate-delay-200">
            Xplore Nexus unifies{" "}
            <span className="text-slate-300 font-medium">Event Management</span>,{" "}
            <span className="text-slate-300 font-medium">Meeting Coordination</span>, and{" "}
            <span className="text-slate-300 font-medium">Training Management</span>{" "}
            into a single intelligent workspace — so your team moves faster and
            works smarter.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animate-delay-300">
            <Link href="/signup" className="btn-primary text-base px-8 py-3.5">
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="btn-ghost text-base px-8 py-3.5 group">
              <span className="flex items-center gap-2 p-1.5 rounded-full bg-brand-500/20 group-hover:bg-brand-500/30 transition-colors">
                <Play className="w-3 h-3 text-brand-400 fill-brand-400" />
              </span>
              Watch Demo
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 animate-fade-in animate-delay-500">
            {[
              { icon: Shield, text: "SOC 2 Type II" },
              { text: "No credit card required" },
              { text: "14-day free trial" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-1.5 text-sm text-surface-muted"
              >
                {Icon && <Icon className="w-3.5 h-3.5 text-brand-400" />}
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview card */}
        <div className="mt-16 max-w-5xl mx-auto animate-slide-up animate-delay-300">
          <div className="card-glass p-1 shadow-2xl shadow-black/50">
            {/* Fake browser bar */}
            <div className="px-4 py-3 border-b border-surface-border flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 mx-4 h-5 rounded-md bg-surface-border/60 flex items-center px-3">
                <span className="text-xs text-surface-muted">
                  app.xplorenexus.io/dashboard
                </span>
              </div>
            </div>

            {/* Simulated dashboard */}
            <div className="p-6 bg-surface/60 rounded-b-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Upcoming Events",
                  value: "12",
                  sub: "+3 this week",
                  color: "text-brand-400",
                  bg: "bg-brand-500/10",
                },
                {
                  label: "Meetings Today",
                  value: "8",
                  sub: "2 pending agenda",
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                },
                {
                  label: "Active Training",
                  value: "47",
                  sub: "completions this month",
                  color: "text-violet-400",
                  bg: "bg-violet-500/10",
                },
              ].map((card) => (
                <div key={card.label} className={`${card.bg} rounded-xl p-5 border border-surface-border`}>
                  <p className="text-xs text-surface-muted uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className={`text-4xl font-display font-bold mt-2 ${card.color}`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-surface-muted mt-1">{card.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
