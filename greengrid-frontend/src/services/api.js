import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function fetchFacilities() {
  const { data } = await api.get("facilities/");
  return data;
}

export async function createFacility(payload) {
  const { data } = await api.post("facilities/", payload);
  return data;
}

export async function fetchEnergyLogs() {
  const { data } = await api.get("energy-logs/");
  return data;
}

export async function createEnergyLog(payload) {
  const { data } = await api.post("energy-logs/", payload);
  return data;
}

export async function fetchFacilityStats(facilityId) {
  const { data } = await api.get(`facilities/${facilityId}/stats/`);
  return data;
}

export default api;
