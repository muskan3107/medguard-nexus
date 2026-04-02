import React, { useState, useCallback, useEffect } from 'react'
import HospitalMap from './components/HospitalMap'
import GaugePanel from './components/GaugePanel'
import AlertBox from './components/AlertBox'
import PassiveBanner from './components/PassiveBanner'
import SidebarLogs from './components/SidebarLogs'
import NodeStatusPanel from './components/NodeStatusPanel'

function statusInfo(phase) {
  if (phase === 'attack')            return { color: '#ff2244', label: 'UNDER ATTACK',              dot: 'red' }
  if (phase === 'contained')         return { color: '#ff2244', label: 'THREAT CONTAINED',           dot: 'red' }
  if (phase === 'passive_detect')    return { color: '#ffcc00', label: 'PASSIVE THREAT DETECTED',    dot: 'yellow' }
  if (phase === 'passive_isolate')   return { color: '#00aaff', label: 'NODE ISOLATION ACTIVE',      dot: 'blue' }
  if (phase === 'passive_reconnect') return { color: '#00aaff', label: 'CONTROLLED RECONNECTION',    dot: 'blue' }
  if (phase === 'passive_safe')      return { color: '#ffcc00', label: 'PASSIVE THREAT NEUTRALIZED', dot: 'yellow' }
  return { color: '#00ff88', label: 'ALL SYSTEMS NOMINAL', dot: 'green' }
}

export default function App() {
  const [phase, setPhase] = useState('idle')
  const [tick, setTick]   = useState(0)
  const [logs, setLogs]   = useState([
    { type: 'info',   text: 'MedGuard Nexus v2.4.1 — boot sequence complete' },
    { type: 'info',   text: 'Digital Twin Engine: ONLINE' },
    { type: 'info',   text: 'Baseline Desync: 0.02 — nominal' },
    { type: 'info',   text: 'Behavioral Entropy: 0.04 — within threshold' },
    { type: 'info',   text: 'Monitoring 4 nodes: ICU · EMERGENCY · PHARMACY · ADMIN' },
  ])

  // Live clock tick
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const pushLog = useCallback((type, text) => {
    setLogs(prev => [...prev, { type, text, ts: new Date().toLocaleTimeString() }])
  }, [])

  const handleAttack = () => {
    if (phase !== 'idle') return
    setPhase('attack')
    pushLog('alert',  'Anomaly detected — ICU cluster behavioral shift')
    pushLog('alert',  'CRITICAL: Ransomware signature matched — Node 192.168.1.5')
    pushLog('alert',  'Network Desync spike: 0.02 → 0.94')
    pushLog('alert',  'Behavioral Entropy spike: 0.04 → 0.87')
    setTimeout(() => {
      setPhase('contained')
      pushLog('action', 'Automated Protocol: Isolating Node 192.168.1.5')
      pushLog('action', 'Docker network quarantine: ACTIVE')
      pushLog('action', 'ICU ↔ Emergency link: SEVERED')
      pushLog('action', 'ICU ↔ Pharmacy link: SEVERED')
      pushLog('info',   'Containment Bubble deployed around ICU')
      pushLog('info',   'Non-infected nodes: STABLE')
    }, 2000)
  }

  const handlePassive = () => {
    if (phase !== 'idle') return
    setPhase('passive_detect')
    pushLog('info',   'Sensitive operation detected — ICU cluster')
    pushLog('info',   'Reducing network exposure — Zero Trust protocol engaged')
    pushLog('info',   'Behavioral Entropy: 0.04 → 0.18 (minor fluctuation)')
    setTimeout(() => {
      setPhase('passive_isolate')
      pushLog('action', 'Node 192.168.1.8 moved to standby')
      pushLog('action', 'Access restricted to metadata only')
      pushLog('secure', 'Passive attack surface minimized')
      pushLog('info',   'Admin Terminal: Selective Participation suspended')
    }, 1200)
    setTimeout(() => {
      setPhase('passive_reconnect')
      pushLog('info', 'Controlled access granted to Node 192.168.1.8')
      pushLog('info', 'Data exposure: MINIMAL — metadata stream only')
      pushLog('info', 'Adaptive Trust level: READ-ONLY')
    }, 3200)
    setTimeout(() => {
      setPhase('passive_safe')
      pushLog('secure', 'PASSIVE THREAT NEUTRALIZED')
      pushLog('info',   'Network Desync: 0.18 → 0.03 (stabilised)')
      pushLog('info',   'All nodes operating within trust boundaries')
    }, 5000)
  }

  const handleReset = () => {
    setPhase('idle')
    setLogs([
      { type: 'info', text: 'System reset — all nodes nominal' },
      { type: 'info', text: 'Baseline Desync: 0.02' },
      { type: 'info', text: 'Behavioral Entropy: 0.04 — within threshold' },
      { type: 'info', text: 'Digital Twin sync: OK (4 nodes)' },
    ])
  }

  const isActiveAttack = phase === 'attack' || phase === 'contained'
  const isPassive      = phase.startsWith('passive')
  const gaugeMode      = isActiveAttack ? 'attack' : isPassive ? 'passive' : 'normal'
  const { color: statusColor, label: statusLabel, dot: dotType } = statusInfo(phase)

  const dotColor = dotType === 'red' ? '#ff2244' : dotType === 'yellow' ? '#ffcc00' : dotType === 'blue' ? '#00aaff' : '#00ff88'

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: 'auto 1fr 260px',
      gridTemplateColumns: '1fr 300px',
      height: '100vh',
      background: 'var(--bg)',
      gap: 0,
    }}>
      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header style={{
        gridColumn: '1 / -1',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 24,
        padding: '0 24px',
        height: 64,
        background: 'linear-gradient(90deg, #060e0a 0%, #0b1520 50%, #060e0a 100%)',
        borderBottom: '1px solid #162030',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Header shimmer line */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, #00ff8844, #00aaff66, #00ff8844, transparent)',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #001a0a, #002a18)',
            border: '1px solid #00ff8844',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
            boxShadow: '0 0 16px #00ff8833',
          }}>🛡</div>
          <div>
            <div style={{
              fontFamily: 'var(--font-hud)', fontSize: '1.1rem', fontWeight: 900,
              color: '#00ff88', letterSpacing: '0.15em',
              textShadow: '0 0 20px #00ff8877',
            }}>MEDGUARD NEXUS</div>
            <div style={{
              fontSize: '0.6rem', color: 'var(--text-dim)',
              letterSpacing: '0.25em', marginTop: 1,
            }}>CYBER DIGITAL TWIN · HOSPITAL SECURITY OPS</div>
          </div>
        </div>

        {/* Centre stats bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {[
            { label: 'NODES ONLINE', value: '4/4', color: '#00ff88' },
            { label: 'THREATS TODAY', value: isActiveAttack ? '1' : '0', color: isActiveAttack ? '#ff2244' : '#00ff88' },
            { label: 'UPTIME', value: '99.97%', color: '#00ff88' },
            { label: 'SYNC RATE', value: '500ms', color: '#00aaff' },
            { label: 'TRUST LEVEL', value: isPassive ? 'ADAPTIVE' : 'FULL', color: isPassive ? '#ffcc00' : '#00ff88' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '6px 16px',
              borderLeft: i === 0 ? '1px solid #162030' : 'none',
              borderRight: '1px solid #162030',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', letterSpacing: '0.2em', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-hud)', fontSize: '0.75rem', color: s.color, fontWeight: 700 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Right: status + buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Status pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 14px',
            border: `1px solid ${dotColor}33`,
            borderRadius: 20,
            background: `${dotColor}11`,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: dotColor, boxShadow: `0 0 8px ${dotColor}`,
              display: 'inline-block', animation: 'pulse 1.2s infinite',
            }} />
            <span style={{
              fontFamily: 'var(--font-hud)', fontSize: '0.6rem',
              color: dotColor, letterSpacing: '0.12em', whiteSpace: 'nowrap',
            }}>{statusLabel}</span>
          </div>

          {/* Buttons */}
          <button onClick={handleAttack} disabled={phase !== 'idle'} style={btnStyle('#ff2244', '#1a0008')}>
            ⚡ SIMULATE ATTACK
          </button>
          <button onClick={handlePassive} disabled={phase !== 'idle'} style={btnStyle('#ffcc00', '#1a1400')}>
            🔒 PASSIVE THREAT
          </button>
          {phase !== 'idle' && (
            <button onClick={handleReset} style={{
              fontFamily: 'var(--font-hud)', fontSize: '0.6rem', letterSpacing: '0.1em',
              padding: '7px 12px', border: '1px solid #2a3a2a', borderRadius: 4,
              background: 'transparent', color: '#4a7a5a', cursor: 'pointer',
            }}>↺ RESET</button>
          )}
        </div>
      </header>

      {/* ══ MAP AREA ════════════════════════════════════════════════════════ */}
      <main style={{
        gridColumn: '1', gridRow: '2',
        position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 40%, #0a1a10 0%, #060a0e 70%)',
      }}>
        <HospitalMap phase={phase} />
        {isActiveAttack && <AlertBox contained={phase === 'contained'} />}
        {isPassive      && <PassiveBanner phase={phase} />}
      </main>

      {/* ══ SIDEBAR ═════════════════════════════════════════════════════════ */}
      <aside style={{
        gridColumn: '2', gridRow: '2 / 4',
        display: 'flex', flexDirection: 'column',
        background: 'var(--panel)',
        borderLeft: '1px solid var(--border)',
        overflow: 'hidden',
      }}>
        <NodeStatusPanel phase={phase} />
        <SidebarLogs logs={logs} />
      </aside>

      {/* ══ GAUGE BAR ═══════════════════════════════════════════════════════ */}
      <div style={{
        gridColumn: '1', gridRow: '3',
        display: 'flex', alignItems: 'center',
        background: 'linear-gradient(180deg, #0b1520 0%, #060a0e 100%)',
        borderTop: '1px solid var(--border)',
        height: 260,
        padding: '12px 40px',
        position: 'relative',
        overflow: 'visible',
      }}>
        <CornerMark pos="tl" /><CornerMark pos="tr" />

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 56 }}>
          <GaugePanel label="Behavioral Entropy" mode={gaugeMode} id="entropy" />
          <div style={{ width: 1, background: 'var(--border)', height: 200 }} />
          <GaugePanel label="Network Desync"     mode={gaugeMode} id="desync"  />
        </div>

        <ThreatMeter phase={phase} />
      </div>
    </div>
  )
}

function btnStyle(color, bg) {
  return {
    fontFamily: 'var(--font-hud)', fontSize: '0.6rem', letterSpacing: '0.1em',
    padding: '7px 14px',
    border: `1px solid ${color}66`,
    borderRadius: 4,
    background: bg,
    color,
    cursor: 'pointer',
    boxShadow: `0 0 10px ${color}22`,
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  }
}

function CornerMark({ pos }) {
  const isLeft = pos === 'tl' || pos === 'bl'
  const isTop  = pos === 'tl' || pos === 'tr'
  return (
    <div style={{
      position: 'absolute',
      top: isTop ? 6 : 'auto', bottom: isTop ? 'auto' : 6,
      left: isLeft ? 8 : 'auto', right: isLeft ? 'auto' : 8,
      width: 12, height: 12,
      borderTop:    isTop  ? '1px solid #00ff8844' : 'none',
      borderBottom: !isTop ? '1px solid #00ff8844' : 'none',
      borderLeft:   isLeft ? '1px solid #00ff8844' : 'none',
      borderRight:  !isLeft ? '1px solid #00ff8844' : 'none',
    }} />
  )
}

function ThreatMeter({ phase }) {
  const levels = [
    { label: 'CRITICAL', color: '#ff2244', active: phase === 'attack' || phase === 'contained' },
    { label: 'HIGH',     color: '#ff6600', active: false },
    { label: 'MEDIUM',   color: '#ffcc00', active: phase.startsWith('passive') },
    { label: 'LOW',      color: '#88ff44', active: false },
    { label: 'NOMINAL',  color: '#00ff88', active: phase === 'idle' },
  ]
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      marginLeft: 40, minWidth: 150,
      padding: '16px 20px',
      background: '#0a1018',
      border: '1px solid var(--border)',
      borderRadius: 8,
    }}>
      <div style={{
        fontFamily: 'var(--font-hud)', fontSize: '0.6rem',
        color: 'var(--text-dim)', letterSpacing: '0.2em', marginBottom: 4,
      }}>
        THREAT LEVEL
      </div>
      {levels.map((l, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: l.active ? 32 : 16, height: 5, borderRadius: 3,
            background: l.active ? l.color : '#1a2a1a',
            boxShadow: l.active ? `0 0 10px ${l.color}` : 'none',
            transition: 'all 0.4s ease', flexShrink: 0,
          }} />
          <span style={{
            fontFamily: 'var(--font-hud)', fontSize: '0.58rem',
            color: l.active ? l.color : '#2a3a2a',
            letterSpacing: '0.1em',
            transition: 'color 0.4s',
          }}>{l.label}</span>
          {l.active && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: l.color, boxShadow: `0 0 8px ${l.color}`,
              animation: 'pulse 1s infinite', flexShrink: 0,
            }} />
          )}
        </div>
      ))}
    </div>
  )
}
