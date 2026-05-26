import Link from "next/link";
import { Zap, Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Event Management", href: "/events" },
    { label: "Meeting Coordination", href: "/meetings" },
    { label: "Training Management", href: "/training" },
    { label: "Integrations", href: "/integrations" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socials = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "mailto:hello@xplorenexus.io", label: "Email" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-surface-border bg-surface/80 backdrop-blur-sm">
      <div className="container-xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Top grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Brand & tagline */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="p-1.5 rounded-lg bg-brand-500/20 group-hover:bg-brand-500/30 transition-colors">
                <Zap className="w-5 h-5 text-brand-400" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">
                Xplore <span className="text-gradient">Nexus</span>
              </span>
            </Link>
            <p className="text-sm text-surface-muted leading-relaxed max-w-xs">
              The unified operations platform powering enterprise events,
              meetings, and training at scale.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="p-2 rounded-lg text-surface-muted hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-muted mb-4">
                {section}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-brand-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 h-px divider-glow" />

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-surface-muted">
          <p>© {year} Xplore Nexus. All rights reserved.</p>
          <p>Built for enterprise. Designed for humans.</p>
        </div>
      </div>
    </footer>
  );
}
