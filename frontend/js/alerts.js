function renderAlerts(alerts) {
  const banner = document.getElementById("alert-banner");

  if (!alerts || alerts.length === 0) {
    banner.classList.add("hidden");
    banner.textContent = "";
    return;
  }

  const top = alerts[0];
  const extra = alerts.length > 1 ? ` (+${alerts.length - 1} more alert${alerts.length > 2 ? "s" : ""})` : "";

  banner.textContent = `WARNING: ${top.message}${extra}`;
  banner.classList.remove("hidden");
}
