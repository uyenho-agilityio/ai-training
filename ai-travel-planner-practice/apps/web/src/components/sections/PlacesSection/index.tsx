"use client";

import { memo, type ReactElement } from "react";

import type { PlaceBrief, PlaceFilter } from "@/types";
import { PLACE_FILTERS } from "@/constants";
import { PlaceCard } from "../../PlaceCard";
import { PlacesFilters } from "../../PlacesFilters";
import { HOVER_BTN } from "../styles";

type PlacesSectionProps = {
  places: PlaceBrief[];
  starredCount: number;
  onFilterChange: (filter: PlaceFilter) => void;
  onStar: (id: string) => void;
  onDismiss: (id: string) => void;
  onSketchFromStarred: () => void;
};

const PlacesSectionComponent = ({
  places,
  starredCount,
  onFilterChange,
  onStar,
  onDismiss,
  onSketchFromStarred,
}: PlacesSectionProps): ReactElement => (
  <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
    <PlacesFilters data={PLACE_FILTERS} onFilterChange={onFilterChange} />

    {!places?.length ? (
      <p className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
        No places in this filter. Ask in chat to research destinations.
      </p>
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

    <button
      type="button"
      disabled={starredCount === 0}
      onClick={onSketchFromStarred}
      className={`w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-bold text-white shadow-md hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-40 ${HOVER_BTN}`}
    >
      Sketch from starred ({starredCount})
    </button>
  </section>
);

export const PlacesSection = memo(PlacesSectionComponent);
