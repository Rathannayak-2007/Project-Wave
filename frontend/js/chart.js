let forecastChart = null;

function renderForecastChart(loc) {
  const ctx = document.getElementById("forecast-chart").getContext("2d");

  const labels = loc.forecast.map(f =>
    new Date(f.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const values = loc.forecast.map(f => f.heat_index_c);

  if (forecastChart) {
    forecastChart.data.labels = labels;
    forecastChart.data.datasets[0].data = values;
    forecastChart.data.datasets[0].label = `${loc.name} - Heat Index (C)`;
    forecastChart.update();
    return;
  }

  forecastChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `${loc.name} - Heat Index (C)`,
        data: values,
        borderColor: "#F96167",
        backgroundColor: "rgba(249, 97, 103, 0.15)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { title: { display: true, text: "C" } } },
    },
  });
}
