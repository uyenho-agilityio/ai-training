"use client";

import { memo, useCallback, type ReactElement } from "react";

import { ChevronDownIcon, ChevronUpIcon } from "@/icons";
import { Button, Heading, Text } from "../commons";
import type { SketchDay } from "@/types";
import {
  tripAccordionBodyClasses,
  tripAccordionClasses,
  tripAccordionOrderBadgeClasses,
  tripAccordionStopClasses,
  tripAccordionToggleClasses,
} from "./styles";

type TripAccordionProps = {
  day: SketchDay;
  isExpanded: boolean;
  onToggle: (dayNum: number) => void;
};

const TripAccordionComponent = ({
  day,
  isExpanded,
  onToggle,
}: TripAccordionProps): ReactElement => {
  const handleToggle = useCallback((): void => {
    onToggle(day.day);
  }, [day.day, onToggle]);

  return (
    <div className={tripAccordionClasses}>
      <Button
        variant="secondary"
        className={tripAccordionToggleClasses}
        onClick={handleToggle}
      >
        <Heading variant="h3" size="sm">
          Day {day.day} — {day.label}
        </Heading>

        {isExpanded ? (
          <ChevronUpIcon size={12} />
        ) : (
          <ChevronDownIcon size={12} />
        )}
      </Button>

      {isExpanded && (
        <div className={tripAccordionBodyClasses}>
          {day.stops.map((stop) => (
            <div
              key={`${day.day}-${stop.order}`}
              className={tripAccordionStopClasses}
            >
              <span className={tripAccordionOrderBadgeClasses}>
                {stop.order}
              </span>

              <div>
                <Text size="sm" isBold>
                  {stop.place}
                </Text>

                <Text size="xs" color="muted" className="font-medium">
                  {stop.detail}
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const TripAccordion = memo(TripAccordionComponent);
