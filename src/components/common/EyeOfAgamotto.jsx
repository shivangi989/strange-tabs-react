export default function EyeOfAgamotto({ onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        width: "140px",
        height: "100px",
        margin: "0 auto",
        cursor: "pointer",
        animation: "float 4s ease-in-out infinite",
      }}
    >
      {/* OUTER EYE FRAME */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          overflow: "hidden",
          background:
            "linear-gradient(145deg,#3b2b00,#d4a017,#6d5200,#d4a017,#3b2b00)",
          boxShadow:
            "0 0 10px rgba(212,160,23,.5), inset 0 0 15px rgba(0,0,0,.8)",
        }}
      >
        {/* INNER CHAMBER */}
        <div
          style={{
            position: "absolute",
            inset: "8px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at center,#17351d,#081108,#000)",
            overflow: "hidden",
          }}
        >
          {/* GLOW BACKGROUND */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle,rgba(46,204,113,.15),transparent 70%)",
              animation: "green-pulse 3s ease-in-out infinite",
            }}
          />

          {/* SVG EYE ARCS */}
          <svg
            viewBox="0 0 140 100"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <defs>
              <filter id="goldGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* TOP ARC */}
            <path
              d="M25 50 Q70 5 115 50"
              fill="none"
              stroke="#D4A017"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#goldGlow)"
            />

            {/* BOTTOM ARC */}
            <path
              d="M25 50 Q70 95 115 50"
              fill="none"
              stroke="#D4A017"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#goldGlow)"
            />

            {/* LEFT CROSS ARC */}
            <path
              d="M40 18 Q70 50 40 82"
              fill="none"
              stroke="#D4A017"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#goldGlow)"
            />

            {/* RIGHT CROSS ARC */}
            <path
              d="M100 18 Q70 50 100 82"
              fill="none"
              stroke="#D4A017"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#goldGlow)"
            />
          </svg>

          {/* TIME STONE */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 30%,#d7ffd0,#7fff7f,#2ecc71,#146b2f)",
              boxShadow:
                "0 0 12px #2ecc71,0 0 25px rgba(46,204,113,.8),0 0 50px rgba(46,204,113,.5)",
              animation: "green-pulse 2s ease-in-out infinite",
              zIndex: 10,
            }}
          >
            {/* STONE CORE */}
            <div
              style={{
                position: "absolute",
                inset: "8px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,#ffffff,#a8ff80,#2ecc71)",
                animation: "iris-spin 8s linear infinite",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}