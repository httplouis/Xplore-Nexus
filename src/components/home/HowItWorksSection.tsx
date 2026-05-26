const steps = [
  {
    number: "01",
    title: "Connect your team",
    description:
      "Invite colleagues, set department roles, and configure your organization. Xplore Nexus syncs with your existing directory (SSO, Okta, Azure AD).",
  },
  {
    number: "02",
    title: "Choose your modules",
    description:
      "Activate Event Management, Meeting Coordination, or Training Management — individually or together. Pricing scales per module.",
  },
  {
    number: "03",
    title: "Configure & automate",
    description:
      "Use the no-code workflow builder to automate repetitive tasks. Templates for common use-cases get you live in minutes.",
  },
  {
    number: "04",
    title: "Track & improve",
    description:
      "Unified dashboards surface insights across all modules. Continuous feedback loops help your team get better every cycle.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-pad bg-surface relative">
      <div className="container-xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="badge-glow mx-auto">How It Works</div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Up and running{" "}
            <span className="text-gradient">in minutes</span>
          </h2>
          <p className="text-surface-muted text-lg">
            No lengthy implementation projects. Xplore Nexus is designed for
            fast onboarding without sacrificing depth.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-[3.25rem] left-[calc(12.5%+2.5rem)] right-[calc(12.5%+2.5rem)] h-px bg-gradient-to-r from-brand-500/30 via-accent-500/30 to-brand-500/30" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="flex flex-col items-center text-center gap-4">
                {/* Step badge */}
                <div className="relative z-10 w-14 h-14 rounded-2xl card-glass border-brand-500/30 flex items-center justify-center font-display font-bold text-brand-400 text-lg shadow-md shadow-brand-500/10">
                  {step.number}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-100">{step.title}</h3>
                  <p className="text-sm text-surface-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
