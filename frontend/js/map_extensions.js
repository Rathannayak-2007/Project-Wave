document.addEventListener('DOMContentLoaded', () => {
  const reportFab = document.getElementById('report-fab');
  const reportModal = document.getElementById('report-modal');
  const closeReport = document.getElementById('close-report');
  const submitReportBtn = document.getElementById('submit-report');
  const reportLatLon = document.getElementById('report-latlon');
  const reportType = document.getElementById('report-type');
  const reportMessage = document.getElementById('report-message');

  let reportLocation = null;
  let reportLayerGroup = L.layerGroup(); 
  let isMapReady = false;
  let isPickingLocation = false;
  const alertBanner = document.getElementById('alert-banner');

  // Poll for map to be ready
  const checkMap = setInterval(() => {
    if (typeof map !== 'undefined' && map !== null) {
      clearInterval(checkMap);
      isMapReady = true;
      reportLayerGroup.addTo(map);
      fetchReports();
      
      // Click on map to set report location
      map.on('click', (e) => {
        if (isPickingLocation) {
          reportLocation = e.latlng;
          reportLatLon.value = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
          reportModal.classList.remove('hidden');
          isPickingLocation = false;
          document.getElementById('map').style.cursor = '';
          if (alertBanner) alertBanner.classList.add('hidden');
        }
      });
    }
  }, 500);

  reportFab.addEventListener('click', () => {
    isPickingLocation = true;
    reportLocation = null;
    reportMessage.value = '';
    
    // Show instruction banner
    if (alertBanner) {
      alertBanner.textContent = "📍 Click anywhere on the map to set the report location.";
      alertBanner.style.backgroundColor = "#2F3C7E"; // Navy color
      alertBanner.classList.remove('hidden');
    }
    document.getElementById('map').style.cursor = 'crosshair';
  });

  closeReport.addEventListener('click', () => {
    reportModal.classList.add('hidden');
    isPickingLocation = false;
    document.getElementById('map').style.cursor = '';
    if (alertBanner) alertBanner.classList.add('hidden');
  });

  submitReportBtn.addEventListener('click', async () => {
    if (!reportLocation) {
      alert("Please click on the map to set a location first.");
      return;
    }

    // Update UI state to loading
    const originalText = submitReportBtn.textContent;
    submitReportBtn.textContent = 'Submitting...';
    submitReportBtn.disabled = true;

    try {
      const response = await fetch('/api/community/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: reportLocation.lat,
          lon: reportLocation.lng,
          type: reportType.value,
          message: reportMessage.value
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        reportModal.classList.add('hidden');
        fetchReports(); // Refresh markers
      } else {
        alert("Error submitting report.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to connect to server.");
    } finally {
      submitReportBtn.textContent = originalText;
      submitReportBtn.disabled = false;
    }
  });

  async function fetchReports() {
    if (!isMapReady) return;
    try {
      const response = await fetch('/api/community/reports');
      const data = await response.json();
      if (data.status === 'success') {
        renderReports(data.reports);
      }
    } catch (e) {
      console.error("Failed to fetch reports:", e);
    }
  }

  function renderReports(reports) {
    reportLayerGroup.clearLayers();
    
    reports.forEach(report => {
      let iconColor = 'blue';
      let emoji = '📍';
      if (report.type === 'water') { iconColor = '#3b82f6'; emoji = '💧'; }
      if (report.type === 'cooling') { iconColor = '#84B59F'; emoji = '❄️'; }
      if (report.type === 'danger') { iconColor = '#F96167'; emoji = '⚠️'; }

      const markerHtml = `
        <div style="
          background-color: ${iconColor};
          color: white;
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          box-shadow: 0 0 10px ${iconColor};
          border: 2px solid white;
          animation: pulseRed 2s infinite alternate;
        ">${emoji}</div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: 'custom-report-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([report.lat, report.lon], { icon: icon });
      marker.bindTooltip(`<b>${report.type.toUpperCase()}</b><br>${report.message}`);
      reportLayerGroup.addLayer(marker);
    });
  }
  
  // Refresh reports every minute
  setInterval(fetchReports, 60000);
});
