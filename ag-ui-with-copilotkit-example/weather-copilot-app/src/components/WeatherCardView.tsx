import type { CSSProperties } from "react";
import type {
  WeatherCardField,
  WeatherCardViewProps,
  WeatherReport,
} from "../types";
import { getMetricConfig, getWeatherTheme } from "../utils";
import { WeatherScene } from "./WeatherScene";

const METRIC_FIELDS: WeatherCardField[] = [
  "temperature",
  "feelsLike",
  "humidity",
  "wind",
];

const formatTemp = (value: number) => `${value.toFixed(1)}°C`;

const MetricCard = ({
  label,
  value,
  gradient,
  compact,
  multiline,
}: {
  label: string;
  value: string;
  gradient: string;
  compact?: boolean;
  multiline?: boolean;
}) => (
  <article
    className={`weather-card-root rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-200/60 ${
      compact ? "p-3" : "p-4"
    }`}
  >
    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
      {label}
    </p>
    <p
      className={`mt-1 bg-gradient-to-r ${gradient} bg-clip-text font-bold text-transparent ${
        multiline ? "text-sm leading-relaxed" : compact ? "text-lg" : "text-2xl"
      }`}
    >
      {value}
    </p>
  </article>
);

const HeroCard = ({
  report,
  compact,
}: {
  report: WeatherReport;
  compact?: boolean;
}) => {
  const theme = getWeatherTheme(report.conditions);

  return (
    <article
      className="weather-card-root overflow-hidden rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-300/50"
      style={
        {
          "--sky-from": theme.skyFrom,
          "--sky-to": theme.skyTo,
        } as CSSProperties
      }
    >
      <div
        className="relative px-4 pt-4"
        style={{
          background: `linear-gradient(160deg, ${theme.skyFrom} 0%, ${theme.skyTo} 100%)`,
        }}
      >
        <div className="mb-1 flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/90">
              Current weather
            </p>
            <h3
              className={`font-bold text-white drop-shadow-sm ${
                compact ? "text-base" : "text-xl"
              }`}
            >
              {report.location}
            </h3>
            <p className="text-xs font-medium text-white/85">{theme.label}</p>
          </div>
          <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            Live
          </span>
        </div>
        <WeatherScene theme={theme.theme} accent={theme.accent} />
        <p
          className={`pb-3 text-center font-light text-white drop-shadow ${
            compact ? "text-2xl" : "text-4xl"
          }`}
        >
          {formatTemp(report.temperature)}
        </p>
      </div>
    </article>
  );
};

export const WeatherCardView = ({
  report,
  field,
  compact = false,
}: WeatherCardViewProps) => {
  const theme = getWeatherTheme(report.conditions);

  if (field === "hero") {
    return <HeroCard report={report} compact={compact} />;
  }

  const metric = getMetricConfig(report, field, theme.hint);
  if (!metric) return null;

  return (
    <MetricCard
      label={metric.label}
      value={metric.value}
      gradient={metric.gradient}
      compact={compact}
      multiline={field === "hint" || field === "conditions"}
    />
  );
};

export const WeatherReportView = ({
  report,
  compact = false,
}: {
  report: WeatherReport;
  compact?: boolean;
}) => (
  <div className={`flex w-full flex-col ${compact ? "gap-2" : "gap-3"}`}>
    <WeatherCardView report={report} field="hero" compact={compact} />
    <WeatherCardView report={report} field="conditions" compact={compact} />
    <div
      className={
        compact
          ? "grid grid-cols-2 gap-2"
          : "grid grid-cols-2 gap-3 lg:grid-cols-4"
      }
    >
      {METRIC_FIELDS.map((field) => (
        <WeatherCardView
          key={field}
          report={report}
          field={field}
          compact={compact}
        />
      ))}
    </div>
    <WeatherCardView report={report} field="hint" compact={compact} />
  </div>
);
