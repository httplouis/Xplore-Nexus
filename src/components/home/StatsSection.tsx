const stats = [
  { value: "10K+", label: "Organizations", sub: "across industries" },
  { value: "2.5M+", label: "Events Managed", sub: "end-to-end" },
  { value: "98.9%", label: "Uptime SLA", sub: "enterprise grade" },
  { value: "4.8★", label: "User Rating", sub: "on G2 & Capterra" },
];

export default function StatsSection() {
  return (
    <section className="relative border-y border-surface-border bg-surface-card/30">
      <div className="container-xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center space-y-1">
              <p className="font-display text-3xl sm:text-4xl font-bold text-gradient">
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-slate-300">{stat.label}</p>
              <p className="text-xs text-surface-muted">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
