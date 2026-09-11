import { useCallback, useEffect, useState } from "react";
import DashboardOverview from "../components/DashboardOverview";
import EnergyChart from "../components/EnergyChart";
import FacilityList from "../components/FacilityList";
import {
  fetchEnergyLogs,
  fetchFacilities,
  fetchFacilityStats,
} from "../services/api";

export default function Dashboard() {
  const [facilities, setFacilities] = useState([]);
  const [energyLogs, setEnergyLogs] = useState([]);
  const [statsByFacility, setStatsByFacility] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const [facilityRows, logRows] = await Promise.all([
        fetchFacilities(),
        fetchEnergyLogs(),
      ]);
      setFacilities(facilityRows);
      setEnergyLogs(logRows);

      const statsEntries = await Promise.all(
        facilityRows.map(async (facility) => {
          try {
            const stats = await fetchFacilityStats(facility.id);
            return [facility.id, stats];
          } catch {
            return [facility.id, null];
          }
        }),
      );
      setStatsByFacility(
        Object.fromEntries(statsEntries.filter(([, stats]) => stats)),
      );
    } catch {
      setError(
        "Unable to reach the GreenGrid API at http://127.0.0.1:8000/api/. Start Django and refresh.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}
      <DashboardOverview
        facilities={facilities}
        statsByFacility={statsByFacility}
        loading={loading}
      />
      <FacilityList
        facilities={facilities}
        statsByFacility={statsByFacility}
        loading={loading}
        onCreated={loadDashboard}
      />
      <EnergyChart
        facilities={facilities}
        energyLogs={energyLogs}
        onCreated={loadDashboard}
      />
    </main>
  );
}
