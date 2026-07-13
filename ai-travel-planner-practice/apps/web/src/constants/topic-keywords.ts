/**
 * Travel-topic vocabulary by locale (intents & domain words — not place names).
 * Terms are matched after {@link normalizeTopicText} so users can type with or without accents.
 * Extend this map when adding locales; the agent handles world locations after the gate.
 */
export const TRAVEL_TOPIC_TERMS_BY_LOCALE: Readonly<
  Record<string, readonly string[]>
> = {
  intl: [
    "hotel",
    "hostel",
    "resort",
    "taxi",
    "metro",
    "visa",
    "passport",
    "tour",
    "booking",
    "itinerary",
    "airport",
    "check in",
    "check out",
    "check-in",
    "check-out",
    "go to",
    "going to",
    "travel to",
    "traveling to",
    "fly to",
    "flying to",
    "head to",
    "trip to",
  ],
  en: [
    "trip",
    "travel",
    "traveling",
    "vacation",
    "holiday",
    "getaway",
    "flight",
    "flights",
    "airfare",
    "airline",
    "ticket",
    "tickets",
    "fly",
    "flying",
    "accommodation",
    "stay",
    "weather",
    "forecast",
    "place",
    "places",
    "spot",
    "spots",
    "attraction",
    "attractions",
    "sightseeing",
    "landmark",
    "landmarks",
    "visit",
    "visiting",
    "tourist",
    "tourism",
    "explore",
    "exploring",
    "departure",
    "arrival",
    "sketch",
    "starred",
    "canvas",
    "local tips",
    "day by day",
    "route",
    "routes",
    "schedule",
    "beach",
    "beaches",
    "restaurant",
    "museum",
    "hiking",
    "adventure",
    "activity",
    "activities",
    "plan",
    "planning",
    "suggest",
    "suggestion",
    "recommend",
    "recommendation",
    "destination",
    "what to see",
    "what to do",
    "what to visit",
    "where to go",
    "where to stay",
    "where to eat",
    "book",
    "reserve",
    "reservation",
  ],
  es: [
    "viaje",
    "viajar",
    "vacaciones",
    "vuelo",
    "vuelos",
    "hoteles",
    "alojamiento",
    "reserva",
    "reservar",
    "turismo",
    "turista",
    "itinerario",
    "destino",
    "clima",
    "tiempo",
    "lugar",
    "lugares",
    "visitar",
    "planificar",
    "playa",
    "playas",
    "museo",
    "aventura",
    "actividad",
    "actividades",
    "que ver",
    "que hacer",
    "donde ir",
    "donde quedarse",
    "donde comer",
    "vuelo",
    "aeropuerto",
    "salida",
    "llegada",
    "ir a",
    "viajar a",
  ],
  vi: [
    "du lich",
    "chuyen di",
    "ky nghi",
    "ve may bay",
    "chuyen bay",
    "khach san",
    "dat phong",
    "thoi tiet",
    "dia diem",
    "tham quan",
    "lich trinh",
    "ke hoach",
    "goi y",
    "bai bien",
    "bao tang",
    "di choi",
    "hanh trinh",
    "dat ve",
  ],
  fr: [
    "voyage",
    "voyager",
    "vacances",
    "vol",
    "vols",
    "hebergement",
    "reservation",
    "tourisme",
    "touriste",
    "itineraire",
    "destination",
    "meteo",
    "visiter",
    "planifier",
    "plage",
    "musee",
    "aventure",
    "activite",
    "activites",
    "que voir",
    "que faire",
    "ou aller",
    "aller a",
  ],
  de: [
    "reise",
    "urlaub",
    "flug",
    "fluge",
    "unterkunft",
    "buchung",
    "tourismus",
    "wetter",
    "besuchen",
    "planen",
    "strand",
    "museum",
    "abenteuer",
    "aktivitat",
    "aktivitaten",
    "was sehen",
    "wohin",
    "reise nach",
  ],
  pt: [
    "viagem",
    "viajar",
    "ferias",
    "voo",
    "voos",
    "hospedagem",
    "reserva",
    "turismo",
    "itinerario",
    "destino",
    "clima",
    "visitar",
    "praia",
    "museu",
    "aventura",
    "atividade",
    "atividades",
    "o que ver",
    "onde ir",
    "ir para",
    "ir a",
  ],
  ja: [
    "旅行",
    "観光",
    "ホテル",
    "フライト",
    "予約",
    "天気",
    "日程",
    "観光地",
    "旅程",
  ],
  zh: ["旅行", "旅游", "酒店", "机票", "预订", "天气", "景点", "行程", "度假"],
};

/** Duration units across locales, e.g. "3 days", "3 ngay", "1 tuan", "3 dias". */
const TRAVEL_DURATION_PATTERN: string = String.raw`\d+\s*(?:days?|nights?|weeks?|ngay|tuan|jour|jours|nuits?|semaines?|semana|semanas?|dias?|tagen?|tage|noches?)`;

/**
 * Motion + place (normalized), e.g. "đi Nha Trang" → "di nha trang", not bare "di".
 * Pairs with intl phrases like "go to".
 */
const TRAVEL_MOTION_PREFIX_PATTERN: string = String.raw`\b(?:di|den|toi)\s+[\p{L}]`;

/** CJK / kana / hangul clusters when the message has no Latin travel keyword. */
const CJK_SCRIPT_PATTERN: string = String.raw`[\u4e00-\u9fff]{2,}|\d+\s*[\u65e5\u5929\u665a\u5bbf]|[\u3040-\u30ff]{2,}|[\uac00-\ud7af]{2,}`;

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Lowercase + strip diacritics for cross-locale keyword matching. */
export const normalizeTopicText = (message: string): string =>
  message
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();

const collectNormalizedTerms = (): string[] => {
  const unique: Set<string> = new Set();

  for (const terms of Object.values(TRAVEL_TOPIC_TERMS_BY_LOCALE)) {
    for (const term of terms) {
      const normalized: string = normalizeTopicText(term);

      if (normalized.length >= 2) {
        unique.add(normalized);
      }
    }
  }

  return [...unique].sort(
    (left: string, right: string) => right.length - left.length,
  );
};

const buildKeywordAlternation = (terms: readonly string[]): string =>
  terms.map((term: string) => escapeRegExp(term)).join("|");

/** Compiled allowlist: multilingual travel topics + duration hints + CJK scripts. */
export const TRAVEL_TOPIC_PATTERN: RegExp = new RegExp(
  `(?:${buildKeywordAlternation(collectNormalizedTerms())}|${TRAVEL_MOTION_PREFIX_PATTERN}|${TRAVEL_DURATION_PATTERN}|${CJK_SCRIPT_PATTERN})`,
  "iu",
);
