"use client";

import { memo, type ReactElement } from "react";

import { BookingCard } from "../../BookingCard";
import { HOVER_BTN } from "../styles";
import type { FlightData, HotelData } from "@/types";

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
    <p className="text-xs font-medium text-slate-500">
      Select flight & hotel — choices sync to{" "}
      <button
        type="button"
        onClick={onViewSketch}
        className={`font-bold text-orange-600 underline-offset-2 hover:underline ${HOVER_BTN}`}
      >
        Logistics on Itinerary
      </button>
      .
    </p>

    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
        ✈️ Flights
      </h3>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {flights.map((flight: FlightData) => (
          <BookingCard
            key={flight.id}
            type="flight"
            item={flight}
            isSelected={selectedFlightId === flight.id}
            onSelect={() => onSelectFlight(flight.id)}
          />
        ))}
      </div>
    </div>

    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
        🏨 Hotels
      </h3>

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
    </div>
  </section>
);

export const BookSection = memo(BookSectionComponent);
