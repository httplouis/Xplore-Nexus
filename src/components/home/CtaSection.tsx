import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="section-pad bg-surface-card/20 border-t border-surface-border relative overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-0 bg-hero-glow opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-brand-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="container-xl relative z-10">
        <div className="card-glass max-w-3xl mx-auto text-center p-12 space-y-8 border-brand-500/20 shadow-2xl shadow-brand-500/10">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-brand-500/20 border border-brand-500/20">
              <Zap className="w-8 h-8 text-brand-400" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
              Ready to unify your
              <span className="text-gradient block">operations?</span>
            </h2>
            <p className="text-surface-muted text-lg max-w-xl mx-auto">
              Join thousands of organizations that use Xplore Nexus to manage
              events, meetings, and training — all from one intelligent platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary text-base px-8 py-3.5">
              Start Your Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="btn-ghost text-base px-8 py-3.5">
              Talk to Sales
            </Link>
          </div>

          <p className="text-xs text-surface-muted">
            14-day free trial · No credit card required · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
