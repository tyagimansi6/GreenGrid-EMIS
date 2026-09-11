import { useState } from "react";
import { createFacility, exportFacilityCsv } from "../services/api";
import AlertBadge from "./AlertBadge";

const emptyForm = {
  name: "",
  location: "",
  total_area: "",
  threshold_limit: "",
};

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

export default function FacilityList({
  facilities,
  statsByFacility,
  loading,
  onCreated,
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [exportingId, setExportingId] = useState(null);
  const [exportNotice, setExportNotice] = useState(null);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await createFacility({
        name: form.name.trim(),
        location: form.location.trim(),
        total_area: Number(form.total_area),
        threshold_limit: Number(form.threshold_limit),
      });
      setForm(emptyForm);
      setOpen(false);
      await onCreated();
    } catch {
      setFormError("Could not create the facility. Check the API and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExport(facility) {
    setExportingId(facility.id);
    setExportNotice(null);
    try {
      const filename = await exportFacilityCsv(facility.id, facility.name);
      setExportNotice({
        facilityId: facility.id,
        type: "success",
        message: `Downloaded ${filename}`,
      });
    } catch {
      setExportNotice({
        facilityId: facility.id,
        type: "error",
        message: `Could not export CSV for ${facility.name}.`,
      });
    } finally {
      setExportingId(null);
    }
  }

  return (
    <section id="facilities" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest-600">
            Sites
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-forest-950">
            Facilities
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl bg-forest-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-700"
        >
          Add facility
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-forest-900/8 bg-white shadow-sm">
        {loading ? (
          <p className="px-5 py-8 text-sm text-forest-800/60">Loading facilities…</p>
        ) : facilities.length === 0 ? (
          <p className="px-5 py-8 text-sm text-forest-800/60">
            No facilities yet. Add a site to start logging energy use.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-forest-900 text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Facility</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Area (sq ft)</th>
                  <th className="px-4 py-3 font-semibold">Threshold (kWh)</th>
                  <th className="px-4 py-3 font-semibold">Logged (kWh)</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Report</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((facility) => {
                  const stats = statsByFacility[facility.id];
                  return (
                    <tr
                      key={facility.id}
                      className="border-t border-forest-900/8 text-forest-900"
                    >
                      <td className="px-4 py-3 font-semibold">{facility.name}</td>
                      <td className="px-4 py-3">{facility.location}</td>
                      <td className="px-4 py-3">
                        {formatNumber(facility.total_area)}
                      </td>
                      <td className="px-4 py-3">
                        {formatNumber(facility.threshold_limit)}
                      </td>
                      <td className="px-4 py-3">
                        {formatNumber(stats?.total_consumption_kwh || 0)}
                      </td>
                      <td className="min-w-[15rem] px-4 py-3">
                        <AlertBadge stats={stats} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleExport(facility)}
                          disabled={exportingId === facility.id}
                          className="rounded-lg border border-forest-800/20 bg-white px-3 py-1.5 text-xs font-semibold text-forest-800 transition hover:bg-sand disabled:opacity-60"
                        >
                          {exportingId === facility.id
                            ? "Exporting…"
                            : exportNotice?.facilityId === facility.id &&
                                exportNotice.type === "success"
                              ? "Downloaded"
                              : "Export CSV"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {exportNotice ? (
        <p
          className={`mt-3 text-sm ${
            exportNotice.type === "success" ? "text-forest-700" : "text-red-700"
          }`}
        >
          {exportNotice.message}
        </p>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/50 p-4">
          <div
            role="dialog"
            aria-labelledby="add-facility-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3
              id="add-facility-title"
              className="text-xl font-extrabold text-forest-950"
            >
              Add facility
            </h3>
            <p className="mt-1 text-sm text-forest-800/65">
              Register a site and its maximum allowed kWh.
            </p>
            <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
              <label className="grid gap-1 text-sm font-medium">
                Name
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  className="rounded-lg border border-forest-900/15 px-3 py-2 font-normal outline-none ring-leaf/40 focus:ring-2"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Location
                <input
                  required
                  name="location"
                  value={form.location}
                  onChange={updateField}
                  className="rounded-lg border border-forest-900/15 px-3 py-2 font-normal outline-none ring-leaf/40 focus:ring-2"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Total area (sq ft)
                <input
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  name="total_area"
                  value={form.total_area}
                  onChange={updateField}
                  className="rounded-lg border border-forest-900/15 px-3 py-2 font-normal outline-none ring-leaf/40 focus:ring-2"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Threshold limit (kWh)
                <input
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  name="threshold_limit"
                  value={form.threshold_limit}
                  onChange={updateField}
                  className="rounded-lg border border-forest-900/15 px-3 py-2 font-normal outline-none ring-leaf/40 focus:ring-2"
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
                  {submitting ? "Saving…" : "Save facility"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
