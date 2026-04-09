import React, { useEffect, useRef, useState } from 'react'

// Dial geometry — give generous padding so arcs never clip
const CX = 100, CY = 105, R = 72
const START_ANGLE = -215, END_ANGLE = 35
// SVG canvas: wide enough for outer ring + labels, tall enough for dial + ECG strip
const SVG_W = 200, SVG_H = 260

function polarToXY(deg, r) {
  const rad = (deg * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}
function arcPath(a, b, r) {
  const s = polarToXY(a, r), e = polarToXY(b, r)
  const large = b - a > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

function ecgPath(offset, mode) {
  const pts = [], steps = 100, W = 176
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W
    const t = (i / steps) * Math.PI * 5 + offset
    let y = 20 - Math.sin(t) * 3
    if (mode === 'attack') {
      const d = Math.abs(i - steps / 2)
      if (d < 8) y -= (8 - d) * 4.5
      if (d < 4) y += (4 - d) * 7
    } else if (mode === 'passive') {
      const d = Math.abs(i - steps / 2)
      if (d < 10) y -= (10 - d) * 1.5
    }
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(' ')
}

const TICK_ANGLES = [-215, -188, -161, -134, -107, -80, -53, -26, 1, 28]

export default function GaugePanel({ label, mode = 'normal', id }) {
  const [value, setValue]       = useState(0.04)
  const [waveOffset, setOffset] = useState(0)
  const rafRef    = useRef(null)
  const targetRef = useRef(0.04)

  useEffect(() => {
    if (mode === 'attack')       targetRef.current = 0.88 + Math.random() * 0.1
    else if (mode === 'passive') targetRef.current = 0.22 + Math.random() * 0.08
    else                         targetRef.current = 0.04
  }, [mode])

  useEffect(() => {
    let last = performance.now()
    const tick = (now) => {
      const dt = (now - last) / 1000; last = now
      setOffset(o => o + dt * 2.2)
      setValue(v => v + (targetRef.current - v) * Math.min(dt * 1.8, 1))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const needleAngle = START_ANGLE + value * (END_ANGLE - START_ANGLE)
  const tip   = polarToXY(needleAngle, R - 8)
  const base1 = polarToXY(needleAngle + 90, 6)
  const base2 = polarToXY(needleAngle - 90, 6)

  const color = value > 0.6 ? '#ff2244' : value > 0.3 ? '#ffcc00' : '#00ff88'
  const gA = START_ANGLE + 0.6 * (END_ANGLE - START_ANGLE)
  const gB = START_ANGLE + 0.8 * (END_ANGLE - START_ANGLE)

  // ECG strip Y position — below the dial with breathing room
  const ECG_Y = CY + R + 22

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg
        width={SVG_W} height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id={`gf-${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id={`gf2-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <radialGradient id={`dial-${id}`} cx="50%" cy="55%" r="55%">
            <stop offset="0%"   stopColor="#0d1a14"/>
            <stop offset="100%" stopColor="#060a0e"/>
          </radialGradient>
        </defs>

        {/* Dial background circle */}
        <circle cx={CX} cy={CY} r={R + 14} fill={`url(#dial-${id})`} stroke="#162030" strokeWidth="1"/>

        {/* Track */}
        <path d={arcPath(START_ANGLE, END_ANGLE, R)}
          fill="none" stroke="#0d1a14" strokeWidth="14" strokeLinecap="round"/>

        {/* Zone arcs (dim background) */}
        <path d={arcPath(START_ANGLE, gA, R)} fill="none" stroke="#00ff88" strokeWidth="10" strokeLinecap="round" opacity="0.18"/>
        <path d={arcPath(gA, gB, R)}          fill="none" stroke="#ffcc00" strokeWidth="10" strokeLinecap="round" opacity="0.18"/>
        <path d={arcPath(gB, END_ANGLE, R)}   fill="none" stroke="#ff2244" strokeWidth="10" strokeLinecap="round" opacity="0.18"/>

        {/* Active fill */}
        <path d={arcPath(START_ANGLE, needleAngle, R)}
          fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          filter={`url(#gf-${id})`} style={{ transition: 'stroke 0.3s' }}/>

        {/* Tick marks */}
        {TICK_ANGLES.map((a, i) => {
          const inner = polarToXY(a, R - 18)
          const outer = polarToXY(a, R - 8)
          return <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
            stroke="#1a3a2a" strokeWidth="1.2"/>
        })}

        {/* Needle glow */}
        <polygon points={`${tip.x},${tip.y} ${base1.x},${base1.y} ${base2.x},${base2.y}`}
          fill={color} opacity="0.25" filter={`url(#gf2-${id})`}/>
        {/* Needle */}
        <polygon points={`${tip.x},${tip.y} ${base1.x},${base1.y} ${base2.x},${base2.y}`}
          fill={color} filter={`url(#gf-${id})`}/>

        {/* Centre hub */}
        <circle cx={CX} cy={CY} r="10" fill="#060a0e" stroke={color} strokeWidth="1.5"/>
        <circle cx={CX} cy={CY} r="4.5" fill={color} filter={`url(#gf-${id})`}/>

        {/* Value readout */}
        <text x={CX} y={CY + 28} textAnchor="middle"
          fontFamily="'Orbitron', sans-serif" fontSize="17" fontWeight="700"
          fill={color} filter={`url(#gf-${id})`}>
          {value.toFixed(2)}
        </text>

        {/* Min / Max labels */}
        {(() => {
          const minP = polarToXY(START_ANGLE, R + 20)
          const maxP = polarToXY(END_ANGLE,   R + 20)
          return <>
            <text x={minP.x} y={minP.y + 4} textAnchor="middle"
              fontFamily="'Orbitron', sans-serif" fontSize="8" fill="#2a4a3a">0.0</text>
            <text x={maxP.x} y={maxP.y + 4} textAnchor="middle"
              fontFamily="'Orbitron', sans-serif" fontSize="8" fill="#2a4a3a">1.0</text>
          </>
        })()}

        {/* ECG strip — positioned below dial */}
        <g transform={`translate(12, ${ECG_Y})`}>
          <rect x="0" y="0" width="176" height="40" rx="4"
            fill="#060e0a" stroke="#162030" strokeWidth="1"/>
          {[10, 20, 30].map(y => (
            <line key={y} x1="0" y1={y} x2="176" y2={y} stroke="#0d1f0d" strokeWidth="0.5"/>
          ))}
          {[44, 88, 132].map(x => (
            <line key={x} x1={x} y1="0" x2={x} y2="40" stroke="#0d1f0d" strokeWidth="0.5"/>
          ))}
          <path d={ecgPath(waveOffset, mode)}
            fill="none" stroke={color} strokeWidth="1.4"
            filter={`url(#gf-${id})`}/>
        </g>
      </svg>

      {/* Label below */}
      <div style={{
        fontFamily: 'var(--font-hud)', fontSize: '0.62rem',
        letterSpacing: '0.18em', color,
        textAlign: 'center',
        textShadow: `0 0 10px ${color}66`,
        transition: 'color 0.4s',
      }}>{label}</div>
    </div>
  )
}
