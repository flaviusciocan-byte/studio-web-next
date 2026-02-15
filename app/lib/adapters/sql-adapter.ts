import { createClient } from "@libsql/client";
import { ProjectAdapter, ModuleState } from "../project-adapter";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoAuthToken) {
  throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
}

const client = createClient({
  url: tursoUrl,
  authToken: tursoAuthToken,
});

async function ensureTable() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS project_modules (
      id TEXT PRIMARY KEY,
      active INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export const SqlProjectAdapter: ProjectAdapter = {
  async getModule(id: string): Promise<ModuleState> {
    await ensureTable();

    const res = await client.execute({
      sql: "SELECT id, active FROM project_modules WHERE id = ?",
      args: [id],
    });

    if (res.rows.length === 0) {
      return { id, active: false };
    }

    return {
      id: String(res.rows[0].id),
      active: Boolean(res.rows[0].active),
    };
  },

  async setModule(state: ModuleState): Promise<void> {
    await ensureTable();

    await client.execute({
      sql: `
        INSERT INTO project_modules (id, active)
        VALUES (?, ?)
        ON CONFLICT(id) DO UPDATE SET
          active = excluded.active,
          updated_at = CURRENT_TIMESTAMP
      `,
      args: [state.id, state.active ? 1 : 0],
    });
  },

  async toggleModule(id: string): Promise<ModuleState> {
    const current = await this.getModule(id);
    const next = { id, active: !current.active };
    await this.setModule(next);
    return next;
  },
};
