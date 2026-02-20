import Link from "next/link";
import SectionCard from "@/components/SectionCard";

const pipeline = [
  {
    title: "Input Layer",
    copy: "Raw text, structured drafts, imports, and copywriter-origin content in one standardized flow.",
  },
  {
    title: "Processing Layer",
    copy: "Normalization, chapter detection, hierarchy, metadata extraction, and TOC synthesis.",
  },
  {
    title: "Export Engine",
    copy: "Generate production-ready PDF, EPUB, DOCX, and bundle artifacts with stable output contracts.",
  },
  {
    title: "Spine Integration",
    copy: "AD/PM/ESI-aware scoring with layout adaptation and guidance for premium output quality.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_0%,rgba(66,99,235,0.24),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.2),transparent_34%),linear-gradient(180deg,#050913_0%,#0a1121_55%,#050913_100%)]">
      <section className="mx-auto w-full max-w-6xl px-6 pb-12 pt-20 sm:pt-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/70">
            ZARIA Builder
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
            Text Edition Runtime for Digital Product Systems
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            Continue building modules, products, and control surfaces from a single
            Next.js shell with compatibility APIs and export-ready architecture.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/modules/builder-core"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Open Builder Core
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore Products
            </Link>
            <Link
              href="/control"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open Control
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 pb-10 md:grid-cols-2">
        {pipeline.map((item) => (
          <SectionCard key={item.title} title={item.title} description={item.copy} />
        ))}
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <SectionCard
          title="Compatibility Bridge"
          description="Legacy endpoints remain available under /api/* while the new engine architecture is finalized inside the same codebase."
        >
          <div className="grid gap-4 text-sm text-white/80 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-white">/api/modules/:module/toggle</div>
              <p className="mt-2 text-white/70">Feature flag and module activation continuity.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-white">/api/memory/search</div>
              <p className="mt-2 text-white/70">Semantic memory retrieval with scoped top-k matching.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-white">/api/product-factory</div>
              <p className="mt-2 text-white/70">Text blueprint generation route for product packaging flows.</p>
            </div>
          </div>
        </SectionCard>
      </section>
    </main>
  );
}
