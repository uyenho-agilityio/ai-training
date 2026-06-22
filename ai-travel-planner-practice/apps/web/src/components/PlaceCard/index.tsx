"use client";

import { memo, type ReactElement } from "react";

import { CloseIcon, StarFilledIcon, StarOutlineIcon } from "@/icons";
import { cn } from "@/utils";
import { Button, Card, Heading, Text } from "../commons";
import { HOVER_CARD } from "../commons/Card/styles";
import type { PlaceBrief } from "@/types";

type PlaceCardProps = {
  place: PlaceBrief;
  onStar: (id: string) => void;
  onDismiss: (id: string) => void;
};

const PlaceCardComponent = ({
  place,
  onStar,
  onDismiss,
}: PlaceCardProps): ReactElement => {
  const isStarred: boolean = place.status === "starred";
  const isDismissed: boolean = place.status === "dismissed";

  return (
    <Card
      variant="primary"
      padding="lg"
      className={cn(
        !isDismissed && HOVER_CARD,
        isDismissed && "cursor-default opacity-60",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <Heading variant="h4" size="md">
          {place.title}
        </Heading>

        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            aria-label={isStarred ? "Unstar place" : "Star place"}
            variant="secondary"
            size="xs"
            className={cn(
              isStarred && "bg-amber-100 text-amber-700 hover:bg-amber-200",
            )}
            onClick={() => onStar(place.id)}
          >
            {isStarred ? (
              <StarFilledIcon size={16} />
            ) : (
              <StarOutlineIcon size={16} />
            )}
          </Button>

          <Button
            type="button"
            aria-label="Dismiss place"
            variant="secondary"
            size="xs"
            onClick={() => onDismiss(place.id)}
          >
            <CloseIcon size={16} />
          </Button>
        </div>
      </div>

      <Text size="xs" color="accent" isBold>
        {place.tagline}
      </Text>

      <Text
        size="xs"
        className="mt-2 font-medium leading-relaxed text-slate-600"
      >
        {place.summary}
      </Text>
    </Card>
  );
};

export const PlaceCard = memo(PlaceCardComponent);
