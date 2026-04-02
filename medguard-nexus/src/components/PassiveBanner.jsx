import React from 'react'

const PHASES = {
  passive_detect: {
    color: '#ffcc00', shadow: '#ffcc0044',
    icon: '🔍', title: 'SENSITIVE OPERATION DETECTED',
    trust: 'EVALUATING', status: 'Zero Trust protocol engaged',
  },
  passive_isolate: {
    color: '#00aaff', shadow: '#00aaff44',
    icon: '🔒', title: 'ADMIN TERMINAL — STANDBY MODE',
    trust: 'SUSPENDED', status: 'Access restricted to metadata only',
  },
  passive_reconnect: {
    color: '#00aaff', shadow: '#00aaff44',
    icon: '🔗', title: 'CONTROLLED RECONNECTION ACTIVE',
    trust: 'READ-ONLY', status: 'Minimal data stream — metadata only',
  },
  passive_safe: {
    color: '#ffcc00', shadow: '#ffcc0055',
    icon: '✅', title: 'PASSIVE THREAT NEUTRALIZED',
    trust: 'RESTORED', status: 'All nodes within safe trust boundaries',
  },
}

export default function PassiveBanner({ phase }) {
  const cfg = PHASES[phase]
  if (!cfg) return null
  const { color, shadow, icon, title, trust, status } = cfg

  return (
    <div style={{
      position: 'absolute',
      bottom: 16, left: 16,          // ← bottom-left, clear of the diagram
      background: `linear-gradient(135deg, ${color}08, #0b101800)`,
      backdropFilter: 'blur(8px)',
      border: `1px solid ${color}55`,
      borderRadius: 8,
      padding: '14px 20px',
      width: 300,
      boxShadow: `0 0 36px ${shadow}, inset 0 1px 0 ${color}22`,
      animation: 'fadeSlideIn 0.35s ease',
      zIndex: 10,
    }}>
      {/* Top accent */}
      <div style={{
        position: 'absolute', top: 0, left: 24, right: 24, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        borderRadius: 1,
      }} />

      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: color, boxShadow: `0 0 10px ${color}`,
          animation: phase === 'passive_isolate' ? 'pulse 1s infinite' : 'none',
          flexShrink: 0,
        }} />
        <div style={{
          fontFamily: 'var(--font-hud)', fontSize: '0.78rem', fontWeight: 700,
          letterSpacing: '0.1em', color,
        }}>
          {icon} {title}
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '5px', fontSize: '0.68rem' }}>
        {[
          ['Node IP',    '192.168.1.8'],
          ['Node Type',  'Admin Terminal'],
          ['Trust Level', trust],
          ['Protocol',   'Zero Trust / Adaptive'],
          ['Exposure',   phase === 'passive_reconnect' || phase === 'passive_safe' ? 'MINIMAL' : 'NONE'],
          ['Status',     status],
        ].map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', gap: 6 }}>
            <span style={{ color: 'var(--text-dim)', minWidth: 80 }}>{k}:</span>
            <span style={{ color: i === 2 ? color : 'var(--text-mid)' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
