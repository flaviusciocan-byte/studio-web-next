"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { MouseEvent } from "react";

type Props = {
  moduleId: string;
  prompt?: string;
  autoSubmitKey?: string | number;
  onLoadingChange?: (loading: boolean) => void;
};
export type AiDescriptionProps = Props;

export default function AiDescription({
  moduleId,
  prompt,
  autoSubmitKey,
  onLoadingChange,
}: Props) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("idle");
  const generate = useMutation(api.generate.generate);
  const resolvedPrompt =
    prompt && prompt.trim().length > 0
      ? prompt
      : `Explain briefly what the ${moduleId} module does.`;
  const runGenerate = async () => {
    if (loading) return;
    setLoading(true);
    onLoadingChange?.(true);
    setText(null);
    setStatus("requesting...");

    try {
      const t: string = await generate({
        moduleId,
        prompt: resolvedPrompt,
      });
      setStatus("status=200 ok=true");
      setText(t);
    } catch (e: unknown) {
      console.error(e);
      setStatus("fetch threw");
      const message = e instanceof Error ? e.message : String(e);
      setText(`FETCH_ERROR:\n${message}`);
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };
  const handleClick = async (_e: MouseEvent<HTMLButtonElement>) => {
    await runGenerate();
  };

  useEffect(() => {
    setText(null);
    setStatus("idle");
    setLoading(false);
  }, [moduleId]);

  useEffect(() => {
    if (autoSubmitKey === undefined) return;
    if (loading) return;
    if (resolvedPrompt.trim().length === 0) return;
    void runGenerate();
  }, [autoSubmitKey]);

  return (
    <div style={{ marginTop: 18 }}>
      <button
        className="zaria-btn-secondary"
        disabled={loading}
        onClick={handleClick}
      >
        {loading ? "Generating..." : "Generate AI description"}
      </button>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
        {status}
      </div>

      {text && (
        <div className="space-y-4" style={{ marginTop: 12 }}>
          {text.split("\n\n").map((block, i) => {
            if (block.trim().startsWith("*")) {
              return (
                <ul key={i} className="list-disc pl-6 text-sm text-zinc-300">
                  {block.split("\n").map((li, j) => (
                    <li key={j}>{li.replace(/^\*\s*/, "")}</li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={i} className="text-sm leading-relaxed text-zinc-300">
                {block}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}
