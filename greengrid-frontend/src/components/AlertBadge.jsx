function WarningIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 shrink-0"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l6.518 11.59c.75 1.334-.213 2.986-1.742 2.986H3.48c-1.53 0-2.493-1.652-1.743-2.986L8.257 3.1zM11 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-.25-6.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5z" />
    </svg>
  );
}

function CriticalIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 shrink-0"
      aria-hidden="true"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-.75-4.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0zM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 shrink-0"
      aria-hidden="true"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.707a1 1 0 0 0-1.414-1.414L9 10.172 7.707 8.879a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const STYLES = {
  normal: {
    label: "Within Limit",
    compactLabel: "Within Limit",
    className: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
    Icon: CheckIcon,
  },
  warning: {
    label: "Near Threshold (Warning)",
    compactLabel: "Warning",
    className: "bg-amber-100 text-amber-900 ring-1 ring-amber-300",
    Icon: WarningIcon,
  },
  critical: {
    label: "Threshold Breached (Critical)",
    compactLabel: "Critical",
    className:
      "animate-alert-pulse bg-red-600 text-white ring-1 ring-red-400 shadow-red-500/40",
    Icon: CriticalIcon,
  },
};

export function resolveAlertLevel(stats) {
  if (!stats) return "normal";
  if (stats.alert_level) return stats.alert_level;
  const percent = Number(stats.threshold_usage_percent);
  if (Number.isFinite(percent)) {
    if (percent > 100) return "critical";
    if (percent >= 80) return "warning";
    return "normal";
  }
  return stats.over_threshold ? "critical" : "normal";
}

export default function AlertBadge({ stats, compact = false, className = "" }) {
  const level = resolveAlertLevel(stats);
  const style = STYLES[level] || STYLES.normal;
  const Icon = style.Icon;
  const percent = Number(stats?.threshold_usage_percent);
  const showPercent = Number.isFinite(percent);

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold leading-tight ${style.className} ${className}`}
    >
      <Icon />
      <span>{compact ? style.compactLabel : style.label}</span>
      {showPercent ? (
        <span className="font-semibold opacity-80">
          {percent.toLocaleString(undefined, { maximumFractionDigits: 1 })}%
        </span>
      ) : null}
    </span>
  );
}
