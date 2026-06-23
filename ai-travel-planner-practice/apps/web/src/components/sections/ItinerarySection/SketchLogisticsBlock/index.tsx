"use client";

import { memo, type ReactElement } from "react";

import { HOVER_BTN } from "../../styles";
import type { FlightData, HotelData } from "@/types";

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
      <h3 className="text-xs font-black uppercase tracking-wider text-orange-600">
        Logistics (from Book)
      </h3>

      <button
        type="button"
        onClick={onEditBookings}
        className={`text-xs font-bold text-orange-600 underline-offset-2 hover:underline ${HOVER_BTN}`}
      >
        {flight || hotel ? "Change →" : "Select →"}
      </button>
    </div>

    {flight || hotel ? (
      <ul className="space-y-2 text-sm font-semibold text-slate-700">
        {flight && (
          <li>
            ✈️ {flight.airline} · {flight.route} · {flight.time}
          </li>
        )}

        {hotel && (
          <li>
            🏨 {hotel.name} · ⭐ {hotel.rating}
          </li>
        )}
      </ul>
    ) : (
      <p className="text-xs font-medium text-slate-500">
        No flight or hotel selected yet. Use Select to open Book.
      </p>
    )}
  </div>
);

export const SketchLogisticsBlock = memo(SketchLogisticsBlockComponent);
