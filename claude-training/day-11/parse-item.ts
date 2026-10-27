import { EMPTY_NAME_REASON, INVALID_PRICE_REASON } from "./constants.ts";
import type { ParsedCartItem } from "./types.ts";

/** Accept a trimmed name and a finite price greater than zero. */
export const parseCartItemInput = (
  rawName: string,
  rawPrice: string,
): ParsedCartItem => {
  const name: string = rawName.trim();
  if (name.length === 0) {
    return { ok: false, reason: EMPTY_NAME_REASON };
  }

  const price: number = Number(rawPrice.trim());
  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, reason: INVALID_PRICE_REASON };
  }

  return { ok: true, name, price };
};
