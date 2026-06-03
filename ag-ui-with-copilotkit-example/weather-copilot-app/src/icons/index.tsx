export const SunIcon = ({ accent }: { accent: string }) => (
  <g className="weather-sun">
    <circle cx="52" cy="36" r="14" fill={accent} opacity="0.95" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <line
        key={angle}
        x1="52"
        y1="36"
        x2="52"
        y2="18"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        transform={`rotate(${angle} 52 36)`}
        opacity="0.85"
      />
    ))}
  </g>
);

export const CloudIcon = ({
  x,
  opacity = 1,
}: {
  x: number;
  opacity?: number;
}) => (
  <g opacity={opacity} className="weather-cloud">
    <ellipse cx={x} cy="42" rx="18" ry="10" fill="white" opacity="0.92" />
    <ellipse cx={x + 16} cy="44" rx="14" ry="9" fill="white" opacity="0.88" />
    <ellipse cx={x - 12} cy="44" rx="12" ry="8" fill="white" opacity="0.85" />
  </g>
);

export const RainIcon = () => (
  <g className="weather-rain">
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <line
        key={i}
        x1={34 + i * 8}
        y1="54"
        x2={30 + i * 8}
        y2="68"
        stroke="#93c5fd"
        strokeWidth="2"
        strokeLinecap="round"
        className="weather-rain-drop"
        style={{ animationDelay: `${i * 0.12}s` }}
      />
    ))}
  </g>
);

export const SnowIcon = () => (
  <g className="weather-snow">
    {[0, 1, 2, 3, 4].map((i) => (
      <circle
        key={i}
        cx={36 + i * 10}
        cy={56 + (i % 2) * 4}
        r="2"
        fill="white"
        className="weather-snow-flake"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </g>
);

export const FogIcon = () => (
  <g opacity="0.75">
    {[58, 64, 70].map((y) => (
      <line
        key={y}
        x1="28"
        y1={y}
        x2="76"
        y2={y}
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    ))}
  </g>
);

export const ThunderIcon = ({ accent }: { accent: string }) => (
  <path
    d="M52 50 L46 62 H52 L48 74 L60 58 H54 L58 50 Z"
    fill={accent}
    className="weather-lightning"
  />
);
