import type { RequestContext } from "@mastra/core/request-context";
import type { ContextWithMastra } from "@mastra/core/server";

import {
  CLIENT_HEADER_USER_LOCATION,
  REQUEST_CONTEXT_CURRENT_CITY,
} from "../constants";

const readUserLocationHeader = (c: ContextWithMastra) => {
  const fromHono = c.req.header(CLIENT_HEADER_USER_LOCATION)?.trim();
  if (fromHono) return fromHono;

  return c.req.raw.headers.get(CLIENT_HEADER_USER_LOCATION)?.trim() || undefined;
};

export const applyUserLocationFromHeaders = (
  c: ContextWithMastra,
  requestContext: RequestContext,
  logLabel = "applyUserLocation"
) => {
  const userLocation = readUserLocationHeader(c);

  console.log(`[${logLabel}] header ${CLIENT_HEADER_USER_LOCATION}:`, userLocation ?? "(missing)");

  if (userLocation) {
    requestContext.set(REQUEST_CONTEXT_CURRENT_CITY, userLocation);
    console.log(`[${logLabel}] requestContext.currentCity =`, userLocation);
  } else {
    console.log(`[${logLabel}] requestContext.currentCity not set (no header)`);
  }

  return userLocation;
};
