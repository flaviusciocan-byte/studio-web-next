export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="h-16 flex items-center justify-between px-6 border-b">
        <div className="font-semibold">ZARIA Builder</div>
        <div className="flex gap-3 items-center">
          <a href="/modules/builder-core" className="text-sm font-medium px-4 py-2 rounded bg-black text-white inline-flex items-center justify-center">
            Try now
          </a>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-3xl">
          <div className="text-sm mb-4">Built for real AI workflows</div>

          <h1 className="text-4xl font-bold">
            Orchestrate apps, sites, and systems from modular AI blocks.
          </h1>

          <p className="mt-4 text-lg">
            Design, generate, connect, deploy. No demos—production pipelines.
          </p>

          <div className="mt-8 flex gap-4 justify-center">
            <a href="/modules/builder-core" className="px-6 py-3 rounded bg-black text-white inline-flex items-center justify-center">
              Try now
            </a>
            <button className="px-6 py-3 rounded border">
              Watch 60s demo
            </button>
          </div>

          <div className="mt-10 text-sm">
            <div className="mb-2">Trusted by builders shipping weekly</div>
            <div className="flex gap-2 justify-center flex-wrap">
              <span className="px-3 py-1 border rounded">Templates</span>
              <span className="px-3 py-1 border rounded">Deploy-ready</span>
              <span className="px-3 py-1 border rounded">Versioned modules</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
