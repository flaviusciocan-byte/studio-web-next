import type { Chapter, DocumentMetadata, LayoutHints, TocEntry } from "@zaria/shared";
import { Panel } from "../../components/Panel";

interface PreviewPanelProps {
  metadata: DocumentMetadata | null;
  toc: TocEntry[];
  chapters: Chapter[];
  layout: LayoutHints | null;
}

const flattenChapters = (chapters: Chapter[]): Chapter[] => {
  const list: Chapter[] = [];
  const walk = (nodes: Chapter[]): void => {
    nodes.forEach((node) => {
      list.push(node);
      walk(node.sections);
    });
  };
  walk(chapters);
  return list;
};

export const PreviewPanel = ({ metadata, toc, chapters, layout }: PreviewPanelProps) => {
  const sampleChapters = flattenChapters(chapters).slice(0, 5);

  return (
    <Panel title="Preview Engine" subtitle="Structured output preview generated from processing layer">
      {!metadata ? (
        <p className="rounded-2xl border border-zaria-purple-200 bg-zaria-purple-50 p-4 text-sm text-zaria-purple-700">
          Process a document to load TOC, hierarchy and page layout preview.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zaria-gold-300 bg-zaria-gold-100 p-4">
            <h3 className="font-display text-2xl text-zaria-purple-900">{metadata.title}</h3>
            {metadata.subtitle ? <p className="mt-1 text-sm text-zaria-purple-700">{metadata.subtitle}</p> : null}
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-zaria-purple-600">
              {metadata.wordCount} words • {metadata.estimatedReadingMinutes} min read • {metadata.language}
            </p>
          </div>

          {layout ? (
            <div className="grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.14em] text-zaria-purple-700">
              <div className="rounded-xl border border-zaria-purple-200 bg-zaria-white p-2">Body {layout.bodyFontSize}px</div>
              <div className="rounded-xl border border-zaria-purple-200 bg-zaria-white p-2">Line {layout.lineHeight}</div>
              <div className="rounded-xl border border-zaria-purple-200 bg-zaria-white p-2">Spacing {layout.paragraphSpacing}</div>
              <div className="rounded-xl border border-zaria-purple-200 bg-zaria-white p-2">Margin {layout.margin}</div>
            </div>
          ) : null}

          <div>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-zaria-purple-700">Table of Contents</h4>
            <ul className="space-y-1 text-sm text-zaria-purple-800">
              {toc.slice(0, 12).map((entry) => (
                <li key={entry.id} className="rounded-lg border border-zaria-purple-100 bg-zaria-purple-50 px-2 py-1">
                  {entry.order}. {entry.title}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-zaria-purple-700">Chapter Samples</h4>
            <div className="space-y-2">
              {sampleChapters.map((chapter) => (
                <article key={chapter.id} className="rounded-xl border border-zaria-purple-100 bg-zaria-white p-3">
                  <h5 className="font-semibold text-zaria-purple-800">{chapter.title}</h5>
                  <p className="mt-1 max-h-16 overflow-hidden text-sm text-zaria-purple-700">{chapter.content}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
};
