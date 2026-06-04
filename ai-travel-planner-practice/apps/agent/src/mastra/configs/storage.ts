import { LibSQLStore } from "@mastra/libsql";
import { PostgresStore } from "@mastra/pg";
import type { MastraCompositeStore } from "@mastra/core/storage";

export const createStorage = (): MastraCompositeStore => {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    return new PostgresStore({
      id: "postgres-storage",
      connectionString,
    });
  }

  return new LibSQLStore({
    id: "libsql-storage",
    url: "file:./mastra.db",
  });
};
