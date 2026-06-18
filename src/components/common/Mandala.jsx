export default function Mandala({ size = 200, opacity = 0.2, className = "" }) {
  const c = size / 2
  const sc = (v) => v * (size / 200)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ opacity, pointerEvents: 'none', userSelect: 'none', display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`mg-${size}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FFD580" stopOpacity="0.9"/>
          <stop offset="40%"  stopColor="#F5A623" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#E8590C" stopOpacity="0.1"/>
        </radialGradient>
      </defs>

      {/* Ring 1 — outer boundary + 24 needle petals, slow CW */}
      <g style={{ transformOrigin: `${c}px ${c}px`, animation: 'mandala-cw 40s linear infinite' }}>
        <circle cx={c} cy={c} r={sc(92.5)} fill="none" stroke="#F5A623" strokeWidth="0.8" strokeOpacity="0.22"/>
        <circle cx={c} cy={c} r={sc(89)}   fill="none" stroke="#F5A623" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="4 6"/>
        <circle cx={c} cy={c} r={sc(85)}   fill="none" stroke="#F5A623" strokeWidth="0.8" strokeOpacity="0.22"/>
        {Array.from({ length: 24 }).map((_, i) => (
          <polygon
            key={i}
            points={`${c},${c - sc(92.5)} ${c + sc(4)},${c - sc(5)} ${c},${c - sc(12)} ${c - sc(4)},${c - sc(5)}`}
            fill="#F5A62318"
            stroke="#F5A62340"
            strokeWidth="0.5"
            transform={`rotate(${i * 15}, ${c}, ${c})`}
          />
        ))}
      </g>

      {/* Ring 2 — 10-point star + 8 ellipse petals, CCW */}
      <g style={{ transformOrigin: `${c}px ${c}px`, animation: 'mandala-ccw 30s linear infinite' }}>
        <circle cx={c} cy={c} r={sc(74)} fill="none" stroke="#F5A623" strokeWidth="0.8" strokeOpacity="0.28"/>
        {[0, 30].map((rot) => (
          <polygon
            key={rot}
            points={Array.from({ length: 10 }).map((_, i) => {
              const a = (i * 36 - 90) * Math.PI / 180
              const r = i % 2 === 0 ? sc(74) : sc(50)
              return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`
            }).join(' ')}
            fill="none"
            stroke="#F5A623"
            strokeWidth="0.8"
            strokeOpacity="0.32"
            transform={`rotate(${rot}, ${c}, ${c})`}
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse
            key={i}
            cx={c}
            cy={c - sc(55)}
            rx={sc(5)}
            ry={sc(20)}
            fill="#F5A62314"
            stroke="#F5A623"
            strokeWidth="0.5"
            strokeOpacity="0.38"
            transform={`rotate(${i * 45}, ${c}, ${c})`}
          />
        ))}
      </g>

      {/* Ring 3 — 8 lotus petals + interlocking triangles, CW */}
      <g style={{ transformOrigin: `${c}px ${c}px`, animation: 'mandala-cw 20s linear infinite' }}>
        <circle cx={c} cy={c} r={sc(60)}   fill="none" stroke="#F5A623" strokeWidth="1"   strokeOpacity="0.32"/>
        <circle cx={c} cy={c} r={sc(56.5)} fill="none" stroke="#F5A623" strokeWidth="0.5" strokeOpacity="0.18" strokeDasharray="3 5"/>
        {Array.from({ length: 8 }).map((_, i) => (
          <path
            key={i}
            d={`M${c},${c - sc(60)} Q${c + sc(30)},${c - sc(30)} ${c},${c - sc(20)} Q${c - sc(30)},${c - sc(30)} ${c},${c - sc(60)}Z`}
            fill="#F5A62310"
            stroke="#F5A623"
            strokeWidth="0.8"
            strokeOpacity="0.42"
            transform={`rotate(${i * 45}, ${c}, ${c})`}
          />
        ))}
        <polygon
          points={`${c},${c - sc(50)} ${c + sc(35)},${c + sc(15)} ${c - sc(35)},${c + sc(15)}`}
          fill="none" stroke="#F5A623" strokeWidth="1" strokeOpacity="0.42"
        />
        <polygon
          points={`${c},${c + sc(50)} ${c + sc(35)},${c - sc(15)} ${c - sc(35)},${c - sc(15)}`}
          fill="none" stroke="#E8590C" strokeWidth="1" strokeOpacity="0.42"
        />
      </g>

      {/* Ring 4 — 16 spokes + pentagon, CCW */}
      <g style={{ transformOrigin: `${c}px ${c}px`, animation: 'mandala-ccw 15s linear infinite' }}>
        <circle cx={c} cy={c} r={sc(42.5)} fill="none" stroke="#F5A623" strokeWidth="1" strokeOpacity="0.45"/>
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 22.5 - 90) * Math.PI / 180
          return (
            <line
              key={i}
              x1={c + sc(42.5) * Math.cos(angle)} y1={c + sc(42.5) * Math.sin(angle)}
              x2={c + sc(30) * Math.cos(angle)}   y2={c + sc(30) * Math.sin(angle)}
              stroke="#F5A623" strokeWidth="0.8" strokeOpacity="0.48"
            />
          )
        })}
        {[0, 36].map((rot, ri) => (
          <polygon
            key={ri}
            points={Array.from({ length: 5 }).map((_, i) => {
              const a = (i * 72 - 90) * Math.PI / 180
              return `${c + sc(42.5) * Math.cos(a)},${c + sc(42.5) * Math.sin(a)}`
            }).join(' ')}
            fill="none"
            stroke="#F5A623"
            strokeWidth={ri === 0 ? '0.8' : '0.5'}
            strokeOpacity={ri === 0 ? 0.42 : 0.25}
            transform={`rotate(${rot}, ${c}, ${c})`}
          />
        ))}
        <circle cx={c} cy={c} r={sc(30)} fill="none" stroke="#F5A623" strokeWidth="0.8" strokeOpacity="0.35" strokeDasharray="5 3"/>
      </g>

      {/* Ring 5 — Flower of Life + Star of David, fast CW */}
      <g style={{ transformOrigin: `${c}px ${c}px`, animation: 'mandala-cw 10s linear infinite' }}>
        <circle cx={c} cy={c} r={sc(22.5)} fill="none" stroke="#F5A623" strokeWidth="1.2" strokeOpacity="0.55"/>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i * 60 - 90) * Math.PI / 180
          return (
            <circle
              key={i}
              cx={c + sc(23) * Math.cos(a)}
              cy={c + sc(23) * Math.sin(a)}
              r={sc(12)}
              fill="none" stroke="#F5A623" strokeWidth="0.6" strokeOpacity="0.42"
            />
          )
        })}
        <polygon
          points={`${c},${c - sc(19)} ${c + sc(16.5)},${c + sc(9.5)} ${c - sc(16.5)},${c + sc(9.5)}`}
          fill="none" stroke="#F5A623" strokeWidth="1" strokeOpacity="0.85"
        />
        <polygon
          points={`${c},${c + sc(19)} ${c + sc(16.5)},${c - sc(9.5)} ${c - sc(16.5)},${c - sc(9.5)}`}
          fill="none" stroke="#F5A623" strokeWidth="1" strokeOpacity="0.85"
        />
      </g>

      {/* Static glowing center dot */}
      <circle
        cx={c} cy={c} r={sc(5)}
        fill={`url(#mg-${size})`}
        style={{ animation: 'mandala-pulse 4s ease-in-out infinite' }}
      />
      <circle cx={c} cy={c} r={sc(2.5)} fill="#FFD580"/>
    </svg>
  )
}