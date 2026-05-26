import Link from "next/link";
import {
  Calendar,
  Users,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const modules = [
  {
    icon: Calendar,
    name: "Event Management",
    href: "/events",
    color: "text-brand-400",
    borderColor: "border-brand-500/30",
    glowColor: "shadow-brand-500/10",
    bg: "bg-brand-500/10",
    activeBg: "group-hover:bg-brand-500/20",
    features: [
      "Multi-venue scheduling & logistics",
      "Attendee registration & ticketing",
      "Real-time capacity & seating",
      "Post-event analytics & reports",
    ],
    description:
      "Plan, promote, and execute events of any size with intelligent scheduling and seamless attendee experiences.",
  },
  {
    icon: Users,
    name: "Meeting Coordination",
    href: "/meetings",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    glowColor: "shadow-emerald-500/10",
    bg: "bg-emerald-500/10",
    activeBg: "group-hover:bg-emerald-500/20",
    features: [
      "AI-powered scheduling assistant",
      "Agenda builder & action items",
      "Recording & transcript sync",
      "Calendar & video app integrations",
    ],
    description:
      "Turn every meeting into a productive outcome with smart scheduling, live agendas, and automated follow-ups.",
  },
  {
    icon: GraduationCap,
    name: "Training Management",
    href: "/training",
    color: "text-violet-400",
    borderColor: "border-violet-500/30",
    glowColor: "shadow-violet-500/10",
    bg: "bg-violet-500/10",
    activeBg: "group-hover:bg-violet-500/20",
    features: [
      "Course builder & SCORM support",
      "Learner tracking & progress",
      "Certification & compliance paths",
      "Assessments & skill gap analysis",
    ],
    description:
      "Design, deliver, and measure training programs that upskill teams and ensure compliance at scale.",
  },
];

export default function ModulesSection() {
  return (
    <section id="modules" className="section-pad bg-surface relative overflow-hidden">
      <div className="absolute inset-0 bg-card-glow pointer-events-none" />
      <div className="container-xl relative z-10">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="badge-glow mx-auto">Three Core Modules</div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Everything your organization
            <span className="text-gradient block">needs, unified</span>
          </h2>
          <p className="text-surface-muted text-lg">
            Three purpose-built modules that work independently or as an
            integrated suite — your choice.
          </p>
        </div>

        {/* Module cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <div
              key={mod.name}
              className={`group card-glass border ${mod.borderColor} p-7 space-y-6 hover:shadow-xl ${mod.glowColor} transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Icon */}
              <div className={`p-3 rounded-xl w-fit ${mod.bg} ${mod.activeBg} transition-colors`}>
                <mod.icon className={`w-6 h-6 ${mod.color}`} />
              </div>

              {/* Name & description */}
              <div className="space-y-2">
                <h3 className="font-display text-xl font-bold text-slate-100">
                  {mod.name}
                </h3>
                <p className="text-sm text-surface-muted leading-relaxed">
                  {mod.description}
                </p>
              </div>

              {/* Feature list */}
              <ul className="space-y-2.5">
                {mod.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${mod.color}`} />
                    <span className="text-sm text-slate-400">{feat}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={mod.href}
                className={`flex items-center gap-1 text-sm font-semibold ${mod.color} group-hover:gap-2 transition-all duration-200`}
              >
                Explore module
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
