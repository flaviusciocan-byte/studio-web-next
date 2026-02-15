async function cohereEmbedding(text: string): Promise<Float32Array> {
  const res = await fetch("https://api.cohere.com/v1/embed", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "embed-english-v3.0",
      texts: [text],
      input_type: "search_document",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cohere embed failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return Float32Array.from(data.embeddings[0]);
}

