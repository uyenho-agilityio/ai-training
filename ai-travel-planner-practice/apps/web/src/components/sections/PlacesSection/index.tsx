"use client";

import { memo, type ReactElement } from "react";

import type { PlaceBrief, PlaceFilter } from "@/types";
import { PLACE_FILTERS } from "@/constants";
import { PlaceCard } from "../../PlaceCard";
import { PlacesFilters } from "../../PlacesFilters";
import { Button, Text } from "../../commons";

type PlacesSectionProps = {
  places: PlaceBrief[];
  starredCount: number;
  isSketching: boolean;
  isPlanningInProgress: boolean;
  isSketchReady: boolean;
  planningMessage: string;
  sketchReadyMessage: string;
  onFilterChange: (filter: PlaceFilter) => void;
  onStar: (id: string) => void;
  onDismiss: (id: string) => void;
  onSketchFromStarred: () => void;
};

const PlacesSectionComponent = ({
  places,
  starredCount,
  isSketching,
  isPlanningInProgress,
  isSketchReady,
  planningMessage,
  sketchReadyMessage,
  onFilterChange,
  onStar,
  onDismiss,
  onSketchFromStarred,
}: PlacesSectionProps): ReactElement => (
  <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
    <PlacesFilters data={PLACE_FILTERS} onFilterChange={onFilterChange} />

    {isPlanningInProgress && (
      <Text
        size="xs"
        color="muted"
        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900"
      >
        {planningMessage}
      </Text>
    )}

    {isSketchReady && (
      <Text
        size="xs"
        color="muted"
        className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900"
      >
        {sketchReadyMessage}
      </Text>
    )}

    {!places?.length ? (
      <Text
        size="xs"
        color="muted"
        className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-medium"
      >
        No places in this filter. Ask in chat to research destinations.
      </Text>
    ) : (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {places?.map((place: PlaceBrief) => (
          <PlaceCard
            key={place.id}
            place={place}
            onStar={onStar}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    )}

    <Button
      variant="primary"
      size="lg"
      disabled={starredCount === 0 || isSketching}
      onClick={onSketchFromStarred}
    >
      {isSketching ? "Sketching…" : `Sketch from starred (${starredCount})`}
    </Button>
  </section>
);

export const PlacesSection = memo(PlacesSectionComponent);
