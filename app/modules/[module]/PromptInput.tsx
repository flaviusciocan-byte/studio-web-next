"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import AiDescription, { type AiDescriptionProps } from "./AiDescription";

const PromptInput = memo(function PromptInput({
  moduleId,
}: Pick<AiDescriptionProps, "moduleId">) {
  const storageKey = useMemo(() => `zaria:prompt:${moduleId}`, [moduleId]);
  const [prompt, setPrompt] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(`zaria:prompt:${moduleId}`) ?? "";
  });
  const [autoSubmitKey, setAutoSubmitKey] = useState<number>(0);
  const [lastSubmitAt, setLastSubmitAt] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const triggerSubmit = useCallback(() => {
    const normalizedPrompt = prompt.trim();
    if (normalizedPrompt === "") return;
    if (normalizedPrompt.length > 1000) return;

    const now = Date.now();
    if (now - lastSubmitAt < 500) return;
    if (isLoading) return;

    setLastSubmitAt(now);
    setAutoSubmitKey((k) => k + 1);
    setPrompt("");

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
  }, [isLoading, lastSubmitAt, prompt, storageKey]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setPrompt(event.target.value);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        triggerSubmit();
        return;
      }
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        triggerSubmit();
      }
    },
    [triggerSubmit],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, prompt);
  }, [prompt, storageKey]);

  const isPromptEmpty = prompt.trim().length === 0;

  return (
    <div style={{ marginTop: 18 }}>
      <textarea
        className="zaria-card zaria-card-inner zaria-prompt"
        name="prompt"
        aria-label="Prompt"
        placeholder="Scrie promptul aici..."
        value={prompt}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        rows={4}
        style={{ width: "100%" }}
      />

      <div className="zaria-actions">
        <button
          className="zaria-btn zaria-btn-primary"
          aria-label="Generate"
          disabled={isLoading || isPromptEmpty}
          onClick={triggerSubmit}
          style={{ marginTop: 10 }}
          type="button"
        >
          {isLoading ? "Generating…" : "Generate"}
        </button>
      </div>

      <AiDescription
        moduleId={moduleId}
        prompt={prompt}
        autoSubmitKey={autoSubmitKey}
        onLoadingChange={setIsLoading}
      />
    </div>
  );
});

export default PromptInput;
