let map;
let voronoiLayer;
let currentRiskData = null;
let activeMetric = 'composite_score'; // default

function getRiskColor(metric, value) {
  if (metric === 'composite_score') {
    if (value >= 80) return '#990011';
    if (value >= 60) return '#F96167';
    if (value >= 40) return '#F9E795';
    return '#84B59F';
  } else if (metric === 'heat_index_c') {
    if (value >= 54) return '#990011';
    if (value >= 41) return '#F96167';
    if (value >= 32) return '#F9E795';
    return '#84B59F';
  } else if (metric === 'wbgt_c') {
    if (value >= 32) return '#990011';
    if (value >= 30) return '#F96167';
    if (value >= 28) return '#F9E795';
    return '#84B59F';
  } else if (metric === 'utci_c') {
    if (value >= 46) return '#990011';
    if (value >= 38) return '#F96167';
    if (value >= 32) return '#F9E795';
    return '#84B59F';
  }
  return '#84B59F';
}

function getRiskCategoryByMetric(metric, value) {
  if (metric === 'composite_score') {
    if (value >= 80) return 'Extreme';
    if (value >= 60) return 'High';
    if (value >= 40) return 'Moderate';
    return 'Low';
  } else if (metric === 'heat_index_c') {
    if (value >= 54) return 'Extreme';
    if (value >= 41) return 'High';
    if (value >= 32) return 'Moderate';
    return 'Low';
  } else if (metric === 'wbgt_c') {
    if (value >= 32) return 'Extreme';
    if (value >= 30) return 'High';
    if (value >= 28) return 'Moderate';
    return 'Low';
  } else if (metric === 'utci_c') {
    if (value >= 46) return 'Extreme';
    if (value >= 38) return 'High';
    if (value >= 32) return 'Moderate';
    return 'Low';
  }
  return 'Low';
}

function initMap() {
  map = L.map("map").setView([17.4, 78.48], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 18,
  }).addTo(map);

  voronoiLayer = L.geoJSON(null, {
    style: function(feature) {
      const isExtreme = feature.properties.category === 'Extreme';
      return {
        fillColor: feature.properties.color,
        fillOpacity: 0.5,
        color: feature.properties.color,
        weight: 1,
        className: isExtreme ? 'pulse-polygon' : ''
      };
    },
    onEachFeature: function(feature, layer) {
      layer.bindTooltip(feature.properties.name + ": " + feature.properties.category + " (" + feature.properties.value.toFixed(1) + ")", { direction: "top" });
      layer.on("click", () => selectLocation(feature.properties.rawLoc));
    }
  }).addTo(map);

  // Setup metric tabs
  document.querySelectorAll('.metric-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.metric-tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      activeMetric = e.target.getAttribute('data-metric');
      if (currentRiskData) {
        renderMap(currentRiskData.locations);
      }
    });
  });
}

function renderMap(locations) {
  // Use turf.js to create Voronoi polygons based on points
  // Hyderabad bounding box
  const bbox = [78.2, 17.2, 78.7, 17.6];
  
  const points = turf.featureCollection(
    locations.map(loc => turf.point([loc.lon, loc.lat], { rawLoc: loc }))
  );
  
  const voronoiPolygons = turf.voronoi(points, { bbox: bbox });
  
  const features = [];
  voronoiPolygons.features.forEach((poly, i) => {
    if (poly) {
      const loc = points.features[i].properties.rawLoc;
      
      let val = 0;
      if (activeMetric === 'composite_score') {
        val = loc.risk.score;
      } else {
        val = loc.current[activeMetric];
      }
      
      const color = getRiskColor(activeMetric, val);
      const category = getRiskCategoryByMetric(activeMetric, val);
      
      poly.properties = {
        name: loc.name,
        value: val,
        color: color,
        category: category,
        rawLoc: loc
      };
      features.push(poly);
    }
  });

  voronoiLayer.clearLayers();
  voronoiLayer.addData(turf.featureCollection(features));
}

function selectLocation(loc) {
  renderLocationDetails(loc);
  renderForecastChart(loc);
  if (window.renderHeatActionPlan) {
    window.renderHeatActionPlan(loc);
  }
  if (window.renderPredictionTimeline) {
    window.renderPredictionTimeline(loc);
  }
}

function renderLocationDetails(loc) {
  const el = document.getElementById("location-details");
  el.innerHTML = `
    <h3 style="margin:0 0 0.5rem;">${loc.name}</h3>
    <span class="risk-badge" style="background:${loc.risk.category_color}">
      ${loc.risk.category} - ${loc.risk.score}
    </span>
    <p class="muted" style="margin-top:0.6rem; font-size:0.8rem; line-height:1.4;">${loc.risk.mortality_risk}</p>
    <div style="margin-top:0.75rem;">
      <div class="detail-row"><span>Temperature</span><span>${loc.current.temp_c}C</span></div>
      <div class="detail-row"><span>WBGT</span><span style="font-weight:bold;">${loc.current.wbgt_c}C</span></div>
      <div class="detail-row"><span>UTCI</span><span style="font-weight:bold;">${loc.current.utci_c}C</span></div>
      <div class="detail-row"><span>Heat Index</span><span>${loc.current.heat_index_c}C</span></div>
      <div class="detail-row"><span>Humidity</span><span>${loc.current.humidity_pct}%</span></div>
      <div class="detail-row"><span>Wind</span><span>${loc.current.wind_kmh} km/h</span></div>
    </div>
  `;
}

async function loadAndRenderAll() {
  let data = await fetchRiskData();

  if (typeof simulationActive !== "undefined" && simulationActive) {
    data = applyHeatwaveSimulation(data);
    setDataSourceLabel("SIMULATED heatwave data (demo mode)");
  }

  currentRiskData = data;

  renderMap(data.locations);
  renderAlerts(data.alerts);

  if (typeof populateLocationDropdown === "function") {
    populateLocationDropdown(data.locations);
  }

  if (data.locations.length > 0) {
    selectLocation(data.locations[0]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  loadAndRenderAll();
  setInterval(loadAndRenderAll, 10 * 60 * 1000);
});
