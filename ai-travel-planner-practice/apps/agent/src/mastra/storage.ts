import { PostgresStore } from "@mastra/pg";

export const storage = new PostgresStore({
  id: "pg-storage",
  connectionString: process.env.DATABASE_URL!,
  disableInit: true,
});
