import type { PropsWithChildren, ReactNode } from "react";

interface AppShellProps extends PropsWithChildren {
  topRight?: ReactNode;
}

export const AppShell = ({ topRight, children }: AppShellProps) => {
  return (
    <div className="mx-auto min-h-screen max-w-[1600px] px-4 py-phi-1 md:px-8 md:py-phi-2">
      <header className="mb-phi-2 rounded-3xl border border-zaria-gold-300 bg-zaria-white/95 px-phi-1 py-4 shadow-zaria">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zaria-gold-700">ZARIA Ecosystem</p>
            <h1 className="font-display text-3xl text-zaria-purple-900 md:text-4xl">ZARIA Builder - Text Edition</h1>
            <p className="mt-2 max-w-3xl text-sm text-zaria-purple-700">
              API-first transformation platform that structures, styles, exports and packages text into premium digital products.
            </p>
          </div>
          {topRight}
        </div>
      </header>

      <main className="grid grid-cols-12 gap-phi-1">{children}</main>
    </div>
  );
};
