"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

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

  const resolvedPrompt = useMemo(
    () =>
      prompt && prompt.trim().length > 0
        ? prompt
        : `Explain briefly what the ${moduleId} module does.`,
    [moduleId, prompt],
  );

  const runGenerate = useCallback(
    async (nextPrompt: string) => {
      if (loading) return;

      setLoading(true);
      onLoadingChange?.(true);
      setText(null);
      setStatus("requesting...");

      try {
        const result = await generate({
          moduleId,
          prompt: nextPrompt,
        });
        setStatus("status=200 ok=true");
        setText(result);
      } catch (error: unknown) {
        console.error(error);
        setStatus("fetch threw");
        const message = error instanceof Error ? error.message : String(error);
        setText(`FETCH_ERROR:\n${message}`);
      } finally {
        setLoading(false);
        onLoadingChange?.(false);
      }
    },
    [generate, loading, moduleId, onLoadingChange],
  );

  const handleClick = useCallback(() => {
    void runGenerate(resolvedPrompt);
  }, [resolvedPrompt, runGenerate]);

  useEffect(() => {
    if (autoSubmitKey === undefined) return;
    if (resolvedPrompt.trim().length === 0) return;
    void runGenerate(resolvedPrompt);
  }, [autoSubmitKey, resolvedPrompt, runGenerate]);

  return (
    <div style={{ marginTop: 18 }}>
      <button
        className="zaria-btn-secondary"
        disabled={loading}
        onClick={handleClick}
        type="button"
      >
        {loading ? "Generating..." : "Generate AI description"}
      </button>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>{status}</div>

      {text ? (
        <div className="space-y-4" style={{ marginTop: 12 }}>
          {text.split("\n\n").map((block, index) => {
            if (block.trim().startsWith("*")) {
              return (
                <ul key={index} className="list-disc pl-6 text-sm text-zinc-300">
                  {block.split("\n").map((line, lineIndex) => (
                    <li key={lineIndex}>{line.replace(/^\*\s*/, "")}</li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={index} className="text-sm leading-relaxed text-zinc-300">
                {block}
              </p>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
