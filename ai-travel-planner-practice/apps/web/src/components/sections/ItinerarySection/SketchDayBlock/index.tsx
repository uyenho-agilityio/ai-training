"use client";

import { memo, type ReactElement } from "react";

import { HOVER_BTN } from "../../styles";
import type { RouteStop, SketchDay } from "@/types";

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
    <button
      type="button"
      onClick={() => onToggle(day.day)}
      className={`flex w-full items-center justify-between bg-white px-4 py-3 text-left hover:bg-orange-50/50 ${HOVER_BTN}`}
    >
      <span className="text-sm font-black text-slate-800">
        Day {day.day} — {day.label}
      </span>

      <span className="text-xs font-bold text-orange-600">
        {isExpanded ? "▲" : "▼"}
      </span>
    </button>

    {isExpanded && (
      <div className="space-y-2 border-t border-slate-100 bg-white p-4">
        {day.stops.map((stop: RouteStop) => (
          <div
            key={`${day.day}-${stop.order}`}
            className="flex gap-3 rounded-lg border border-slate-100 bg-white p-3 transition-colors hover:border-orange-200 hover:bg-orange-50/30"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 text-xs font-black text-white">
              {stop.order}
            </span>

            <div>
              <p className="text-sm font-bold text-slate-800">{stop.place}</p>

              <p className="text-xs font-medium text-slate-500">
                {stop.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const SketchDayBlock = memo(SketchDayBlockComponent);
