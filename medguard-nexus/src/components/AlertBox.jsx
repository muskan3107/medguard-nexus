import React from "react"

export default function AlertBox({ contained }) {
  const color  = contained ? "#00aaff" : "#ff2244"
  const bg     = contained ? "#00aaff08" : "#ff224408"
  const shadow = contained ? "#00aaff44" : "#ff224444"

  return (
    <div style={{
      position: "absolute", top: 14, left: "50%",
      transform: "translateX(-50%)",
      background: `linear-gradient(135deg, ${bg}, #0b101800)`,
      backdropFilter: "blur(8px)",
      border: `1px solid ${color}55`,
      borderRadius: 8,
      padding: "14px 24px",
      minWidth: 380,
      boxShadow: `0 0 40px ${shadow}, inset 0 1px 0 ${color}22`,
      animation: "fadeSlideIn 0.35s ease",
      zIndex: 10,
    }}>
      <div style={{
        position: "absolute", top: 0, left: 24, right: 24, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        borderRadius: 1,
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: color, boxShadow: `0 0 10px ${color}`,
          animation: contained ? "none" : "pulse 0.6s infinite",
          flexShrink: 0,
        }} />
        <div style={{
          fontFamily: "var(--font-hud)", fontSize: "0.8rem", fontWeight: 700,
          letterSpacing: "0.1em", color,
        }}>
          {contained ? "NODE ISOLATED — CONTAINMENT ACTIVE" : "CRITICAL: RANSOMWARE DETECTED"}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", fontSize: "0.68rem" }}>
        {[
          ["Source IP",     "192.168.1.5"],
          ["Target Node",   "ICU — Ward 3B"],
          ["Attack Vector", "Lateral Movement"],
          ["Desync Score",  "0.94"],
          ["Entropy",       "0.87"],
          ["Status", contained ? "QUARANTINED" : "ACTIVE THREAT"],
        ].map(([k, v], i) => (
          <div key={i} style={{ display: "flex", gap: 6 }}>
            <span style={{ color: "var(--text-dim)", minWidth: 90 }}>{k}:</span>
            <span style={{ color: (i === 3 || i === 4) ? "#ff2244" : (i === 5 && contained) ? "#00aaff" : "var(--text-mid)" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
