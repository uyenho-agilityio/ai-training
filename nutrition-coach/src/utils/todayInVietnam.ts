const vietnamDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// Returns YYYY-MM-DD for the given instant, in Asia/Ho_Chi_Minh time.
export function todayInVietnam(now: Date) {
  return vietnamDate.format(now);
}
