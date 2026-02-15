export async function POST(req: Request) {
  const { prompt } = await req.json();

  const r = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2:latest",
      prompt: String(prompt ?? ""),
      stream: false,
    }),
  });

  const data = await r.json();
  return new Response(data.response, {
    headers: { "content-type": "text/plain" },
  });
}
