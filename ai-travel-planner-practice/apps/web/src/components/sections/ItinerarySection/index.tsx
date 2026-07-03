"use client";

import { memo, type ReactElement } from "react";

import type {
  FlightData,
  FullItinerary,
  HotelData,
  ItineraryPhase,
  SketchDay,
  TripSketch,
} from "@/types";
import { FullItineraryBlock } from "./FullItineraryBlock";
import { SketchDayBlock } from "./SketchDayBlock";
import { SketchLogisticsBlock } from "./SketchLogisticsBlock";
import { Button, Heading, Text } from "../../commons";

type ItinerarySectionProps = {
  sketch: TripSketch;
  expandedDays: number[];
  itineraryPhase: ItineraryPhase;
  fullItinerary: FullItinerary | null;
  selectedFlight: FlightData | null;
  selectedHotel: HotelData | null;
  isReady: boolean;
  isGenerating: boolean;
  disabledReason?: string;
  onToggleDay: (dayNum: number) => void;
  onRefreshSketch: () => void;
  onGenerateItinerary: () => void;
  onEditBookings: () => void;
};

const ItinerarySectionComponent = ({
  sketch,
  expandedDays,
  itineraryPhase,
  fullItinerary,
  selectedFlight,
  selectedHotel,
  isReady,
  isGenerating,
  disabledReason,
  onToggleDay,
  onRefreshSketch,
  onGenerateItinerary,
  onEditBookings,
}: ItinerarySectionProps): ReactElement => {
  const hasSketchContent: boolean = (sketch?.days.length ?? 0) > 0;
  const isGenerateDisabled: boolean =
    isGenerating || !isReady || itineraryPhase === "generating";

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div>
        <Heading variant="h2" size="sm" className="text-base sm:text-lg">
          {sketch?.title}
        </Heading>

        <Text size="xs" color="muted" className="mt-1 text-xs font-medium">
          Your trip, sketched out
        </Text>
      </div>

      {sketch?.isStale && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <Text size="xs" className="text-xs font-semibold text-amber-900">
            Things changed — new briefs or chat since this sketch. Want a fresh
            take?
          </Text>

          <Button
            variant="primary"
            size="sm"
            onClick={onRefreshSketch}
            className="shrink-0 bg-amber-600 from-amber-600 to-amber-600 shadow-none hover:from-amber-700 hover:to-amber-700"
          >
            Refresh sketch
          </Button>
        </div>
      )}

      <SketchLogisticsBlock
        flight={selectedFlight}
        hotel={selectedHotel}
        onEditBookings={onEditBookings}
      />

      {!hasSketchContent ? (
        <Text
          size="xs"
          color="muted"
          className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-medium"
        >
          No itinerary sketch yet. Star places or ask in chat to build a
          day-by-day plan.
        </Text>
      ) : (
        <>
          <div>
            <Heading
              variant="h3"
              size="xs"
              color="accent"
              className="text-xs uppercase tracking-wider"
            >
              At a glance
            </Heading>

            <Text
              size="xs"
              className="mt-2 text-sm font-medium leading-relaxed text-slate-700"
            >
              {sketch?.atAGlance}
            </Text>
          </div>

          <div className="space-y-2">
            <Heading
              variant="h3"
              size="xs"
              color="accent"
              className="text-xs uppercase tracking-wider"
            >
              Day by day
            </Heading>

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
            <Heading
              variant="h3"
              size="xs"
              color="accent"
              className="text-xs uppercase tracking-wider"
            >
              Local tips ({sketch?.localTips.length})
            </Heading>

            <ul className="mt-2 space-y-1.5">
              {sketch?.localTips.map((tip: string, index: number) => (
                <Text
                  key={index}
                  as="li"
                  size="xs"
                  className="flex gap-2 text-xs font-semibold text-slate-700"
                >
                  <Text
                    as="span"
                    size="xs"
                    color="accent"
                    className="text-orange-500"
                  >
                    •
                  </Text>

                  {tip}
                </Text>
              ))}
            </ul>
          </div>
        </>
      )}

      {itineraryPhase === "full" && fullItinerary ? (
        <FullItineraryBlock itinerary={fullItinerary} />
      ) : null}

      <Button
        variant="outline"
        size="lg"
        disabled={isGenerateDisabled}
        title={disabledReason}
        onClick={onGenerateItinerary}
        className="border-2 border-dashed border-orange-300 text-orange-600 ring-0 hover:border-orange-400 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating || itineraryPhase === "generating"
          ? "Generating…"
          : itineraryPhase === "full"
            ? "Regenerate"
            : "Let's make it real"}
      </Button>

      {(isGenerating || itineraryPhase === "generating") && (
        <Text
          size="xs"
          color="muted"
          className="text-center text-xs font-medium"
        >
          Building your full itinerary on the canvas…
        </Text>
      )}

      {!isReady && !isGenerating && itineraryPhase !== "generating" && (
        <Text
          size="xs"
          color="muted"
          className="text-center text-xs font-medium"
        >
          {disabledReason}
        </Text>
      )}
    </section>
  );
};

export const ItinerarySection = memo(ItinerarySectionComponent);
