import {
  BrainCircuit,
  BarChart3,
  Bell,
  Globe,
  Lock,
  Workflow,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Insights",
    description:
      "Intelligent recommendations across events, meetings, and training — surfaced in context when you need them most.",
    color: "text-brand-400",
    bg: "bg-brand-500/10",
  },
  {
    icon: BarChart3,
    title: "Unified Analytics",
    description:
      "A single analytics layer spanning all three modules. Track performance, engagement, and ROI in real time.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Workflow,
    title: "Automated Workflows",
    description:
      "No-code automation builder to connect tasks, triggers, and approvals across modules without engineering help.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Context-aware alerts and reminders delivered by email, Slack, or Teams — never miss a deadline again.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Globe,
    title: "Multi-Tenant & Multi-Region",
    description:
      "Enterprise-ready architecture supporting multiple business units, geographies, and data residency requirements.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description:
      "SOC 2 Type II certified. SSO, role-based access, audit logs, and end-to-end encryption included on every plan.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="section-pad bg-surface-card/20 border-y border-surface-border relative"
    >
      <div className="container-xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="badge-glow mx-auto">Platform Capabilities</div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Built for enterprise.
            <span className="text-gradient block">Designed for speed.</span>
          </h2>
          <p className="text-surface-muted text-lg">
            Beyond the three modules, Xplore Nexus ships with a powerful
            platform layer that makes every team more effective.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="card-glass p-6 space-y-4 hover:border-surface-muted/30 transition-colors group"
            >
              <div className={`p-2.5 rounded-lg w-fit ${feat.bg}`}>
                <feat.icon className={`w-5 h-5 ${feat.color}`} />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-100 group-hover:text-white transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-surface-muted leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
