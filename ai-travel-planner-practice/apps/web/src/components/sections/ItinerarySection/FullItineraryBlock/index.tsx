"use client";

import { memo, type ReactElement } from "react";

import { Heading, Text } from "../../../commons";
import type { FullItineraryDay } from "@/types";

type FullItineraryBlockProps = {
  days: FullItineraryDay[];
};

const FullItineraryBlockComponent = ({
  days,
}: FullItineraryBlockProps): ReactElement => (
  <div className="space-y-4 rounded-xl border-2 border-orange-200 bg-white p-4">
    <Heading variant="h3" size="xs" className="text-sm text-slate-800">
      Full itinerary (generated on canvas)
    </Heading>

    {days.map((day: FullItineraryDay) => (
      <div
        key={day.day}
        className="rounded-lg border border-slate-200 bg-white p-3"
      >
        <Text
          isBold
          size="xs"
          color="accent"
          className="text-xs uppercase text-orange-600"
        >
          Day {day.day}
        </Text>

        <div className="mt-2 space-y-1.5 text-xs font-semibold text-slate-700">
          <Text
            as="p"
            size="xs"
            className="text-xs font-semibold text-slate-700"
          >
            <Text
              as="span"
              size="xs"
              color="accent"
              className="text-orange-600"
            >
              Morning —
            </Text>{" "}
            {day.morning}
          </Text>

          <Text
            as="p"
            size="xs"
            className="text-xs font-semibold text-slate-700"
          >
            <Text
              as="span"
              size="xs"
              color="accent"
              className="text-orange-600"
            >
              Afternoon —
            </Text>{" "}
            {day.afternoon}
          </Text>

          <Text
            as="p"
            size="xs"
            className="text-xs font-semibold text-slate-700"
          >
            <Text
              as="span"
              size="xs"
              color="accent"
              className="text-orange-600"
            >
              Evening —
            </Text>{" "}
            {day.evening}
          </Text>
        </div>
      </div>
    ))}
  </div>
);

export const FullItineraryBlock = memo(FullItineraryBlockComponent);
