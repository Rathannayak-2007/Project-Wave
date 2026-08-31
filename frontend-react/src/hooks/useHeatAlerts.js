import { useState, useEffect, useRef, useCallback } from 'react';

// ── Alert thresholds ──
const TEMP_WARNING = 42;      // °C — elevated warning
const TEMP_DANGER  = 45;      // °C — danger alert
const TEMP_EXTREME = 48;      // °C — extreme / deadly
const FEELS_LIKE_DANGER = 48; // °C — feels-like danger
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes between notifications

// ── Severity levels ──
const SEVERITY = {
  NONE:    'none',
  WARNING: 'warning',  // 42–44°C
  DANGER:  'danger',   // 45–47°C or feels-like ≥ 48
  EXTREME: 'extreme',  // 48°C+
};

// ── Alert messages per severity ──
const ALERT_MESSAGES = {
  [SEVERITY.WARNING]: {
    title: '⚠️ Heat Warning',
    body: (temp, loc) =>
      `Temperature in ${loc} is ${temp}°C. Limit outdoor exposure, drink water every 30 min, and check on elderly neighbours.`,
    banner: 'High temperature detected. Limit outdoor exposure and stay hydrated.',
  },
  [SEVERITY.DANGER]: {
    title: '🔴 EXTREME HEAT ALERT',
    body: (temp, loc) =>
      `Temperature in ${loc} is ${temp}°C! Do NOT go outside. Stay indoors, drink water every 15–20 min. Avoid all non-essential outdoor activity.`,
    banner: 'Dangerous heat! Stay indoors. Avoid outdoor activity between 11 AM – 4 PM.',
  },
  [SEVERITY.EXTREME]: {
    title: '🚨 DEADLY HEAT EMERGENCY',
    body: (temp, loc) =>
      `EMERGENCY: ${loc} is at ${temp}°C! This is life-threatening. Stay indoors immediately. Do not gather outside. Drink water continuously. Check on vulnerable neighbours.`,
    banner: 'EMERGENCY: Life-threatening heat. Stay indoors immediately. Do NOT go outside.',
  },
};

/**
 * Determines the alert severity based on current weather data.
 */
function computeSeverity(weather) {
  if (!weather) return SEVERITY.NONE;

  const temp      = weather.temp ?? 0;
  const feelsLike = weather.feelsLike?.value ?? temp;

  if (temp >= TEMP_EXTREME)                       return SEVERITY.EXTREME;
  if (temp >= TEMP_DANGER || feelsLike >= FEELS_LIKE_DANGER) return SEVERITY.DANGER;
  if (temp >= TEMP_WARNING)                       return SEVERITY.WARNING;

  return SEVERITY.NONE;
}

/**
 * useHeatAlerts — monitors weather data and triggers browser + in-app alerts.
 *
 * @param {object} weather        - Combined weather object from useWeatherData
 * @param {string} locationName   - Human-readable location name for the alert text
 * @returns {{ alertActive, severity, message, dismiss }}
 */
export function useHeatAlerts(weather, locationName = 'your area') {
  const [alertActive, setAlertActive]   = useState(false);
  const [severity, setSeverity]         = useState(SEVERITY.NONE);
  const [message, setMessage]           = useState('');
  const [dismissed, setDismissed]       = useState(false);

  const lastNotifiedRef  = useRef(0);        // timestamp of last browser notification
  const lastSeverityRef  = useRef(SEVERITY.NONE);
  const permissionRef    = useRef('default');

  // ── Request notification permission on mount ──
  useEffect(() => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        permissionRef.current = perm;
      });
    } else {
      permissionRef.current = Notification.permission;
    }
  }, []);

  // ── Fire a browser notification ──
  const fireNotification = useCallback((sev, temp) => {
    const now = Date.now();
    // Don't fire again if we sent one recently (unless severity escalated)
    const escalated = severityRank(sev) > severityRank(lastSeverityRef.current);
    if (!escalated && now - lastNotifiedRef.current < COOLDOWN_MS) return;

    const alertInfo = ALERT_MESSAGES[sev];
    if (!alertInfo) return;

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const n = new Notification(alertInfo.title, {
          body: alertInfo.body(temp, locationName),
          icon: '🌡️',
          tag: 'csah-heat-alert',      // replaces previous notification
          requireInteraction: true,     // stays until dismissed
          silent: false,
        });
        // Auto-close after 15 seconds
        setTimeout(() => n.close(), 15000);
      } catch {
        // Notification API can fail silently in some environments
      }
    }

    lastNotifiedRef.current = now;
    lastSeverityRef.current = sev;
  }, [locationName]);

  // ── Watch weather changes ──
  useEffect(() => {
    if (!weather) return;

    const sev = computeSeverity(weather);
    setSeverity(sev);

    if (sev !== SEVERITY.NONE) {
      const alertInfo = ALERT_MESSAGES[sev];
      setMessage(alertInfo.banner);
      setAlertActive(true);
      setDismissed(false);
      fireNotification(sev, weather.temp);
    } else {
      setAlertActive(false);
      setMessage('');
    }
  }, [weather, fireNotification]);

  // ── Dismiss handler (only hides the in-app banner, not the notification) ──
  const dismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  return {
    alertActive: alertActive && !dismissed,
    severity,
    message,
    dismiss,
    temp: weather?.temp ?? 0,
  };
}

function severityRank(sev) {
  switch (sev) {
    case SEVERITY.EXTREME: return 3;
    case SEVERITY.DANGER:  return 2;
    case SEVERITY.WARNING: return 1;
    default:               return 0;
  }
}

export { SEVERITY };
