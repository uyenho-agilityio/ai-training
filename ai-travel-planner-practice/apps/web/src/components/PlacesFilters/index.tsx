"use client";

import {
  memo,
  useCallback,
  useState,
  type MouseEvent,
  type ReactElement,
} from "react";

import { cn } from "@/utils";
import { Button } from "../commons";
import type { PlaceFilter } from "@/types";

type PlacesFiltersProps = {
  data: PlaceFilter[];
  className?: string;
  onFilterChange: (filter: PlaceFilter) => void;
};

const PlacesFiltersComponent = ({
  data = [],
  className,
  onFilterChange,
}: PlacesFiltersProps): ReactElement => {
  const [activeFilter, setActiveFilter] = useState<PlaceFilter>(data[0]!);

  const handleFilterClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>): void => {
      const filterId = event.currentTarget?.dataset?.filterId;

      if (!filterId) {
        return;
      }

      const nextFilter = filterId as PlaceFilter;
      setActiveFilter(nextFilter);
      onFilterChange(nextFilter);
    },
    [onFilterChange],
  );

  return (
    <div className={className ?? "flex flex-wrap gap-2"}>
      {data?.map((filter: PlaceFilter) => (
        <Button
          key={filter}
          data-filter-id={filter}
          size="xs"
          className={cn("rounded-full px-3 py-1.5 capitalize")}
          variant={activeFilter === filter ? "primary" : "outline"}
          onClick={handleFilterClick}
        >
          {filter}
        </Button>
      ))}
    </div>
  );
};

export const PlacesFilters = memo(PlacesFiltersComponent);
