function formatKwh(value) {
  return Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });
}

export default function DashboardOverview({
  facilities,
  statsByFacility,
  loading,
}) {
  const facilityCount = facilities.length;
  const stats = Object.values(statsByFacility);
  const totalEnergy = stats.reduce(
    (sum, item) => sum + Number(item.total_consumption_kwh || 0),
    0,
  );
  const alertCount = stats.filter((item) => item.over_threshold).length;
  const alertLabel =
    alertCount === 0
      ? "All facilities within limits"
      : `${alertCount} ${alertCount === 1 ? "facility" : "facilities"} over threshold`;

  const cards = [
    {
      label: "Active facilities",
      value: loading ? "—" : facilityCount,
      hint: "Sites currently monitored",
      accent: "bg-forest-700",
    },
    {
      label: "Grid consumption",
      value: loading ? "—" : `${formatKwh(totalEnergy)} kWh`,
      hint: "Total logged energy across sites",
      accent: "bg-forest-500",
    },
    {
      label: "Alert status",
      value: loading ? "—" : alertCount,
      hint: alertLabel,
      accent: alertCount > 0 ? "bg-amber-600" : "bg-leaf",
    },
  ];

  return (
    <section id="overview" className="scroll-mt-24">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest-600">
          Operations snapshot
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-forest-950 sm:text-4xl">
          Facility energy dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-forest-800/70">
          Track site load, thresholds, and consumption trends across the
          GreenGrid network.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-forest-900/8 bg-white p-5 shadow-sm"
          >
            <div className={`mb-4 h-1.5 w-12 rounded-full ${card.accent}`} />
            <p className="text-sm font-medium text-forest-800/60">{card.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-forest-950">
              {card.value}
            </p>
            <p className="mt-2 text-xs text-forest-800/55">{card.hint}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
