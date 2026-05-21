const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Valid YYYY-MM-DD only; ignores "", null, and invalid strings from tool payloads. */
export const parseIsoDate = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return ISO_DATE.test(trimmed) ? trimmed : undefined;
};

export const todayIsoDate = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const isDueToday = (dueDate: string | undefined, status: string) => {
  const d = parseIsoDate(dueDate);
  if (!d || status === "done") return false;
  return d === todayIsoDate();
};

export const isOverdue = (dueDate: string | undefined, status: string) => {
  const d = parseIsoDate(dueDate);
  if (!d || status === "done") return false;
  return d < todayIsoDate();
};

export const isDueHighlighted = (
  dueDate: string | undefined,
  status: string
) => isDueToday(dueDate, status) || isOverdue(dueDate, status);

export const toOptionalDate = (value: string) =>
  value.trim() === "" ? undefined : value;

/** e.g. "May 1" */
export const formatShortDate = (iso: string | undefined) => {
  const parsed = parseIsoDate(iso);
  if (!parsed) return null;
  const d = new Date(`${parsed}T12:00:00`);
  if (Number.isNaN(d.getTime())) return parsed;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
