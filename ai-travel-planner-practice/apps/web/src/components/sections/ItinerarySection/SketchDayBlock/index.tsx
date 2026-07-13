"use client";

import { memo, type ReactElement } from "react";

import { Button, Text } from "../../../commons";
import type { RouteStop, SketchDay } from "@/types";
import { ChevronDownIcon, ChevronUpIcon } from "@/icons";

type SketchDayBlockProps = {
  day: SketchDay;
  isExpanded: boolean;
  onToggle: (dayNum: number) => void;
};

const SketchDayBlockComponent = ({
  day,
  isExpanded,
  onToggle,
}: SketchDayBlockProps): ReactElement => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <Button
      variant="ghost"
      size="md"
      onClick={() => onToggle(day.day)}
      className="h-auto w-full justify-between rounded-none bg-white px-4 py-3 text-left font-normal hover:bg-orange-50/50 hover:no-underline"
    >
      <Text as="span" size="xs" isBold className="text-sm text-slate-800">
        Day {day.day} — {day.label}
      </Text>

      <Text
        as="span"
        size="xs"
        color="accent"
        isBold
        className="inline-flex items-center text-xs"
      >
        {isExpanded ? (
          <ChevronUpIcon size={12} />
        ) : (
          <ChevronDownIcon size={12} />
        )}
      </Text>
    </Button>

    {isExpanded && (
      <div className="space-y-2 border-t border-slate-100 bg-white p-4">
        {day.stops.map((stop: RouteStop) => (
          <div
            key={`${day.day}-${stop.order}`}
            className="flex gap-3 rounded-lg border border-slate-100 bg-white p-3 transition-colors hover:border-orange-200 hover:bg-orange-50/30"
          >
            <Text
              as="span"
              size="xs"
              isBold
              color="inverse"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-orange-500 to-amber-400 text-xs"
            >
              {stop.order}
            </Text>

            <div>
              <Text size="xs" isBold className="text-sm text-slate-800">
                {stop.place}
              </Text>

              <Text size="xs" color="muted" className="text-xs font-medium">
                {stop.detail}
              </Text>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const SketchDayBlock = memo(SketchDayBlockComponent);
