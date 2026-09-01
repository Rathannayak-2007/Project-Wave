import { useState, useEffect } from 'react';
import { SEVERITY } from '../../hooks/useHeatAlerts';

// Thresholds (mirrored from useHeatAlerts)
const TEMP_WARNING = 42;
const TEMP_DANGER  = 45;
const TEMP_EXTREME = 48;

const TIER_CONFIG = {
  safe: {
    label: 'SAFE',
    color: '#22c55e',
    bgGradient: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
    borderColor: 'rgba(34,197,94,0.3)',
    icon: '✅',
    message: 'No heat alerts active',
  },
  warning: {
    label: 'WARNING',
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))',
    borderColor: 'rgba(245,158,11,0.4)',
    icon: '⚠️',
    message: 'Elevated heat — limit outdoor exposure',
  },
  danger: {
    label: 'DANGER',
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))',
    borderColor: 'rgba(239,68,68,0.4)',
    icon: '🔴',
    message: 'Stay indoors! Avoid outdoor activity',
  },
  extreme: {
    label: 'EXTREME',
    color: '#991b1b',
    bgGradient: 'linear-gradient(135deg, rgba(153,27,27,0.25), rgba(153,27,27,0.08))',
    borderColor: 'rgba(153,27,27,0.5)',
    icon: '🚨',
    message: 'EMERGENCY — life-threatening heat',
  },
};

function getTier(temp) {
  if (temp >= TEMP_EXTREME) return 'extreme';
  if (temp >= TEMP_DANGER)  return 'danger';
  if (temp >= TEMP_WARNING) return 'warning';
  return 'safe';
}

export default function HeatAlertCard({ weather }) {
  const [notifPermission, setNotifPermission] = useState('default');
  const [pulseAnim, setPulseAnim] = useState(false);

  const temp = weather?.temp ?? 0;
  const feelsLike = weather?.feelsLike?.value ?? temp;
  const tier = getTier(Math.max(temp, feelsLike));
  const config = TIER_CONFIG[tier];

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // Pulse animation on tier change
  useEffect(() => {
    if (tier !== 'safe') {
      setPulseAnim(true);
      const t = setTimeout(() => setPulseAnim(false), 1500);
      return () => clearTimeout(t);
    }
  }, [tier]);

  const handleEnableNotifications = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
    }
  };

  const progress = Math.min((temp / TEMP_EXTREME) * 100, 100);

  return (
    <div
      className="glass-card col-span-2 p-4 cursor-default"
      style={{
        transition: 'all 0.5s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 className="metric-label flex items-center gap-1.5" style={{ letterSpacing: '1.5px' }}>
          🔔 HEAT ALERT SYSTEM
        </h3>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 10px',
            borderRadius: '999px',
            color: '#fff',
            background: config.color,
            animation: pulseAnim ? 'alertCardPulse 0.6s ease' : 'none',
          }}
        >
          {config.icon} {config.label}
        </span>
      </div>

      {/* Temperature gauge */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
          <span style={{ fontSize: '28px', fontWeight: 300, color: '#fff', letterSpacing: '-1px' }}>
            {temp}°C
          </span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            Feels like {feelsLike}°C
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ position: 'relative', height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${progress}%`,
              borderRadius: '999px',
              background: `linear-gradient(90deg, #22c55e, #f59e0b ${(TEMP_WARNING/TEMP_EXTREME)*100}%, #ef4444 ${(TEMP_DANGER/TEMP_EXTREME)*100}%, #991b1b 100%)`,
              transition: 'width 0.8s ease',
            }}
          />
          {/* Threshold markers */}
          {[TEMP_WARNING, TEMP_DANGER, TEMP_EXTREME].map((t) => (
            <div
              key={t}
              style={{
                position: 'absolute',
                left: `${(t / TEMP_EXTREME) * 100}%`,
                top: '-2px',
                width: '1.5px',
                height: '10px',
                background: 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>0°C</span>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>42°C</span>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>45°C</span>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>48°C</span>
        </div>
      </div>

      {/* Status message */}
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '10px', lineHeight: '1.4' }}>
        {config.message}
      </p>

      {/* Notification permission status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: notifPermission === 'granted' ? '#22c55e' : notifPermission === 'denied' ? '#ef4444' : '#f59e0b',
            boxShadow: notifPermission === 'granted' ? '0 0 6px rgba(34,197,94,0.5)' : 'none',
          }} />
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
            {notifPermission === 'granted' ? 'Notifications enabled' :
             notifPermission === 'denied'  ? 'Notifications blocked' :
             'Notifications not set'}
          </span>
        </div>
        {notifPermission === 'default' && (
          <button
            onClick={handleEnableNotifications}
            style={{
              fontSize: '10px',
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: '999px',
              border: '1px solid rgba(76,201,240,0.4)',
              background: 'rgba(76,201,240,0.15)',
              color: '#4CC9F0',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.target.style.background = 'rgba(76,201,240,0.25)'; }}
            onMouseLeave={(e) => { e.target.style.background = 'rgba(76,201,240,0.15)'; }}
          >
            Enable
          </button>
        )}
      </div>

      {/* Threshold legend */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
        {[
          { label: '< 42°C', color: '#22c55e', text: 'Safe' },
          { label: '42°C+', color: '#f59e0b', text: 'Warning' },
          { label: '45°C+', color: '#ef4444', text: 'Danger' },
          { label: '48°C+', color: '#991b1b', text: 'Extreme' },
        ].map((t) => (
          <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.color }} />
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
