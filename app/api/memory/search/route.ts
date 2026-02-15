import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function cohereQueryEmbedding(text: string): Promise<Float32Array> {
  const res = await fetch("https://api.cohere.com/v1/embed", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "embed-english-v3.0",
      texts: [text],
      input_type: "search_query",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cohere embed failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return Float32Array.from(data.embeddings[0]);
}

function bytesToF32(buf: Uint8Array): Float32Array {
  // libsql returns BLOB as Uint8Array
  return new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.byteLength / 4));
}

function cosine(a: Float32Array, b: Float32Array): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const q: string = String(body?.query || "").trim();
  const scope: string = String(body?.scope || "project");
  const scopeId: string = String(body?.scopeId || "default");
  const topK: number = Number(body?.topK || 5);

  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const qvec = await cohereQueryEmbedding(q);

  // MVP: luam candidati recenți din scope (limit 200) și calculăm cosine în app layer
  const res = await client.execute({
    sql: `
      SELECT
        c.id as id,
        c.kind as kind,
        c.content as content,
        c.created_at as created_at,
        e.model as model,
        e.dims as dims,
        e.embedding as embedding
      FROM memory_chunks c
      JOIN memory_embeddings e ON e.chunk_id = c.id
      WHERE c.scope = ? AND c.scope_id = ?
      ORDER BY c.created_at DESC
      LIMIT 200
    `,
    args: [scope, scopeId],
  });

  const scored = res.rows
    .map((r: any) => {
      const emb: Uint8Array = r.embedding as Uint8Array;
      const dvec = bytesToF32(emb);
      return {
        id: String(r.id),
        kind: String(r.kind),
        content: String(r.content),
        createdAt: String(r.created_at),
        score: cosine(qvec, dvec),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(50, topK)));

  return NextResponse.json({
    query: q,
    scope,
    scopeId,
    topK,
    results: scored,
  });
}

