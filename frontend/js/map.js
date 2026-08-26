let map;
let markersLayer;
let currentRiskData = null;

function initMap() {
  map = L.map("map").setView([17.4, 78.45], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 18,
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
}

function renderMarkers(locations) {
  markersLayer.clearLayers();

  locations.forEach((loc) => {
    const marker = L.circleMarker([loc.lat, loc.lon], {
      radius: 12,
      fillColor: loc.risk.category_color,
      color: "#ffffff",
      weight: 2,
      fillOpacity: 0.9,
    }).addTo(markersLayer);

    marker.bindTooltip(loc.name + ": " + loc.risk.category, { direction: "top" });
    marker.on("click", () => selectLocation(loc));
  });
}

function selectLocation(loc) {
  renderLocationDetails(loc);
  renderForecastChart(loc);
}

function renderLocationDetails(loc) {
  const el = document.getElementById("location-details");
  el.innerHTML = `
    <h3 style="margin:0 0 0.5rem;">${loc.name}</h3>
    <span class="risk-badge" style="background:${loc.risk.category_color}">
      ${loc.risk.category} - ${loc.risk.score}
    </span>
    <div style="margin-top:0.75rem;">
      <div class="detail-row"><span>Temperature</span><span>${loc.current.temp_c}C</span></div>
      <div class="detail-row"><span>Heat Index</span><span>${loc.current.heat_index_c}C</span></div>
      <div class="detail-row"><span>Humidity</span><span>${loc.current.humidity_pct}%</span></div>
      <div class="detail-row"><span>Wind</span><span>${loc.current.wind_kmh} km/h</span></div>
      <div class="detail-row"><span>Elderly population</span><span>${loc.demographics.elderly_pct}%</span></div>
      <div class="detail-row"><span>Outdoor workers</span><span>${loc.demographics.outdoor_worker_pct}%</span></div>
    </div>
  `;
}

function renderTopRiskList(locations) {
  const list = document.getElementById("top-risk-list");
  const sorted = [...locations].sort((a, b) => b.risk.score - a.risk.score).slice(0, 5);

  list.innerHTML = sorted.map(loc => `
    <li>
      <span>${loc.name}</span>
      <span class="risk-badge" style="background:${loc.risk.category_color}">${loc.risk.category}</span>
    </li>
  `).join("");

  list.querySelectorAll("li").forEach((li, i) => {
    li.addEventListener("click", () => selectLocation(sorted[i]));
  });
}

async function loadAndRenderAll() {
  let data = await fetchRiskData();

  if (typeof simulationActive !== "undefined" && simulationActive) {
    data = applyHeatwaveSimulation(data);
    setDataSourceLabel("SIMULATED heatwave data (demo mode)");
  }

  currentRiskData = data;

  renderMarkers(data.locations);
  renderTopRiskList(data.locations);
  renderAlerts(data.alerts);

  if (data.locations.length > 0) {
    selectLocation(data.locations[0]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  loadAndRenderAll();
  setInterval(loadAndRenderAll, 10 * 60 * 1000);
});
