"use client";

import { memo, type ReactElement } from "react";

import { HotelIcon, PlaneIcon } from "@/icons";
import { BookingCard } from "../../BookingCard";
import { Button, Heading, Text } from "../../commons";
import type { FlightData, HotelData } from "@/types";
import {
  BOOK_EMPTY_FLIGHTS_MESSAGE,
  BOOK_EMPTY_HOTELS_MESSAGE,
} from "@/constants";

type BookSectionProps = {
  flights: FlightData[];
  hotels: HotelData[];
  selectedFlightId: string | null;
  selectedHotelId: string | null;
  onSelectFlight: (id: string) => void;
  onSelectHotel: (id: string) => void;
  onViewSketch: () => void;
};

const BookSectionComponent = ({
  flights,
  hotels,
  selectedFlightId,
  selectedHotelId,
  onSelectFlight,
  onSelectHotel,
  onViewSketch,
}: BookSectionProps): ReactElement => (
  <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
    <Text as="p" size="xs" color="muted" className="text-xs font-medium">
      Select flight & hotel — choices sync to{" "}
      <Button
        variant="ghost"
        size="xs"
        onClick={onViewSketch}
        className="font-bold"
      >
        Logistics on Itinerary
      </Button>
    </Text>

    <div className="space-y-3">
      <Heading
        variant="h3"
        size="xs"
        color="muted"
        className="flex items-center gap-1.5 text-sm uppercase tracking-wider"
      >
        <PlaneIcon size={14} />
        Flights
      </Heading>

      {!flights?.length ? (
        <Text size="xs" color="muted" className="font-medium">
          {BOOK_EMPTY_FLIGHTS_MESSAGE}
        </Text>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {flights?.map((flight: FlightData) => (
            <BookingCard
              key={flight.id}
              type="flight"
              item={flight}
              isSelected={selectedFlightId === flight.id}
              onSelect={() => onSelectFlight(flight.id)}
            />
          ))}
        </div>
      )}
    </div>

    <div className="space-y-3">
      <Heading
        variant="h3"
        size="xs"
        color="muted"
        className="flex items-center gap-1.5 text-sm uppercase tracking-wider"
      >
        <HotelIcon size={14} />
        Hotels
      </Heading>

      {!hotels?.length ? (
        <Text size="xs" color="muted" className="font-medium">
          {BOOK_EMPTY_HOTELS_MESSAGE}
        </Text>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {hotels.map((hotel: HotelData) => (
            <BookingCard
              key={hotel.id}
              type="hotel"
              item={hotel}
              isSelected={selectedHotelId === hotel.id}
              onSelect={() => onSelectHotel(hotel.id)}
            />
          ))}
        </div>
      )}
    </div>
  </section>
);

export const BookSection = memo(BookSectionComponent);
