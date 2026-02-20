import { JsonProjectAdapter } from "./adapters/json-adapter";
import { SqlProjectAdapter } from "./adapters/sql-adapter";

const hasSqlBackend = Boolean(
  process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN,
);

export const ProjectState = hasSqlBackend ? SqlProjectAdapter : JsonProjectAdapter;
