"use client";

import { memo, useMemo, type ReactElement } from "react";

import {
  cn,
  formatTemperature,
  getWeatherIcon,
  getWeatherDetailItems,
} from "@/utils";
import { Card, Text } from "../commons";
import type { TemperatureUnit, WeatherData } from "@/types";

type WeatherCardProps = {
  weather: WeatherData;
  unit?: TemperatureUnit;
  className?: string;
};

const WeatherCardComponent = ({
  weather,
  unit = "C",
  className,
}: WeatherCardProps): ReactElement => {
  const WeatherIcon = getWeatherIcon(weather.condition);
  const details = useMemo(
    () => getWeatherDetailItems(weather, unit),
    [weather, unit],
  );

  return (
    <Card
      variant="secondary"
      className={cn(
        className ??
          "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        "border border-orange-200/80 bg-linear-to-r from-orange-50 to-amber-50 shadow-sm",
      )}
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <WeatherIcon size={24} />
          <Text size="sm" isBold>
            {weather.location}
          </Text>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {details.map((detail) => (
            <Text key={detail.id} as="span" size="xs" color="muted">
              {detail.label} {detail.value}
            </Text>
          ))}
        </div>
      </div>

      <div className="text-left sm:text-right">
        <Text size="lg" color="accent" isBold>
          {formatTemperature(weather.temp, unit)}
        </Text>
        <Text as="span" size="xs" color="muted" className="ml-2">
          {weather.condition}
        </Text>
      </div>
    </Card>
  );
};

export const WeatherCard = memo(WeatherCardComponent);
