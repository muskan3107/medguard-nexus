import React from 'react'

function iso(x, y) { return { x: (x - y) * 64, y: (x + y) * 32 } }

function isoTop(gx, gy, w, h) {
  const tl = iso(gx,gy), tr = iso(gx+w,gy), br = iso(gx+w,gy+h), bl = iso(gx,gy+h)
  return `${tl.x},${tl.y} ${tr.x},${tr.y} ${br.x},${br.y} ${bl.x},${bl.y}`
}
function isoLeft(gx, gy, w, h, d) {
  const bl = iso(gx,gy+h), br = iso(gx+w,gy+h)
  return `${bl.x},${bl.y} ${br.x},${br.y} ${br.x},${br.y+d} ${bl.x},${bl.y+d}`
}
function isoRight(gx, gy, w, h, d) {
  const tr = iso(gx+w,gy), br = iso(gx+w,gy+h)
  return `${tr.x},${tr.y} ${br.x},${br.y} ${br.x},${br.y+d} ${tr.x},${tr.y+d}`
}
function isoCenter(gx, gy, w, h) {
  const tl=iso(gx,gy), tr=iso(gx+w,gy), br=iso(gx+w,gy+h), bl=iso(gx,gy+h)
  return { x:(tl.x+tr.x+br.x+bl.x)/4, y:(tl.y+tr.y+br.y+bl.y)/4 }
}

const WARDS = [
  { id:'icu',       label:'ICU',           sub:'WARD 3B', gx:0.5, gy:0.5, w:3.2, h:2.6 },
  { id:'emergency', label:'EMERGENCY',     sub:'WARD 1A', gx:4.8, gy:0.5, w:3.2, h:2.6 },
  { id:'pharmacy',  label:'PHARMACY',      sub:'WARD 5C', gx:2.5, gy:4,   w:3.2, h:2.4 },
  { id:'admin',     label:'ADMIN',         sub:'TERMINAL',gx:7,   gy:3.8, w:2.6, h:2   },
]
const D = 26

function wc(w) { return isoCenter(w.gx, w.gy, w.w, w.h) }

function DataPacket({ x1, y1, x2, y2, delay=0, color='#00aaff' }) {
  return (
    <circle r="2.5" fill={color} opacity="0.85">
      <animateMotion path={`M${x1} ${y1} L${x2} ${y2}`}
        dur="2.8s" begin={`${delay}s`} repeatCount="indefinite"/>
    </circle>
  )
}

export default function HospitalMap({ phase }) {
  const isAttack    = phase === 'attack' || phase === 'contained'
  const isContained = phase === 'contained'
  const isPDetect   = phase === 'passive_detect'
  const isPIsolate  = phase === 'passive_isolate'
  const isPRecon    = phase === 'passive_reconnect'
  const isPSafe     = phase === 'passive_safe'
  const isPassive   = isPDetect || isPIsolate || isPRecon || isPSafe

  const [icu, emg, pha, adm] = WARDS
  const [cI, cE, cP, cA] = WARDS.map(wc)

  function ws(ward) {
    const isIcu = ward.id === 'icu'
    const isAdm = ward.id === 'admin'

    if (isAttack) {
      if (isIcu) return { stroke:'#ff2244', top:'#200008', left:'#180005', right:'#100003', op:1, filter:'url(#gr)', bright:true }
      return { stroke:'#00ff88', top:'#001a0c', left:'#001508', right:'#001005', op:1, filter:'url(#gg)' }
    }
    if (isPIsolate || isPRecon || isPSafe) {
      if (isAdm) return { stroke:'#00aaff', top:'#001828', left:'#001020', right:'#000c18', op: isPIsolate ? 0.38 : 0.6, filter:'url(#gb)', dashed:true }
      return { stroke:'#00ff88', top:'#002010', left:'#001a0c', right:'#001208', op:1, filter:'url(#ggb)' }
    }
    if (isPDetect) {
      if (isAdm) return { stroke:'#667766', top:'#0a100a', left:'#080c08', right:'#060a06', op:0.55, filter:'none' }
      return { stroke:'#00ff88', top:'#001a0c', left:'#001508', right:'#001005', op:1, filter:'url(#ggb)' }
    }
    if (isAdm) return { stroke:'#33aa55', top:'#0a100a', left:'#080c08', right:'#060a06', op:0.72, filter:'url(#ggd)' }
    return { stroke:'#00ff88', top:'#001208', left:'#001508', right:'#001005', op:1, filter:'url(#gg)' }
  }

  function ls(isAdmin) {
    if (isAttack) {
      const sev = !isAdmin && isContained
      return { stroke: sev ? '#223344' : '#00ff8877', w: sev ? 1.5 : 2, dash: sev ? '6,4' : '0', op: sev ? 0.35 : 1 }
    }
    if (isPIsolate && isAdmin)  return { stroke:'#223344', w:1, dash:'5,5', op:0.3 }
    if ((isPRecon || isPSafe) && isAdmin) return { stroke:'#00aaff', w:1.2, dash:'3,6', op:0.75 }
    return { stroke:'#00ff8866', w:2, dash:'0', op:0.9 }
  }

  const links = [
    { a:cI, b:cE, admin:false },
    { a:cI, b:cP, admin:false },
    { a:cE, b:cP, admin:false },
    { a:cP, b:cA, admin:true  },
    { a:cE, b:cA, admin:true  },
  ]

  return (
    <svg width="100%" height="100%" viewBox="-380 -60 1100 520" style={{ display:'block' }}>
      <defs>
        <filter id="gg"   x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="ggb"  x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"   result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="ggd"  x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2"   result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="gr"   x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"   result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="gb"   x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"   result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="gbig" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10"  result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

        <radialGradient id="bubbleG" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#00aaff" stopOpacity="0.05"/>
          <stop offset="65%"  stopColor="#00aaff" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#00aaff" stopOpacity="0.45"/>
        </radialGradient>
        <radialGradient id="ztG" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#00aaff" stopOpacity="0.02"/>
          <stop offset="80%"  stopColor="#00aaff" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#00aaff" stopOpacity="0.3"/>
        </radialGradient>
      </defs>

      {/* ── Floor grid ── */}
      {Array.from({length:11},(_,gx) => Array.from({length:9},(_,gy) => (
        <polygon key={`${gx}-${gy}`} points={isoTop(gx,gy,1,1)}
          fill="none" stroke="#0c1a0c" strokeWidth="0.6" opacity="0.55"/>
      )))}

      {/* ── Connection lines ── */}
      {links.map((lk,i) => {
        const s = ls(lk.admin)
        return (
          <line key={i} x1={lk.a.x} y1={lk.a.y} x2={lk.b.x} y2={lk.b.y}
            stroke={s.stroke} strokeWidth={s.w} strokeDasharray={s.dash} opacity={s.op}
            style={{transition:'all 0.9s ease'}}/>
        )
      })}

      {/* ── Data packets on reconnected admin lines ── */}
      {(isPRecon || isPSafe) && <>
        <DataPacket x1={cP.x} y1={cP.y} x2={cA.x} y2={cA.y} delay={0}   color="#00aaff"/>
        <DataPacket x1={cE.x} y1={cE.y} x2={cA.x} y2={cA.y} delay={1.4} color="#00aaff"/>
      </>}

      {/* ── Wards ── */}
      {WARDS.map(ward => {
        const s = ws(ward)
        const c = isoCenter(ward.gx, ward.gy, ward.w, ward.h)
        const isAdm = ward.id === 'admin'
        const isIcu = ward.id === 'icu'
        return (
          <g key={ward.id} filter={s.filter} opacity={s.op} style={{transition:'opacity 0.7s ease'}}>
            <polygon points={isoLeft(ward.gx,ward.gy,ward.w,ward.h,D)}
              fill={s.left} stroke={s.stroke} strokeWidth="0.8"
              strokeDasharray={s.dashed?'4,3':'0'}/>
            <polygon points={isoRight(ward.gx,ward.gy,ward.w,ward.h,D)}
              fill={s.right} stroke={s.stroke} strokeWidth="0.8"
              strokeDasharray={s.dashed?'4,3':'0'}/>
            <polygon points={isoTop(ward.gx,ward.gy,ward.w,ward.h)}
              fill={s.top} stroke={s.stroke} strokeWidth="1.4"
              strokeDasharray={s.dashed?'4,3':'0'}/>
            {/* Main label */}
            <text x={c.x} y={c.y+2} textAnchor="middle"
              fontFamily="'Orbitron',sans-serif"
              fontSize={isAdm ? 8 : 10} fontWeight="700"
              fill={s.stroke} letterSpacing="1.8">
              {ward.label}
            </text>
            {/* Sub label */}
            <text x={c.x} y={c.y+14} textAnchor="middle"
              fontFamily="'Share Tech Mono',monospace"
              fontSize="7" fill={s.stroke} opacity="0.55" letterSpacing="1">
              {ward.sub}
            </text>
          </g>
        )
      })}

      {/* ── Standby label ── */}
      {isPIsolate && (() => {
        const c = wc(adm)
        return <text x={c.x} y={c.y-36} textAnchor="middle"
          fontFamily="'Orbitron',sans-serif" fontSize="7.5"
          fill="#00aaff" letterSpacing="2" opacity="0.9"
          style={{animation:'pulse 1.4s infinite'}}>STANDBY MODE</text>
      })()}

      {/* ── Zero-trust ring ── */}
      {(isPIsolate || isPRecon || isPSafe) && (() => {
        const c = wc(adm)
        return (
          <g filter="url(#gb)">
            <ellipse cx={c.x} cy={c.y} rx="0" ry="0"
              fill="url(#ztG)" stroke="#00aaff" strokeWidth="1" strokeDasharray="4,3">
              <animate attributeName="rx" from="0" to="120" dur="0.7s" fill="freeze"/>
              <animate attributeName="ry" from="0" to="60"  dur="0.7s" fill="freeze"/>
            </ellipse>
            <text x={c.x} y={c.y-68} textAnchor="middle"
              fontFamily="'Orbitron',sans-serif" fontSize="7"
              fill="#00aaff" letterSpacing="2" opacity="0.75">
              {isPIsolate ? 'ZERO TRUST BOUNDARY' : 'LIMITED ACCESS'}
            </text>
          </g>
        )
      })()}

      {/* ── ICU attack rings ── */}
      {isAttack && !isContained && (() => {
        const c = wc(icu)
        return [0,0.45,0.9].map((delay,i) => (
          <ellipse key={i} cx={c.x} cy={c.y} rx="0" ry="0"
            fill="none" stroke="#ff2244" strokeWidth="1.5" opacity="0">
            <animate attributeName="rx" from="55" to="140" dur="1.5s" begin={`${delay}s`} repeatCount="indefinite"/>
            <animate attributeName="ry" from="28" to="70"  dur="1.5s" begin={`${delay}s`} repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.75" to="0" dur="1.5s" begin={`${delay}s`} repeatCount="indefinite"/>
          </ellipse>
        ))
      })()}

      {/* ── Containment bubble ── */}
      {isContained && (() => {
        const c = wc(icu)
        return (
          <g filter="url(#gbig)">
            <ellipse cx={c.x} cy={c.y} rx="0" ry="0"
              fill="url(#bubbleG)" stroke="#00aaff" strokeWidth="1.5">
              <animate attributeName="rx" from="0" to="155" dur="0.9s" fill="freeze"/>
              <animate attributeName="ry" from="0" to="78"  dur="0.9s" fill="freeze"/>
            </ellipse>
            <text x={c.x} y={c.y-86} textAnchor="middle"
              fontFamily="'Orbitron',sans-serif" fontSize="8"
              fill="#00aaff" letterSpacing="2.5" opacity="0.9">
              CONTAINMENT ACTIVE
            </text>
          </g>
        )
      })()}

      {/* ── Node dots ── */}
      {WARDS.map((ward,i) => {
        const c = wc(ward)
        const isAdm = ward.id === 'admin'
        const isIcu = ward.id === 'icu'
        let fill = '#00ff88', filt = 'url(#gg)'
        if (isIcu && isAttack)                      { fill='#ff2244'; filt='url(#gr)' }
        if (isAdm && (isPIsolate||isPRecon||isPSafe)){ fill='#00aaff'; filt='url(#gb)' }
        if (isAdm && isPDetect)                     { fill='#667766'; filt='none' }
        return (
          <circle key={i} cx={c.x} cy={c.y} r="5"
            fill={fill} filter={filt}
            style={{transition:'fill 0.5s ease'}}/>
        )
      })}
    </svg>
  )
}
