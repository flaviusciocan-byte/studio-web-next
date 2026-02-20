import { useEffect, useMemo, useState } from "react";
import type {
  Chapter,
  DocumentMetadata,
  InputType,
  LayoutHints,
  SpineMetrics,
  TemplateSpec,
  TocEntry
} from "@zaria/shared";
import {
  ApiClient,
  type DocumentRecord,
  type ExportArtifactRecord,
  type MemorySearchResult,
  type Session,
  type TenantProfile
} from "./api/client";
import { AppShell } from "./layout/AppShell";
import { AuthPanel } from "./features/auth/AuthPanel";
import { SpineIndicators } from "./features/spine/SpineIndicators";
import { EditorPanel } from "./features/editor/EditorPanel";
import { TemplateGallery } from "./features/templates/TemplateGallery";
import { PreviewPanel } from "./features/preview/PreviewPanel";
import { ExportPanel } from "./features/exports/ExportPanel";
import { LegacyBridgePanel } from "./features/compat/LegacyBridgePanel";

const sessionStorageKey = "zaria.builder.session";

const parseStructured = (value: unknown): unknown => value;

const ensureArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const extractPreview = (document: DocumentRecord | null): {
  metadata: DocumentMetadata | null;
  toc: TocEntry[];
  chapters: Chapter[];
  layout: LayoutHints | null;
} => {
  if (!document || !document.processedAt) {
    return { metadata: null, toc: [], chapters: [], layout: null };
  }

  const metadata = (parseStructured(document.metadata) as DocumentMetadata | null) ?? null;
  const toc = ensureArray<TocEntry>(parseStructured(document.toc));
  const chapters = ensureArray<Chapter>(parseStructured(document.chapters));
  const layout = (parseStructured(document.layout) as LayoutHints | null) ?? null;

  return { metadata, toc, chapters, layout };
};

export const App = () => {
  const api = useMemo(() => new ApiClient(), []);

  const [session, setSession] = useState<Session | null>(() => {
    const raw = window.localStorage.getItem(sessionStorageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  });

  const [templates, setTemplates] = useState<TemplateSpec[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("zaria-imperial");

  const [title, setTitle] = useState("ZARIA Product Draft");
  const [inputType, setInputType] = useState<InputType>("raw");
  const [rawText, setRawText] = useState(
    "# Introduction\n\nWrite your source text here.\n\n## Core Insight\n\nEach section becomes structured output in exports."
  );
  const [sourceReference, setSourceReference] = useState("zaria-copywriter://draft/1");
  const [spine, setSpine] = useState<SpineMetrics>({ ad: 64, pm: 72, esi: 58 });

  const [currentDocument, setCurrentDocument] = useState<DocumentRecord | null>(null);
  const [exports, setExports] = useState<ExportArtifactRecord[]>([]);
  const [tenantProfile, setTenantProfile] = useState<TenantProfile | null>(null);
  const [memoryResults, setMemoryResults] = useState<MemorySearchResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      api.setSession(session);
      window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    } else {
      api.clearSession();
      window.localStorage.removeItem(sessionStorageKey);
    }
  }, [api, session]);

  useEffect(() => {
    if (!session) {
      setTemplates([]);
      setTenantProfile(null);
      setMemoryResults([]);
      return;
    }

    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const items = await api.getTemplates();
        if (!cancelled) {
          setTemplates(items);
          if (!items.find((template) => template.id === selectedTemplateId)) {
            setSelectedTemplateId(items[0]?.id ?? "zaria-imperial");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load templates");
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [api, session, selectedTemplateId]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    const loadTenantProfile = async (): Promise<void> => {
      try {
        const profile = await api.getTenantProfile();
        if (!cancelled) {
          setTenantProfile(profile);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load tenant profile");
        }
      }
    };

    void loadTenantProfile();

    return () => {
      cancelled = true;
    };
  }, [api, session]);

  const handleAuthenticated = (nextSession: Session): void => {
    setError(null);
    setSession(nextSession);
  };

  const handleBuild = async (): Promise<void> => {
    if (!session) return;

    setBusy(true);
    setError(null);

    try {
      const created = await api.createDocument({
        inputType,
        title,
        rawText,
        sourceReference: sourceReference || undefined,
        templateId: selectedTemplateId,
        spine,
        metadata: {
          language: "en",
          author: "ZARIA Operator"
        }
      });

      const processed = await api.processDocument(created.id, true);
      setCurrentDocument(processed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Build failed");
    } finally {
      setBusy(false);
    }
  };

  const handleExport = async (params: {
    format: "pdf" | "epub" | "docx" | "bundle";
    includeFormats?: Array<"pdf" | "epub" | "docx">;
    spine: SpineMetrics;
  }): Promise<void> => {
    if (!currentDocument) {
      setError("Process a document before exporting.");
      return;
    }

    setError(null);
    try {
      const artifact = await api.exportDocument({
        documentId: currentDocument.id,
        format: params.format,
        includeFormats: params.includeFormats,
        spine: params.spine
      });

      setExports((prev) => [artifact, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  };

  const handleDownload = async (exportId: string): Promise<void> => {
    try {
      const { filename, blob } = await api.downloadExport(exportId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    }
  };

  const handleToggleModule = async (moduleName: string, enabled: boolean): Promise<void> => {
    try {
      await api.toggleLegacyModule(moduleName, enabled);
      const profile = await api.getTenantProfile();
      setTenantProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update module flag");
    }
  };

  const handleMemorySearch = async (query: string): Promise<void> => {
    try {
      const items = await api.memorySearch(query, 10);
      setMemoryResults(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Memory search failed");
    }
  };

  const preview = extractPreview(currentDocument);

  return (
    <AppShell
      topRight={
        session ? (
          <button
            type="button"
            onClick={() => setSession(null)}
            className="rounded-xl border border-zaria-purple-300 bg-zaria-white px-4 py-2 text-sm font-semibold text-zaria-purple-800 hover:border-zaria-gold-500"
          >
            Sign Out
          </button>
        ) : null
      }
    >
      {!session ? (
        <div className="col-span-12">
          <AuthPanel
            onRegister={(input) => api.register(input)}
            onLogin={(input) => api.login(input)}
            onAuthenticated={handleAuthenticated}
          />
        </div>
      ) : (
        <>
          <div className="col-span-12 lg:col-span-5">
            <EditorPanel
              title={title}
              onTitleChange={setTitle}
              rawText={rawText}
              onRawTextChange={setRawText}
              sourceReference={sourceReference}
              onSourceReferenceChange={setSourceReference}
              inputType={inputType}
              onInputTypeChange={setInputType}
              templateId={selectedTemplateId}
              templates={templates}
              onTemplateChange={setSelectedTemplateId}
              spine={spine}
              busy={busy}
              onBuild={handleBuild}
            />
          </div>

          <div className="col-span-12 lg:col-span-3">
            <div className="space-y-phi-1">
              <SpineIndicators metrics={spine} onChange={setSpine} />
              <TemplateGallery
                templates={templates}
                selectedTemplateId={selectedTemplateId}
                onSelect={setSelectedTemplateId}
              />
              <LegacyBridgePanel
                tenantProfile={tenantProfile}
                onToggleModule={handleToggleModule}
                onSearch={handleMemorySearch}
                results={memoryResults}
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="space-y-phi-1">
              <PreviewPanel
                metadata={preview.metadata}
                toc={preview.toc}
                chapters={preview.chapters}
                layout={preview.layout}
              />
              <ExportPanel
                disabled={!currentDocument}
                spine={spine}
                exports={exports}
                onExport={handleExport}
                onDownload={handleDownload}
              />
            </div>
          </div>
        </>
      )}

      {error ? (
        <div className="col-span-12 rounded-2xl border border-zaria-gold-500 bg-zaria-gold-100 px-4 py-3 text-sm text-zaria-purple-900">
          {error}
        </div>
      ) : null}
    </AppShell>
  );
};
