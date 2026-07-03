"use client";

import { memo, type ReactElement } from "react";

import { Heading, Text } from "../../../commons";
import type {
  FullItinerary,
  FullItineraryDay,
  FullItinerarySegment,
} from "@/types";

type FullItineraryBlockProps = {
  itinerary: FullItinerary;
};

const FullItineraryBlockComponent = ({
  itinerary,
}: FullItineraryBlockProps): ReactElement => (
  <div className="space-y-4 rounded-xl border-2 border-orange-200 bg-orange-50/30 p-4">
    <div>
      <Heading variant="h3" size="xs" className="text-sm text-slate-800">
        {itinerary.title}
      </Heading>

      <Text
        size="xs"
        className="mt-2 text-sm font-medium leading-relaxed text-slate-700"
      >
        {itinerary.summary}
      </Text>
    </div>

    {itinerary.days.map((day: FullItineraryDay) => (
      <div
        key={day.day}
        className="rounded-lg border border-slate-200 bg-white p-3"
      >
        <Text isBold size="xs" className="text-sm text-slate-800">
          Day {day.day} — {day.label}
        </Text>

        <div className="mt-3 space-y-3">
          {day.segments.map((segment: FullItinerarySegment) => (
            <div
              key={`${day.day}-${segment.order}`}
              className="border-l-2 border-orange-300 pl-3"
            >
              <Text
                size="xs"
                color="accent"
                isBold
                className="text-xs uppercase tracking-wide text-orange-600"
              >
                {segment.timeLabel}
              </Text>

              <Text
                size="xs"
                className="mt-1 text-sm font-medium leading-relaxed text-slate-800"
              >
                {segment.activity}
              </Text>

              {segment.logistics ? (
                <Text
                  size="xs"
                  color="muted"
                  className="mt-1 text-xs font-medium leading-relaxed"
                >
                  {segment.logistics}
                </Text>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const FullItineraryBlock = memo(FullItineraryBlockComponent);
