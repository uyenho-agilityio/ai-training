"use client";

import { memo, type ReactElement } from "react";

import { HotelIcon, PlaneIcon, StarIcon } from "@/icons";
import type { FlightData, HotelData } from "@/types";
import { Button, Heading, Text } from "../../../commons";

type SketchLogisticsBlockProps = {
  flight: FlightData | null;
  hotel: HotelData | null;
  onEditBookings: () => void;
};

const SketchLogisticsBlockComponent = ({
  flight,
  hotel,
  onEditBookings,
}: SketchLogisticsBlockProps): ReactElement => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <Heading
        variant="h3"
        size="xs"
        color="accent"
        className="text-xs uppercase tracking-wider"
      >
        Logistics (from Book)
      </Heading>

      <Button
        variant="ghost"
        size="xs"
        onClick={onEditBookings}
        className="font-bold"
      >
        {flight || hotel ? "Change →" : "Select →"}
      </Button>
    </div>

    {flight || hotel ? (
      <ul className="space-y-2 text-sm font-semibold text-slate-700">
        {flight && (
          <li className="flex items-center gap-1.5">
            <PlaneIcon size={14} />
            <span>
              {flight.airline} · {flight.route} · {flight.time}
            </span>
          </li>
        )}

        {hotel && (
          <li className="flex items-center gap-1.5">
            <HotelIcon size={14} />
            <span className="inline-flex items-center gap-1">
              {hotel.name} · <StarIcon size={14} /> {hotel.rating}
            </span>
          </li>
        )}
      </ul>
    ) : (
      <Text size="xs" color="muted" className="text-xs font-medium">
        No flight or hotel selected yet. Use Select to open Book.
      </Text>
    )}
  </div>
);

export const SketchLogisticsBlock = memo(SketchLogisticsBlockComponent);
