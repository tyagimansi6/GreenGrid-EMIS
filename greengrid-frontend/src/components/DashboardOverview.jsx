import AlertBadge, { resolveAlertLevel } from "./AlertBadge";

function formatKwh(value) {
  return Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });
}

function bannerMessage(item) {
  const percent = Number(item.threshold_usage_percent || 0).toLocaleString(
    undefined,
    { maximumFractionDigits: 1 },
  );
  const excess = formatKwh(item.excess_kwh);
  const remaining = formatKwh(
    Math.max(0, Number(item.threshold_limit || 0) - Number(item.total_consumption_kwh || 0)),
  );

  if (resolveAlertLevel(item) === "critical") {
    return `${item.facility_name} has exceeded its limit by ${excess} kWh (${percent}% of threshold).`;
  }
  return `${item.facility_name} is near its limit at ${percent}% — ${remaining} kWh remaining.`;
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
  const flagged = stats
    .filter((item) => {
      const level = resolveAlertLevel(item);
      return level === "warning" || level === "critical";
    })
    .sort((a, b) => {
      const rank = { critical: 0, warning: 1 };
      return (
        (rank[resolveAlertLevel(a)] ?? 2) - (rank[resolveAlertLevel(b)] ?? 2)
      );
    });
  const criticalCount = stats.filter(
    (item) => resolveAlertLevel(item) === "critical",
  ).length;
  const warningCount = stats.filter(
    (item) => resolveAlertLevel(item) === "warning",
  ).length;
  const hasCritical = criticalCount > 0;

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
      value: loading ? "—" : criticalCount + warningCount,
      hint:
        criticalCount + warningCount === 0
          ? "All facilities within limits"
          : `${criticalCount} critical · ${warningCount} warning`,
      accent: hasCritical ? "bg-red-600" : warningCount > 0 ? "bg-amber-500" : "bg-leaf",
    },
  ];

  return (
    <section id="overview" className="scroll-mt-24">
      {!loading && flagged.length > 0 ? (
        <div
          role="alert"
          className={`mb-6 rounded-2xl border px-4 py-3 shadow-sm ${
            hasCritical
              ? "border-red-200 bg-red-50 text-red-950"
              : "border-amber-200 bg-amber-50 text-amber-950"
          }`}
        >
          <p className="text-sm font-extrabold tracking-tight">
            {hasCritical
              ? "Threshold alerts require attention"
              : "Facilities approaching threshold"}
          </p>
          <ul className="mt-2 grid gap-3">
            {flagged.map((item) => (
              <li
                key={item.facility_id}
                className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center"
              >
                <AlertBadge stats={item} />
                <span>{bannerMessage(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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
            {card.label === "Alert status" && !loading ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {criticalCount > 0 ? (
                  <AlertBadge compact stats={{ alert_level: "critical" }} />
                ) : null}
                {warningCount > 0 ? (
                  <AlertBadge compact stats={{ alert_level: "warning" }} />
                ) : null}
                {criticalCount === 0 && warningCount === 0 ? (
                  <AlertBadge compact stats={{ alert_level: "normal" }} />
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
