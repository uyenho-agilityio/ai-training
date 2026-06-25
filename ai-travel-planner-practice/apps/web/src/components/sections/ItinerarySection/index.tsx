"use client";

import { memo, type ReactElement } from "react";

import { HOVER_BTN } from "../styles";
import type {
  FlightData,
  FullItineraryDay,
  HotelData,
  ItineraryPhase,
  SketchDay,
  TripSketch,
} from "@/types";
import { FullItineraryBlock } from "./FullItineraryBlock";
import { SketchDayBlock } from "./SketchDayBlock";
import { SketchLogisticsBlock } from "./SketchLogisticsBlock";

type ItinerarySectionProps = {
  sketch: TripSketch;
  expandedDays: number[];
  itineraryPhase: ItineraryPhase;
  fullItineraryDays: FullItineraryDay[];
  selectedFlight: FlightData | null;
  selectedHotel: HotelData | null;
  onToggleDay: (dayNum: number) => void;
  onRefreshSketch: () => void;
  onGenerateItinerary: () => void;
  onEditBookings: () => void;
};

const ItinerarySectionComponent = ({
  sketch,
  expandedDays,
  itineraryPhase,
  fullItineraryDays,
  selectedFlight,
  selectedHotel,
  onToggleDay,
  onRefreshSketch,
  onGenerateItinerary,
  onEditBookings,
}: ItinerarySectionProps): ReactElement => (
  <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <div>
      <h2 className="text-base font-black text-slate-800 sm:text-lg">
        {sketch?.title}
      </h2>

      <p className="mt-1 text-xs font-medium text-slate-500">
        Your trip, sketched out
      </p>
    </div>

    {sketch?.isStale && (
      <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-amber-900">
          Things changed — new briefs or chat since this sketch. Want a fresh
          take?
        </p>

        <button
          type="button"
          onClick={onRefreshSketch}
          className={`shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 ${HOVER_BTN}`}
        >
          Refresh sketch
        </button>
      </div>
    )}

    <SketchLogisticsBlock
      flight={selectedFlight}
      hotel={selectedHotel}
      onEditBookings={onEditBookings}
    />

    <div>
      <h3 className="text-xs font-black uppercase tracking-wider text-orange-600">
        At a glance
      </h3>

      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
        {sketch?.atAGlance}
      </p>
    </div>

    <div className="space-y-2">
      <h3 className="text-xs font-black uppercase tracking-wider text-orange-600">
        Day by day
      </h3>

      {sketch?.days.map((day: SketchDay) => (
        <SketchDayBlock
          key={day.day}
          day={day}
          isExpanded={expandedDays.includes(day.day)}
          onToggle={onToggleDay}
        />
      ))}
    </div>

    <div>
      <h3 className="text-xs font-black uppercase tracking-wider text-orange-600">
        Local tips ({sketch?.localTips.length})
      </h3>

      <ul className="mt-2 space-y-1.5">
        {sketch?.localTips.map((tip: string, index: number) => (
          <li
            key={index}
            className="flex gap-2 text-xs font-semibold text-slate-700"
          >
            <span className="text-orange-500">•</span>

            {tip}
          </li>
        ))}
      </ul>
    </div>

    {itineraryPhase === "full" && (
      <FullItineraryBlock days={fullItineraryDays} />
    )}

    <button
      type="button"
      disabled={itineraryPhase === "generating"}
      onClick={onGenerateItinerary}
      className={`w-full rounded-xl border-2 border-dashed border-orange-300 bg-white py-3 text-sm font-bold text-orange-600 hover:border-orange-400 hover:bg-orange-50 disabled:cursor-wait disabled:opacity-70 ${HOVER_BTN}`}
    >
      {itineraryPhase === "generating"
        ? "Generating…"
        : itineraryPhase === "full"
          ? "Regenerate"
          : "Let's make it real"}
    </button>

    {itineraryPhase === "generating" && (
      <p className="text-center text-xs font-medium text-slate-500">
        (Draft demo: agent would stream state → canvas updates below, not only
        chat text.)
      </p>
    )}
  </section>
);

export const ItinerarySection = memo(ItinerarySectionComponent);
