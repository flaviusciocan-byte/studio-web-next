import type { PropsWithChildren, ReactNode } from "react";

interface PanelProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export const Panel = ({ title, subtitle, actions, children }: PanelProps) => {
  return (
    <section className="rounded-3xl border border-zaria-purple-200 bg-zaria-white/90 shadow-zaria backdrop-blur-sm">
      <header className="flex items-start justify-between gap-4 border-b border-zaria-purple-100 px-phi-1 py-4">
        <div>
          <h2 className="font-display text-xl text-zaria-purple-800">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-zaria-purple-600">{subtitle}</p> : null}
        </div>
        {actions}
      </header>
      <div className="p-phi-1">{children}</div>
    </section>
  );
};
