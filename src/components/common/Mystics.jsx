import '../../assets/mysticalEffect.css'
import Mandala from './Mandala'

export default function Mystics() {
  return (
    <div className="mystic-bg" aria-hidden="true">

      {/* Top-left — partially visible, creates corner effect */}
      <div style={{ position: 'absolute', top: -20, left: -20 }}>
        <Mandala size={160} opacity={0.22} />
      </div>

      {/* Bottom-right — partially visible */}
      <div style={{ position: 'absolute', bottom: -20, right: -20 }}>
        <Mandala size={140} opacity={0.18} />
      </div>

      {/* Center background glow */}
      <div className="sigil-glow" />

      {/* Constellation stars */}
      <div className="star" />
      <div className="star" />
      <div className="star" />
      <div className="star" />
      <div className="star" />
      <div className="star" />

      {/* Floating particles */}
      <div className="particle" />
      <div className="particle" />
      <div className="particle" />
      <div className="particle" />
      <div className="particle" />
      <div className="particle" />
      <div className="particle" />
      <div className="particle" />

      {/* Floating glyphs */}
      <div className="glyph">᛭</div>
      <div className="glyph">⎊</div>
      <div className="glyph">⧗</div>
      <div className="glyph">⌘</div>

    </div>
  )
}