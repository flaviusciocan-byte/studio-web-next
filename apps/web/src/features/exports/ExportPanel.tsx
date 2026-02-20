import { useState } from "react";
import type { ExportFormat, SpineMetrics } from "@zaria/shared";
import type { ExportArtifactRecord } from "../../api/client";
import { Panel } from "../../components/Panel";

interface ExportPanelProps {
  disabled: boolean;
  spine: SpineMetrics;
  exports: ExportArtifactRecord[];
  onExport: (params: {
    format: ExportFormat;
    includeFormats?: Array<"pdf" | "epub" | "docx">;
    spine: SpineMetrics;
  }) => Promise<void>;
  onDownload: (exportId: string) => Promise<void>;
}

export const ExportPanel = ({
  disabled,
  spine,
  exports,
  onExport,
  onDownload
}: ExportPanelProps) => {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [bundleFormats, setBundleFormats] = useState<Array<"pdf" | "epub" | "docx">>([
    "pdf",
    "epub",
    "docx"
  ]);
  const [busy, setBusy] = useState(false);

  const toggleBundleFormat = (candidate: "pdf" | "epub" | "docx"): void => {
    setBundleFormats((prev) =>
      prev.includes(candidate) ? prev.filter((item) => item !== candidate) : [...prev, candidate]
    );
  };

  const submit = async (): Promise<void> => {
    setBusy(true);
    try {
      await onExport({
        format,
        includeFormats: format === "bundle" ? bundleFormats : undefined,
        spine
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="Export Panel" subtitle="PDF, EPUB, DOCX and bundle generation">
      <div className="space-y-3">
        <label className="block text-sm text-zaria-purple-700">
          Format
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value as ExportFormat)}
            className="mt-1 w-full rounded-xl border border-zaria-purple-200 px-3 py-2"
          >
            <option value="pdf">PDF</option>
            <option value="epub">EPUB</option>
            <option value="docx">DOCX</option>
            <option value="bundle">Bundle ZIP</option>
          </select>
        </label>

        {format === "bundle" ? (
          <div className="rounded-2xl border border-zaria-purple-200 bg-zaria-purple-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-zaria-purple-700">Bundle Contents</p>
            <div className="grid grid-cols-3 gap-2">
              {(["pdf", "epub", "docx"] as const).map((candidate) => (
                <label key={candidate} className="flex items-center gap-2 rounded-lg bg-zaria-white px-2 py-1 text-sm">
                  <input
                    type="checkbox"
                    checked={bundleFormats.includes(candidate)}
                    onChange={() => toggleBundleFormat(candidate)}
                  />
                  {candidate.toUpperCase()}
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => void submit()}
          className="w-full rounded-xl bg-zaria-purple-700 px-4 py-2 font-semibold text-zaria-white transition hover:bg-zaria-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Generating..." : "Generate Export"}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {exports.map((item) => (
          <article key={item.id} className="rounded-xl border border-zaria-purple-200 bg-zaria-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zaria-purple-800">{item.format}</p>
                <p className="text-xs text-zaria-purple-600">
                  {item.status} {item.filename ? `• ${item.filename}` : ""}
                </p>
              </div>
              {item.status === "SUCCESS" ? (
                <button
                  type="button"
                  onClick={() => void onDownload(item.id)}
                  className="rounded-lg bg-zaria-gold-500 px-3 py-1 text-xs font-semibold text-zaria-purple-900 hover:bg-zaria-gold-300"
                >
                  Download
                </button>
              ) : null}
            </div>
            {item.error ? <p className="mt-2 text-xs text-zaria-purple-700">{item.error}</p> : null}
          </article>
        ))}
      </div>
    </Panel>
  );
};
