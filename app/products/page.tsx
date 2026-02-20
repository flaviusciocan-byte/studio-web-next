import type { Metadata } from "next";
import Link from "next/link";
import SectionCard from "@/components/SectionCard";

export const metadata: Metadata = {
  title: "Products",
  description:
    "ZARIA Builder Text Edition product stack: formats, templates, and deployment-ready outputs.",
};

const formats = [
  {
    name: "PDF",
    copy: "Vector-based premium export with typography and page rhythm adaptation.",
  },
  {
    name: "EPUB",
    copy: "EPUB3 package with nav document, OPF metadata, and validated structure.",
  },
  {
    name: "DOCX",
    copy: "OpenXML-compatible output for editing, handoff, and enterprise pipelines.",
  },
  {
    name: "BUNDLE",
    copy: "Multi-format ZIP bundle with checksums and export manifest.",
  },
];

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#050913_0%,#0b1324_45%,#050913_100%)]">
      <section className="mx-auto w-full max-w-6xl px-6 pb-8 pt-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            ZARIA Products
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
            Productized outputs from Builder - Text Edition. Keep generating with the
            existing modules while shipping polished digital artifacts.
          </p>
          <div className="mt-7">
            <Link
              href="/modules/builder-core"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Generate from Builder Core
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-6 pb-10 sm:grid-cols-2">
        {formats.map((format) => (
          <SectionCard key={format.name} title={format.name} description={format.copy} />
        ))}
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <SectionCard
          title="Release Channels"
          description="Use generated artifacts for Gumroad, Digistore24, lead magnets, premium newsletters, and internal knowledge products."
        >
          <div className="grid gap-3 text-sm text-white/75 sm:grid-cols-2 md:grid-cols-4">
            {[
              "Gumroad Packaging",
              "Digistore24 Listing",
              "Email Funnel Assets",
              "Member Area Delivery",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                {item}
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </main>
  );
}
