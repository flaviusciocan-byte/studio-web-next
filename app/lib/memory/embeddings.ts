type CohereInputType = "search_document" | "search_query";

type CohereEmbedResponse = {
  embeddings?: number[][];
};

export async function cohereEmbedding(
  text: string,
  inputType: CohereInputType = "search_document",
): Promise<Float32Array> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    throw new Error("COHERE_API_KEY is not configured");
  }

  const response = await fetch("https://api.cohere.com/v1/embed", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "embed-english-v3.0",
      texts: [text],
      input_type: inputType,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cohere embed failed: ${response.status} ${err}`);
  }

  const data = (await response.json()) as CohereEmbedResponse;
  const vector = data.embeddings?.[0];
  if (!vector || vector.length === 0) {
    throw new Error("Cohere embed returned an empty vector");
  }

  return Float32Array.from(vector);
}
