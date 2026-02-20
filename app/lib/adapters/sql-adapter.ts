import { createClient } from "@libsql/client";
import type { ProjectAdapter, ModuleState } from "../project-adapter";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

const client =
  tursoUrl && tursoAuthToken
    ? createClient({
        url: tursoUrl,
        authToken: tursoAuthToken,
      })
    : null;

async function ensureTable() {
  if (!client) return;

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
    if (!client) {
      return { id, active: false };
    }

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
    if (!client) return;

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
