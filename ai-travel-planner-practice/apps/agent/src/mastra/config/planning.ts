/** Human-readable rule for agent instructions and tool schemas. */
export const STOPS_PER_DAY = 3;

export const PLACE_COUNT_RULE = `tripDays × ${STOPS_PER_DAY} + tripDays extra picks (min 4, max 36) — browse pool on Places tab`;

/** Route stops per day so every starred place fits across the trip (no omissions). */
export const stopsPerDayForStarred = (
  starredCount: number,
  tripDays: number,
): number => {
  const days: number = Math.max(1, Math.round(tripDays));
  const starred: number = Math.max(1, Math.round(starredCount));

  return Math.ceil(starred / days);
};

/** Place-card count: extra options on the Places tab beyond minimum route slots. */
export const suggestPlaceCount = (tripDays: number): number => {
  const days: number = Math.max(1, Math.round(tripDays));

  return Math.min(Math.max(days * STOPS_PER_DAY + days, 4), 36);
};
