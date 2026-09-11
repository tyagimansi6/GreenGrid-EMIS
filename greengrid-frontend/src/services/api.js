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

export async function exportFacilityCsv(facilityId, facilityName = "facility") {
  const response = await api.get(`facilities/${facilityId}/export_csv/`, {
    responseType: "blob",
  });

  const disposition = response.headers["content-disposition"] || "";
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const slug = String(facilityName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const filename = match?.[1] || `${slug || "facility"}-energy-report.csv`;

  const blobUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);

  return filename;
}

export default api;
