"use client";

import { memo, type ReactElement } from "react";

import { ClockIcon, StarIcon } from "@/icons";
import { cn } from "@/utils";
import { Button, Card, Heading, Text } from "../commons";
import type { BookingCardProps, FlightData, HotelData } from "@/types";
import {
  bookingCardContainerClasses,
  bookingCardFooterClasses,
  bookingCardSelectedClasses,
} from "./styles";
import { HOVER_CARD } from "../commons/Card/styles";

const FlightCardContent = ({
  flight,
}: {
  flight: FlightData;
}): ReactElement => (
  <>
    <Text size="xs" isBold className="text-slate-400">
      {flight.airline}
    </Text>

    <Heading variant="h4" size="md" className="mt-0.5">
      {flight.route}
    </Heading>

    <Text
      as="div"
      size="xs"
      color="muted"
      className="mt-1 flex items-center gap-1.5 font-medium"
    >
      <ClockIcon size={16} />
      {flight.time}
    </Text>
  </>
);

const HotelCardContent = ({ hotel }: { hotel: HotelData }): ReactElement => (
  <>
    <Heading variant="h4" size="md">
      {hotel.name}
    </Heading>

    <Text
      as="div"
      size="xs"
      isBold
      className="mt-1 flex items-center gap-1.5 text-amber-500"
    >
      <StarIcon size={16} />
      {hotel.rating} / 5.0
    </Text>
  </>
);

const BookingCardComponent = ({
  type,
  item,
  isSelected,
  actionLabel = "Select",
  onSelect,
}: BookingCardProps): ReactElement => {
  const price: string = item.price;

  return (
    <Card
      variant="primary"
      padding="lg"
      className={cn(
        bookingCardContainerClasses,
        isSelected ? bookingCardSelectedClasses : HOVER_CARD,
      )}
    >
      {type === "flight" ? (
        <FlightCardContent flight={item} />
      ) : (
        <HotelCardContent hotel={item} />
      )}

      <div className={bookingCardFooterClasses}>
        <Text size="sm" color="accent" isBold>
          {price}
        </Text>

        <Button
          size="sm"
          variant={isSelected ? "secondary" : "primary"}
          className={cn(
            isSelected && "bg-slate-600 text-white hover:bg-slate-700",
          )}
          onClick={onSelect}
        >
          {isSelected ? "Selected" : actionLabel}
        </Button>
      </div>
    </Card>
  );
};

export const BookingCard = memo(BookingCardComponent);
