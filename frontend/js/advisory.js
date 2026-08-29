function renderHeatActionPlan(loc) {
  const hapPanel = document.getElementById("hap-panel");
  const hapContent = document.getElementById("hap-content");

  if (!loc || !loc.heat_action_plan) {
    hapPanel.style.display = "none";
    return;
  }

  const hap = loc.heat_action_plan;
  hapPanel.style.display = "block";

  let tierColor = "#84B59F";
  if (hap.tier === "YELLOW") tierColor = "#F9E795";
  if (hap.tier === "ORANGE") tierColor = "#F96167";
  if (hap.tier === "RED") tierColor = "#990011";

  const adminActions = hap.admin_actions.map(action => `<li>${action}</li>`).join("");

  hapContent.innerHTML = `
    <div style="background-color: ${tierColor}; color: ${hap.tier === 'YELLOW' || hap.tier === 'GREEN' ? '#000' : '#fff'}; padding: 0.5rem; border-radius: 4px; font-weight: bold; margin-bottom: 0.5rem; text-align: center;">
      TIER: ${hap.tier}
    </div>
    <div style="margin-bottom: 0.8rem;">
      <strong>Public Advisory:</strong>
      <p class="muted" style="margin-top: 0.2rem;">${hap.public_advisory}</p>
    </div>
    <div>
      <strong>Admin Actions:</strong>
      <ul style="margin-top: 0.2rem; padding-left: 1.2rem; font-size: 0.85rem;" class="muted">
        ${adminActions}
      </ul>
    </div>
  `;
}

function renderPredictionTimeline(loc) {
    const timeline = document.getElementById("prediction-timeline");
    if (!loc || !loc.prediction || loc.prediction.length === 0) {
        timeline.innerHTML = `<p class="muted">Select a location to see predictions.</p>`;
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 0.5rem;">';
    loc.prediction.forEach(pred => {
        let bgColor = "#f0f0f0";
        let label = "Baseline";
        if (pred.impact_level === "elevated") {
            bgColor = "#ffe6a3";
            label = "Elevated";
        } else if (pred.impact_level === "spike_likely") {
            bgColor = "#ffb3b3";
            label = "Spike Likely";
        } else if (pred.impact_level === "surge_expected") {
            bgColor = "#ff6666";
            label = "SURGE EXPECTED";
        }

        const dateStr = new Date(pred.date).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
        html += `
            <div style="background-color: ${bgColor}; padding: 0.5rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; font-weight: bold;">${dateStr}</span>
                <div style="text-align: right;">
                    <div style="font-size: 0.75rem; font-weight: bold; text-transform: uppercase;">${label}</div>
                    <div style="font-size: 0.7rem; color: #555;">Max WBGT: ${pred.peak_wbgt}C</div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    timeline.innerHTML = html;
}
