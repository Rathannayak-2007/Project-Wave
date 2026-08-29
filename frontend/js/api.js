const API_BASE_URL = "";
const USE_MOCK = false; // set true to force mock data while backend is not ready

async function fetchRiskData() {
  if (USE_MOCK) return fetchMockData();

  try {
    const res = await fetch(`${API_BASE_URL}/api/risk`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    setDataSourceLabel("Live data - updated " + new Date(data.generated_at).toLocaleTimeString());
    return data;
  } catch (err) {
    console.warn("Live API failed, falling back to mock data:", err);
    setDataSourceLabel("Offline - showing cached demo data");
    return fetchMockData();
  }
}

async function fetchMockData() {
  const res = await fetch("mock/mock-risk-data.json");
  return res.json();
}

function setDataSourceLabel(text) {
  const el = document.getElementById("data-source-label");
  if (el) el.textContent = text;
}
