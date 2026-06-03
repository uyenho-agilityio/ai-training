import { LibSQLStore } from "@mastra/libsql";

export const getDBStore = (id: string) => {
  const url = process.env.LIBSQL_URL?.trim();
  if (!url) {
    throw new Error("LIBSQL_URL is required in .env");
  }
  const authToken = process.env.LIBSQL_AUTH_TOKEN?.trim();
  return new LibSQLStore({
    id,
    url,
    ...(authToken ? { authToken } : {}),
  });
};

export { applyUserLocationFromHeaders } from "./client-headers";
export {
  buildWeatherAgentInstructions,
  type BuildWeatherAgentInstructionsOptions,
} from "./instructions";
