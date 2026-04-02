import React from 'react'

const NODES = [
  { id: 'icu',       label: 'ICU',            ip: '192.168.1.5', icon: '🏥' },
  { id: 'emergency', label: 'EMERGENCY',       ip: '192.168.1.6', icon: '🚨' },
  { id: 'pharmacy',  label: 'PHARMACY',        ip: '192.168.1.7', icon: '💊' },
  { id: 'admin',     label: 'ADMIN TERMINAL',  ip: '192.168.1.8', icon: '🖥' },
]

function nodeState(id, phase) {
  if (phase === 'attack' || phase === 'contained') {
    if (id === 'icu') return { color: '#ff2244', bg: '#1a0008', label: phase === 'contained' ? 'QUARANTINED' : 'COMPROMISED', pulse: true }
    return { color: '#00ff88', bg: '#001a0a', label: 'SECURE', pulse: false }
  }
  if (phase === 'passive_detect') {
    if (id === 'admin') return { color: '#ffcc00', bg: '#1a1400', label: 'EVALUATING', pulse: true }
    return { color: '#00ff88', bg: '#001a0a', label: 'ACTIVE', pulse: false }
  }
  if (phase === 'passive_isolate') {
    if (id === 'admin') return { color: '#00aaff', bg: '#001520', label: 'STANDBY', pulse: true }
    return { color: '#00ff88', bg: '#001a0a', label: 'ACTIVE', pulse: false }
  }
  if (phase === 'passive_reconnect') {
    if (id === 'admin') return { color: '#00aaff', bg: '#001520', label: 'READ-ONLY', pulse: false }
    return { color: '#00ff88', bg: '#001a0a', label: 'ACTIVE', pulse: false }
  }
  if (phase === 'passive_safe') {
    return { color: '#00ff88', bg: '#001a0a', label: 'SECURE', pulse: false }
  }
  return { color: '#00ff88', bg: '#001a0a', label: 'ONLINE', pulse: false }
}

export default function NodeStatusPanel({ phase }) {
  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      padding: '10px 12px',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        fontFamily: 'var(--font-hud)', fontSize: '0.58rem',
        letterSpacing: '0.2em', color: 'var(--text-dim)',
        marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{
          display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
          background: '#00ff88', boxShadow: '0 0 6px #00ff88',
          animation: 'pulse 1.5s infinite',
        }} />
        NODE STATUS
      </div>

      {/* Node cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {NODES.map(node => {
          const s = nodeState(node.id, phase)
          return (
            <div key={node.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 8px',
              background: s.bg,
              border: `1px solid ${s.color}33`,
              borderRadius: 5,
              transition: 'all 0.5s ease',
            }}>
              <span style={{ fontSize: '0.75rem' }}>{node.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-hud)', fontSize: '0.58rem',
                  color: s.color, letterSpacing: '0.1em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{node.label}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: 1 }}>{node.ip}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: s.color, boxShadow: `0 0 6px ${s.color}`,
                  display: 'inline-block',
                  animation: s.pulse ? 'pulse 0.8s infinite' : 'none',
                }} />
                <span style={{
                  fontFamily: 'var(--font-hud)', fontSize: '0.5rem',
                  color: s.color, letterSpacing: '0.08em',
                }}>{s.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
