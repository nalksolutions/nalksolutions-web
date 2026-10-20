import type { ServiceTheme } from '../../content/services/presentation';

/** Decorative diagrams carry no new content or product claims. */
export function ServiceArtwork({ theme }: { theme: ServiceTheme }) {
  return (
    <div className={`service-artwork service-artwork-${theme}`} aria-hidden="true">
      <svg viewBox="0 0 520 520" fill="none" focusable="false">
        <circle cx="260" cy="260" r="226" className="service-art-orbit" />
        <circle cx="260" cy="260" r="175" className="service-art-orbit" strokeDasharray="3 12" />
        {theme === 'automation' ? (
          <>
            <path
              d="M260 150V80M260 370v70M150 260H80m290 0h70M183 183l-50-50m204 204 50 50m-50-204 50-50M183 337l-50 50"
              className="service-art-connector"
            />
            <rect
              x="169"
              y="169"
              width="182"
              height="182"
              rx="50"
              className="service-art-surface"
            />
            <path
              d="m260 211 14 35 35 14-35 14-14 35-14-35-35-14 35-14z"
              className="service-art-accent"
            />
            {[
              [260, 80],
              [440, 260],
              [260, 440],
              [80, 260],
              [133, 133],
              [387, 387],
              [387, 133],
              [133, 387],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={i < 4 ? 17 : 10} className="service-art-node" />
            ))}
          </>
        ) : theme === 'platform' ? (
          <>
            {[150, 230, 310].map((y, i) => (
              <g key={y}>
                <rect
                  x={110 + i * 12}
                  y={y}
                  width="288"
                  height="72"
                  rx="18"
                  className="service-art-surface"
                />
                <circle cx={143 + i * 12} cy={y + 36} r="6" className="service-art-accent" />
                <path d={`M${172 + i * 12} ${y + 36}h135`} className="service-art-connector" />
              </g>
            ))}
            <path d="M260 112V67M260 404v48M92 266H54m373 0h39" className="service-art-connector" />
          </>
        ) : theme === 'marketing' ? (
          <>
            <rect
              x="105"
              y="135"
              width="310"
              height="262"
              rx="28"
              className="service-art-surface"
            />
            {[130, 190, 250, 310].map((x, i) => (
              <rect
                key={x}
                x={x}
                y={330 - i * 41}
                width="35"
                height={40 + i * 41}
                rx="8"
                className="service-art-bar"
              />
            ))}
            <path
              d="m130 279 77-65 62 10 94-88m-1 0h-47m47 0v47"
              className="service-art-connector"
            />
            <circle cx="388" cy="128" r="35" className="service-art-node" />
          </>
        ) : (
          <>
            <rect x="77" y="125" width="350" height="258" rx="25" className="service-art-surface" />
            <path d="M78 174h348" className="service-art-connector" />
            {[105, 122, 139].map((cx) => (
              <circle key={cx} cx={cx} cy="150" r="4" className="service-art-accent" />
            ))}
            {theme === 'software' ? (
              <>
                <path
                  d="m182 225-38 35 38 35m85-70 38 35-38 35m-38-87-22 104"
                  className="service-art-connector"
                />
                <rect
                  x="340"
                  y="240"
                  width="95"
                  height="163"
                  rx="19"
                  className="service-art-node"
                />
                <path d="M370 265h35m-35 107h35" className="service-art-connector" />
              </>
            ) : (
              <>
                <rect
                  x="105"
                  y="205"
                  width="120"
                  height="147"
                  rx="12"
                  className="service-art-bar"
                />
                <path
                  d="M253 214h142m-142 27h104m-104 42h142m-142 27h83"
                  className="service-art-connector"
                />
                <rect
                  x="253"
                  y="338"
                  width="80"
                  height="16"
                  rx="8"
                  className="service-art-accent"
                />
              </>
            )}
          </>
        )}
        <circle cx="438" cy="136" r="7" className="service-art-accent" />
        <circle cx="95" cy="389" r="5" className="service-art-accent" />
      </svg>
    </div>
  );
}
