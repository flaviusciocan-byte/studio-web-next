import { NextResponse } from "next/server";
import { createClient, type Client } from "@libsql/client";
import { cohereEmbedding } from "@/app/lib/memory/embeddings";

type MemorySearchBody = {
  query?: unknown;
  scope?: unknown;
  scopeId?: unknown;
  topK?: unknown;
};

type MemoryRow = {
  id: unknown;
  kind: unknown;
  content: unknown;
  created_at: unknown;
  embedding: unknown;
};

type ScoredResult = {
  id: string;
  kind: string;
  content: string;
  createdAt: string;
  score: number;
};

function getClient(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    return null;
  }

  return createClient({ url, authToken });
}

function parseTopK(value: unknown): number {
  const parsed = Number(value ?? 5);
  if (!Number.isFinite(parsed)) return 5;
  return Math.max(1, Math.min(50, Math.trunc(parsed)));
}

function bytesToFloat32(buffer: Uint8Array): Float32Array {
  return new Float32Array(
    buffer.buffer,
    buffer.byteOffset,
    Math.floor(buffer.byteLength / 4),
  );
}

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < n; index += 1) {
    const x = a[index];
    const y = b[index];
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dot / denominator;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as MemorySearchBody;

  const query = String(body.query ?? "").trim();
  const scope = String(body.scope ?? "project");
  const scopeId = String(body.scopeId ?? "default");
  const topK = parseTopK(body.topK);

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const client = getClient();
  if (!client) {
    return NextResponse.json(
      {
        error:
          "Memory search is unavailable. TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be configured.",
      },
      { status: 503 },
    );
  }

  const queryVector = await cohereEmbedding(query, "search_query");

  const dbResult = await client.execute({
    sql: `
      SELECT
        c.id AS id,
        c.kind AS kind,
        c.content AS content,
        c.created_at AS created_at,
        e.embedding AS embedding
      FROM memory_chunks c
      JOIN memory_embeddings e ON e.chunk_id = c.id
      WHERE c.scope = ? AND c.scope_id = ?
      ORDER BY c.created_at DESC
      LIMIT 200
    `,
    args: [scope, scopeId],
  });

  const scored = dbResult.rows
    .map((row) => {
      const typed = row as unknown as MemoryRow;
      if (!(typed.embedding instanceof Uint8Array)) {
        return null;
      }

      const docVector = bytesToFloat32(typed.embedding);

      const item: ScoredResult = {
        id: String(typed.id ?? ""),
        kind: String(typed.kind ?? ""),
        content: String(typed.content ?? ""),
        createdAt: String(typed.created_at ?? ""),
        score: cosineSimilarity(queryVector, docVector),
      };

      return item;
    })
    .filter((item): item is ScoredResult => item !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return NextResponse.json({
    query,
    scope,
    scopeId,
    topK,
    results: scored,
  });
}
