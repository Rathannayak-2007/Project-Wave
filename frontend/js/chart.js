let forecastChart = null;

function renderForecastChart(loc) {
  const ctx = document.getElementById("forecast-chart").getContext("2d");

  const labels = loc.forecast.map(f =>
    new Date(f.date).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
  );
  const hiValues = loc.forecast.map(f => f.heat_index_c);
  const wbgtValues = loc.forecast.map(f => f.wbgt_c);
  const utciValues = loc.forecast.map(f => f.utci_c);

  if (forecastChart) {
    forecastChart.data.labels = labels;
    forecastChart.data.datasets[0].data = hiValues;
    forecastChart.data.datasets[1].data = wbgtValues;
    forecastChart.data.datasets[2].data = utciValues;
    forecastChart.update();
  } else {
    forecastChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `Heat Index`,
            data: hiValues,
            borderColor: "#FF9800",
            backgroundColor: "transparent",
            tension: 0.35,
            pointRadius: 4,
          },
          {
            label: `WBGT`,
            data: wbgtValues,
            borderColor: "#F44336",
            backgroundColor: "transparent",
            tension: 0.35,
            pointRadius: 4,
          },
          {
            label: `UTCI`,
            data: utciValues,
            borderColor: "#9C27B0",
            backgroundColor: "transparent",
            tension: 0.35,
            pointRadius: 4,
          }
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true, position: 'bottom' } },
        scales: { y: { title: { display: true, text: "°C" } } },
      },
    });
  }
}
