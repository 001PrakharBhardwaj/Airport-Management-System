export default function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <svg className="hero-field" viewBox="0 0 640 460" fill="none">
        {Array.from({ length: 8 }, (_, index) => (
          <line
            className="hero-grid-line"
            key={`h-${index}`}
            x1="20"
            x2="620"
            y1={40 + index * 48}
            y2={40 + index * 48}
          />
        ))}
        {Array.from({ length: 7 }, (_, index) => (
          <line
            className="hero-grid-line"
            key={`v-${index}`}
            x1={40 + index * 90}
            x2={40 + index * 90}
            y1="24"
            y2="430"
          />
        ))}
        <path className="route-path-solid" d="M48 392C132 360 168 250 248 228c92-26 148-18 214 24 58 36 92 18 126-42" />
        <path className="route-path" d="M48 392C132 360 168 250 248 228c92-26 148-18 214 24 58 36 92 18 126-42" />
        <circle cx="48" cy="392" r="4" fill="currentColor" />
        <circle cx="588" cy="92" r="4" fill="currentColor" />
        <g className="plane-mark">
          <path d="M588 92l-18 6 4-10 10-4 4 8Z" fill="currentColor" />
        </g>
      </svg>
      <p className="visual-caption">
        <span>Field grid 01</span>
        <span>Route vector</span>
      </p>
    </div>
  )
}
