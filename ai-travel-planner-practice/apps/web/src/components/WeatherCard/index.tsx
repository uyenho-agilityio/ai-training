"use client";

import { memo, useMemo, type ReactElement } from "react";

import { cn, formatTemperature, getWeatherIcon } from "@/utils";
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
  const WeatherIcon = useMemo(
    () => getWeatherIcon(weather.condition),
    [weather.condition],
  );

  const displayTemp = useMemo(
    () => formatTemperature(weather.temp, unit),
    [weather.temp, unit],
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
      <div className="flex items-center gap-2">
        <WeatherIcon size={22} />
        <Text size="sm" className="font-semibold">
          {weather.location}
        </Text>
      </div>

      <div className="text-left sm:text-right">
        <Text size="lg" color="accent" isBold>
          {displayTemp}
        </Text>
        <Text as="span" size="xs" color="muted" className="ml-2 font-medium">
          {weather.condition}
        </Text>
      </div>
    </Card>
  );
};

export const WeatherCard = memo(WeatherCardComponent);
