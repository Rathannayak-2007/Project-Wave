const HI_FLOOR = 27.0;
const HI_CEILING = 54.0;
const HEATWAVE_BOOST_C = 15;

let simulationActive = false;

function normalizeHeatIndex(heatIndexC) {
  const clamped = Math.max(HI_FLOOR, Math.min(heatIndexC, HI_CEILING));
  return ((clamped - HI_FLOOR) / (HI_CEILING - HI_FLOOR)) * 100;
}

function vulnerabilityScore(elderlyPct, outdoorWorkerPct) {
  return (elderlyPct * 0.6) + (outdoorWorkerPct * 0.4);
}

function computeRiskScore(heatIndexC, elderlyPct, outdoorWorkerPct) {
  const hiNorm = normalizeHeatIndex(heatIndexC);
  const vuln = vulnerabilityScore(elderlyPct, outdoorWorkerPct);
  return Math.round(((hiNorm * 0.6) + (vuln * 0.4)) * 10) / 10;
}

function riskCategory(score) {
  if (score < 40) return { category: "Low", color: "#84B59F" };
  if (score < 60) return { category: "Moderate", color: "#F9E795" };
  if (score < 80) return { category: "High", color: "#F96167" };
  return { category: "Extreme", color: "#990011" };
}

function applyHeatwaveSimulation(data) {
  const simulated = JSON.parse(JSON.stringify(data));

  simulated.locations.forEach((loc) => {
    loc.current.heat_index_c = Math.round((loc.current.heat_index_c + HEATWAVE_BOOST_C) * 10) / 10;
    loc.current.temp_c = Math.round((loc.current.temp_c + HEATWAVE_BOOST_C) * 10) / 10;

    const score = computeRiskScore(loc.current.heat_index_c, loc.demographics.elderly_pct, loc.demographics.outdoor_worker_pct);
    const cat = riskCategory(score);
    loc.risk = { score: score, category: cat.category, category_color: cat.color };

    loc.forecast = loc.forecast.map((f) => {
      const boostedHi = Math.round((f.heat_index_c + HEATWAVE_BOOST_C) * 10) / 10;
      const fScore = computeRiskScore(boostedHi, loc.demographics.elderly_pct, loc.demographics.outdoor_worker_pct);
      return Object.assign({}, f, { heat_index_c: boostedHi, risk_category: riskCategory(fScore).category });
    });
  });

  simulated.alerts = simulated.locations
    .filter((loc) => loc.risk.score >= 40)
    .map((loc) => ({
      location_id: loc.id,
      message: "SIMULATED: " + loc.risk.category + " heat risk in " + loc.name + " - demo mode active",
      issued_at: new Date().toISOString(),
      severity: loc.risk.category,
    }));

  return simulated;
}

function setupHeatwaveToggle() {
  const btn = document.getElementById("heatwave-toggle");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    simulationActive = !simulationActive;
    btn.classList.toggle("active", simulationActive);
    btn.textContent = simulationActive ? "" : "Simulate Heatwave";

    await loadAndRenderAll();
  });
}

document.addEventListener("DOMContentLoaded", setupHeatwaveToggle);
