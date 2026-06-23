"use client";

import { memo, type ReactElement } from "react";

import type { FullItineraryDay } from "@/types";

type FullItineraryBlockProps = {
  days: FullItineraryDay[];
};

const FullItineraryBlockComponent = ({
  days,
}: FullItineraryBlockProps): ReactElement => (
  <div className="space-y-4 rounded-xl border-2 border-orange-200 bg-white p-4">
    <h3 className="text-sm font-black text-slate-800">
      Full itinerary (generated on canvas)
    </h3>

    {days.map((day: FullItineraryDay) => (
      <div
        key={day.day}
        className="rounded-lg border border-slate-200 bg-white p-3"
      >
        <p className="text-xs font-black uppercase text-orange-600">
          Day {day.day}
        </p>

        <div className="mt-2 space-y-1.5 text-xs font-semibold text-slate-700">
          <p>
            <span className="text-orange-600">Morning —</span> {day.morning}
          </p>

          <p>
            <span className="text-orange-600">Afternoon —</span> {day.afternoon}
          </p>

          <p>
            <span className="text-orange-600">Evening —</span> {day.evening}
          </p>
        </div>
      </div>
    ))}
  </div>
);

export const FullItineraryBlock = memo(FullItineraryBlockComponent);
