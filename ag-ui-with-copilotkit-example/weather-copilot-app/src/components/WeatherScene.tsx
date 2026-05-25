import {
  CloudIcon,
  FogIcon,
  RainIcon,
  SnowIcon,
  SunIcon,
  ThunderIcon,
} from "../icons";
import type { WeatherSceneProps } from "../types";

const renderSceneIcons = (theme: WeatherSceneProps["theme"], accent: string) => {
  switch (theme) {
    case "clear":
      return <SunIcon accent={accent} />;
    case "partly-cloudy":
      return (
        <>
          <SunIcon accent={accent} />
          <CloudIcon x={62} opacity={0.9} />
        </>
      );
    case "cloudy":
      return <CloudIcon x={48} />;
    case "rain":
      return (
        <>
          <CloudIcon x={48} />
          <RainIcon />
        </>
      );
    case "drizzle":
      return (
        <>
          <CloudIcon x={48} />
          <RainIcon />
        </>
      );
    case "thunder":
      return (
        <>
          <CloudIcon x={44} />
          <RainIcon />
          <ThunderIcon accent={accent} />
        </>
      );
    case "snow":
      return (
        <>
          <CloudIcon x={48} opacity={0.95} />
          <SnowIcon />
        </>
      );
    case "fog":
      return <FogIcon />;
    default:
      return null;
  }
};

export const WeatherScene = ({ theme, accent }: WeatherSceneProps) => (
  <svg viewBox="0 0 104 80" className="h-24 w-full" aria-hidden role="img">
    <defs>
      <linearGradient id="weather-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--sky-from)" />
        <stop offset="100%" stopColor="var(--sky-to)" />
      </linearGradient>
    </defs>
    <rect width="104" height="80" rx="12" fill="url(#weather-sky)" />
    {renderSceneIcons(theme, accent)}
  </svg>
);
