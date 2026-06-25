import type { FullItineraryDay, PlaceBrief, TripSketch } from "@/types";

export const MOCK_PLACES: PlaceBrief[] = [
  {
    id: "p1",
    title: "My Khe Beach",
    tagline: "Luxurious shore without feeling totally touristy",
    summary:
      "Morning swim before heat; rent umbrella on the sand if you stay past noon.",
    status: "starred",
  },
  {
    id: "p2",
    title: "Hai Van Pass",
    tagline: "Top Gear's best coastal road — two wheels before breakfast",
    summary:
      "Scooter day-one if comfortable; go early to beat tour buses and afternoon rain.",
    status: "starred",
  },
  {
    id: "p3",
    title: "Da Nang food scene",
    tagline: "Central Vietnam's culinary capital on a budget",
    summary:
      "Bánh xèo and seafood alley — plan dinners inland when beach spots get windy.",
    status: "new",
  },
];

export const MOCK_SKETCH: TripSketch = {
  title: "Here's What I'd Do: 3 Days in Da Nang",
  atAGlance:
    "Beach-first, food-heavy, relaxed pace. Mornings outdoors, afternoons flexible for rain, evenings along the river and local markets.",
  days: [
    {
      day: 1,
      label: "Beach + street food intro",
      stops: [
        {
          order: 1,
          place: "My Khe Beach",
          detail: "Morning — swim and coffee before 11am heat.",
        },
        {
          order: 2,
          place: "Seafood alley (Vo Nguyen Giap)",
          detail: "Late lunch; walkable from the beach.",
        },
        {
          order: 3,
          place: "Han River promenade",
          detail: "Evening stroll; Dragon Bridge show on weekend nights.",
        },
      ],
    },
    {
      day: 2,
      label: "Pass + peninsula views",
      stops: [
        {
          order: 1,
          place: "Hai Van Pass",
          detail: "Start by 7am — clearer views, cooler ride.",
        },
        {
          order: 2,
          place: "Son Tra Peninsula",
          detail: "Afternoon — Linh Ung Pagoda if skies stay clear.",
        },
      ],
    },
    {
      day: 3,
      label: "Culture + slow departure",
      stops: [
        {
          order: 1,
          place: "Marble Mountains",
          detail: "Morning caves before tour groups peak.",
        },
        {
          order: 2,
          place: "Local market + Mi Quang",
          detail: "Midday food crawl; pack light for airport transfer.",
        },
      ],
    },
  ],
  localTips: [
    "Late July: afternoon downpours ~2–4pm — plan beach for mornings.",
    "Dragon Bridge fire/water show is weekend evenings only.",
    "Scooter rental: check brakes and insist on helmet; avoid pass in heavy rain.",
    "Carry cash at smaller food stalls; cards not always accepted.",
  ],
  isStale: false,
};

export const MOCK_FULL_ITINERARY: FullItineraryDay[] = [
  {
    day: 1,
    morning: "Airport → hotel (My Khe area). Breakfast: Mi Quang.",
    afternoon: "My Khe Beach + seafood alley.",
    evening: "Han River walk; Dragon Bridge if weekend.",
  },
  {
    day: 2,
    morning: "Hai Van Pass by scooter (early start).",
    afternoon: "Son Tra — Linh Ung Pagoda.",
    evening: "Night market snacks near Han River.",
  },
  {
    day: 3,
    morning: "Marble Mountains caves.",
    afternoon: "Local market + last food crawl.",
    evening: "Transfer to airport.",
  },
];
