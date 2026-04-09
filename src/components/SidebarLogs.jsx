import React, { useEffect, useRef } from 'react'

const TYPE = {
  info:   { color: '#00ff88', tag: 'INFO',   bg: '#00ff8808' },
  alert:  { color: '#ff2244', tag: 'ALERT',  bg: '#ff224408' },
  action: { color: '#00aaff', tag: 'ACTION', bg: '#00aaff08' },
  secure: { color: '#ffcc00', tag: 'SECURE', bg: '#ffcc0008' },
}

export default function SidebarLogs({ logs }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#00ff88', boxShadow: '0 0 6px #00ff88',
            display: 'inline-block', animation: 'pulse 1.4s infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-hud)', fontSize: '0.58rem',
            letterSpacing: '0.2em', color: 'var(--text-dim)',
          }}>SYSTEM TERMINAL</span>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
          color: 'var(--text-dim)',
        }}>{logs.length} events</span>
      </div>

      {/* Log list */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '8px 0',
        display: 'flex', flexDirection: 'column',
      }}>
        {logs.map((log, i) => {
          const s = TYPE[log.type] || TYPE.info
          return (
            <div key={i} style={{
              padding: '4px 12px',
              borderLeft: `2px solid ${s.color}44`,
              marginLeft: 8, marginRight: 8, marginBottom: 2,
              background: s.bg,
              borderRadius: '0 4px 4px 0',
              animation: 'logEntry 0.2s ease',
            }}>
              {/* Tag + timestamp row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1 }}>
                <span style={{
                  fontFamily: 'var(--font-hud)', fontSize: '0.48rem',
                  color: s.color, letterSpacing: '0.1em',
                  background: `${s.color}18`, padding: '1px 5px', borderRadius: 2,
                }}>{s.tag}</span>
                <span style={{ fontSize: '0.58rem', color: '#2a4a3a' }}>
                  {log.ts || '—'}
                </span>
              </div>
              {/* Message */}
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.67rem',
                color: s.color, lineHeight: 1.4, opacity: 0.9,
                wordBreak: 'break-word',
              }}>
                {log.text}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Cursor footer */}
      <div style={{
        padding: '6px 12px',
        borderTop: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
        color: '#00ff88', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <span style={{ color: 'var(--text-dim)' }}>{'>'}</span>
        <span style={{ animation: 'pulse 1s infinite' }}>█</span>
      </div>
    </div>
  )
}
