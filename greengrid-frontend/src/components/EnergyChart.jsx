import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createEnergyLog } from "../services/api";

const palette = ["#1a5c46", "#2a9d6f", "#c2410c", "#0369a1", "#7c3aed"];

function formatTick(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EnergyChart({ facilities, energyLogs, onCreated }) {
  const [selectedId, setSelectedId] = useState("all");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    facility: "",
    timestamp: "",
    consumption_kwh: "",
    cost_estimated: "",
  });

  const visibleLogs = useMemo(() => {
    const sorted = [...energyLogs].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    );
    if (selectedId === "all") return sorted;
    return sorted.filter((log) => String(log.facility) === String(selectedId));
  }, [energyLogs, selectedId]);

  const seriesNames = useMemo(() => {
    if (selectedId === "all") return facilities.map((facility) => facility.name);
    const match = facilities.find((facility) => String(facility.id) === selectedId);
    return match ? [match.name] : [];
  }, [facilities, selectedId]);

  const chartData = useMemo(() => {
    const byTime = new Map();
    visibleLogs.forEach((log) => {
      const key = log.timestamp;
      const name = log.facility_detail?.name || `Facility ${log.facility}`;
      const point = byTime.get(key) || { timestamp: key };
      point[name] = Number(log.consumption_kwh);
      byTime.set(key, point);
    });
    return Array.from(byTime.values());
  }, [visibleLogs]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await createEnergyLog({
        facility: Number(form.facility),
        timestamp: new Date(form.timestamp).toISOString(),
        consumption_kwh: Number(form.consumption_kwh),
        cost_estimated: form.cost_estimated ? Number(form.cost_estimated) : null,
      });
      setForm({
        facility: "",
        timestamp: "",
        consumption_kwh: "",
        cost_estimated: "",
      });
      setOpen(false);
      await onCreated();
    } catch {
      setFormError("Could not save the energy log.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="trends" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest-600">
            Consumption
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-forest-950">
            Energy trends
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-forest-800">
            Facility
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="ml-2 rounded-lg border border-forest-900/15 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All facilities</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={facilities.length === 0}
            className="rounded-xl bg-forest-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-700 disabled:opacity-50"
          >
            Add reading
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-forest-900/8 bg-white p-4 shadow-sm sm:p-6">
        {chartData.length === 0 ? (
          <p className="py-16 text-center text-sm text-forest-800/60">
            No energy logs yet. Add a reading to plot consumption over time.
          </p>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d5e3db" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTick}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "kWh",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip labelFormatter={formatTick} />
                <Legend />
                {seriesNames.map((name, index) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={palette[index % palette.length]}
                    strokeWidth={2.4}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/50 p-4">
          <div
            role="dialog"
            aria-labelledby="add-reading-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3
              id="add-reading-title"
              className="text-xl font-extrabold text-forest-950"
            >
              Add energy reading
            </h3>
            <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
              <label className="grid gap-1 text-sm font-medium">
                Facility
                <select
                  required
                  name="facility"
                  value={form.facility}
                  onChange={updateField}
                  className="rounded-lg border border-forest-900/15 px-3 py-2 font-normal"
                >
                  <option value="">Select a facility</option>
                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Timestamp
                <input
                  required
                  type="datetime-local"
                  name="timestamp"
                  value={form.timestamp}
                  onChange={updateField}
                  className="rounded-lg border border-forest-900/15 px-3 py-2 font-normal"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Consumption (kWh)
                <input
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  name="consumption_kwh"
                  value={form.consumption_kwh}
                  onChange={updateField}
                  className="rounded-lg border border-forest-900/15 px-3 py-2 font-normal"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Estimated cost (optional)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="cost_estimated"
                  value={form.cost_estimated}
                  onChange={updateField}
                  className="rounded-lg border border-forest-900/15 px-3 py-2 font-normal"
                />
              </label>
              {formError ? (
                <p className="text-sm text-red-700">{formError}</p>
              ) : null}
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setFormError("");
                  }}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-forest-800 hover:bg-sand"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-forest-800 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-700 disabled:opacity-60"
                >
                  {submitting ? "Saving…" : "Save reading"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
