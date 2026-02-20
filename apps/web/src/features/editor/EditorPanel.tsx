import { useMemo } from "react";
import type { InputType, SpineMetrics, TemplateSpec } from "@zaria/shared";
import { Panel } from "../../components/Panel";

interface EditorPanelProps {
  title: string;
  onTitleChange: (value: string) => void;
  rawText: string;
  onRawTextChange: (value: string) => void;
  sourceReference: string;
  onSourceReferenceChange: (value: string) => void;
  inputType: InputType;
  onInputTypeChange: (value: InputType) => void;
  templateId: string;
  templates: TemplateSpec[];
  onTemplateChange: (templateId: string) => void;
  spine: SpineMetrics;
  busy: boolean;
  onBuild: () => Promise<void>;
}

export const EditorPanel = ({
  title,
  onTitleChange,
  rawText,
  onRawTextChange,
  sourceReference,
  onSourceReferenceChange,
  inputType,
  onInputTypeChange,
  templateId,
  templates,
  onTemplateChange,
  busy,
  onBuild
}: EditorPanelProps) => {
  const charCount = rawText.length;
  const wordCount = useMemo(() => rawText.split(/\s+/).filter(Boolean).length, [rawText]);

  return (
    <Panel
      title="Editor Panel"
      subtitle="Input Layer: raw, structured, imported or ZARIA Copywriter text"
      actions={
        <button
          type="button"
          onClick={() => void onBuild()}
          disabled={busy}
          className="rounded-xl bg-zaria-gold-500 px-4 py-2 text-sm font-semibold text-zaria-purple-900 transition hover:bg-zaria-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Processing..." : "Structure Text"}
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="text-sm text-zaria-purple-700">
          Product Title
          <input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            className="mt-1 w-full rounded-xl border border-zaria-purple-200 px-3 py-2"
          />
        </label>

        <label className="text-sm text-zaria-purple-700">
          Input Type
          <select
            value={inputType}
            onChange={(event) => onInputTypeChange(event.target.value as InputType)}
            className="mt-1 w-full rounded-xl border border-zaria-purple-200 px-3 py-2"
          >
            <option value="raw">Raw Text</option>
            <option value="structured">Structured Text</option>
            <option value="imported">Imported Text</option>
            <option value="copywriter">ZARIA Copywriter</option>
          </select>
        </label>

        <label className="text-sm text-zaria-purple-700">
          Source Reference
          <input
            value={sourceReference}
            onChange={(event) => onSourceReferenceChange(event.target.value)}
            className="mt-1 w-full rounded-xl border border-zaria-purple-200 px-3 py-2"
            placeholder="Optional import/API reference"
          />
        </label>

        <label className="text-sm text-zaria-purple-700">
          Template
          <select
            value={templateId}
            onChange={(event) => onTemplateChange(event.target.value)}
            className="mt-1 w-full rounded-xl border border-zaria-purple-200 px-3 py-2"
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block text-sm text-zaria-purple-700">
        Text Content
        <textarea
          value={rawText}
          onChange={(event) => onRawTextChange(event.target.value)}
          className="mt-1 h-72 w-full rounded-2xl border border-zaria-purple-200 px-4 py-3 leading-relaxed"
          placeholder="Paste text content to transform into digital products"
        />
      </label>

      <div className="mt-3 flex gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-zaria-purple-600">
        <span>{wordCount} words</span>
        <span>{charCount} chars</span>
      </div>
    </Panel>
  );
};
