import { useState, useEffect } from 'react';

// Backend API base — adjust if your backend runs elsewhere
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const TIER_STYLES = {
  GREEN:  { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: '🟢' },
  YELLOW: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '🟡' },
  ORANGE: { color: '#f97316', bg: 'rgba(249,115,22,0.15)', icon: '🟠' },
  RED:    { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   icon: '🔴' },
};

export default function AdminReportCard() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [error, setError] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/notifications/status`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      // Backend might not be running — show offline state
      setError(true);
    } finally {
      setLoading(false);
      setLastChecked(new Date());
    }
  };

  // Fetch on mount and every 5 minutes
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Offline / loading state
  if (loading && !reportData) {
    return (
      <div className="glass-card col-span-2 p-4">
        <span className="metric-label" style={{ color: 'rgba(255,255,255,0.5)' }}>
          📊 ADMIN WEATHER REPORTS
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0', gap: '8px' }}>
          <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.6)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Connecting to backend...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card col-span-2 p-4">
        <span className="metric-label" style={{ color: 'rgba(255,255,255,0.5)' }}>
          📊 ADMIN WEATHER REPORTS
        </span>
        <div style={{ padding: '16px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '6px' }}>📡</div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
            Backend offline — Admin reports require the Flask server
          </p>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
            Run: <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px' }}>cd backend && python app.py</code>
          </p>
          <button
            onClick={fetchStatus}
            style={{
              marginTop: '10px',
              fontSize: '10px',
              fontWeight: 600,
              padding: '4px 14px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.08)'; }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const locations = reportData?.locations || [];
  const activeAlerts = reportData?.active_alerts || [];
  const totalAlerts = reportData?.total_alerts || 0;

  return (
    <div className="glass-card col-span-2 p-4">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span className="metric-label" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '1.5px' }}>
          📊 ADMIN WEATHER REPORTS
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {totalAlerts > 0 && (
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              background: '#ef4444',
              color: '#fff',
              animation: 'alertCardPulse 2s ease infinite',
            }}>
              {totalAlerts} ACTIVE
            </span>
          )}
          <button
            onClick={fetchStatus}
            style={{
              fontSize: '12px',
              padding: '2px 6px',
              borderRadius: '6px',
              border: 'none',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title="Refresh"
            onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.08)'; }}
          >
            ↻
          </button>
        </div>
      </div>

      {/* Ward status list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
        {locations.map((loc) => {
          const tierStyle = TIER_STYLES[loc.hap_tier] || TIER_STYLES.GREEN;
          return (
            <div
              key={loc.location_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '10px',
                background: loc.alert_active ? tierStyle.bg : 'rgba(255,255,255,0.04)',
                border: `1px solid ${loc.alert_active ? tierStyle.color + '33' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.3s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '12px' }}>{tierStyle.icon}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.8)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {loc.location_name.replace(/^Ward \d+ - /, '')}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span style={{ fontSize: '12px', fontWeight: 300, color: 'rgba(255,255,255,0.6)' }}>
                  {loc.temp_c != null ? `${Math.round(loc.temp_c)}°` : '--'}
                </span>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '999px',
                  background: tierStyle.color + '22',
                  color: tierStyle.color,
                  letterSpacing: '0.5px',
                }}>
                  {loc.hap_tier}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer: active alerts summary */}
      {activeAlerts.length > 0 ? (
        <div style={{
          marginTop: '10px',
          padding: '8px 10px',
          borderRadius: '10px',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
        }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#ef4444', marginBottom: '4px' }}>
            ⚠ Admin reports will be sent for:
          </p>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            {activeAlerts.map(a => a.location_name.replace(/^Ward \d+ - /, '')).join(', ')}
          </p>
        </div>
      ) : (
        <div style={{
          marginTop: '10px',
          padding: '8px 10px',
          borderRadius: '10px',
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.15)',
        }}>
          <p style={{ fontSize: '11px', color: 'rgba(34,197,94,0.7)', margin: 0 }}>
            ✅ All wards within safe limits — no admin reports pending
          </p>
        </div>
      )}

      {/* Last checked */}
      {lastChecked && (
        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '8px', textAlign: 'right' }}>
          Last checked: {lastChecked.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
