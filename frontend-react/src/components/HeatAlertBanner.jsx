import { SEVERITY } from '../hooks/useHeatAlerts';

const SEVERITY_CONFIG = {
  [SEVERITY.WARNING]: {
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    icon: '⚠️',
    label: 'HEAT WARNING',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  [SEVERITY.DANGER]: {
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    icon: '🔴',
    label: 'EXTREME HEAT ALERT',
    glowColor: 'rgba(239, 68, 68, 0.4)',
  },
  [SEVERITY.EXTREME]: {
    gradient: 'linear-gradient(135deg, #991b1b, #7f1d1d)',
    icon: '🚨',
    label: 'DEADLY HEAT EMERGENCY',
    glowColor: 'rgba(153, 27, 27, 0.6)',
  },
};

export default function HeatAlertBanner({ alertActive, severity, message, temp, onDismiss }) {
  if (!alertActive || severity === SEVERITY.NONE) return null;

  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG[SEVERITY.WARNING];

  return (
    <div
      className="heat-alert-banner"
      style={{
        background: config.gradient,
        boxShadow: `0 4px 24px ${config.glowColor}, 0 0 60px ${config.glowColor}`,
      }}
    >
      {/* Animated pulse overlay */}
      <div className="heat-alert-pulse" />

      <div className="heat-alert-content">
        {/* Left: icon + label */}
        <div className="heat-alert-left">
          <span className="heat-alert-icon">{config.icon}</span>
          <div className="heat-alert-text">
            <span className="heat-alert-label">{config.label}</span>
            <span className="heat-alert-temp">{temp}°C</span>
          </div>
        </div>

        {/* Center: message */}
        <p className="heat-alert-message">{message}</p>

        {/* Right: dismiss */}
        <button
          className="heat-alert-dismiss"
          onClick={onDismiss}
          title="Dismiss alert"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
