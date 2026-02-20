import { useMemo, useState } from "react";
import type { MemorySearchResult, TenantProfile } from "../../api/client";
import { Panel } from "../../components/Panel";

interface LegacyBridgePanelProps {
  tenantProfile: TenantProfile | null;
  onToggleModule: (moduleName: string, enabled: boolean) => Promise<void>;
  onSearch: (query: string) => Promise<void>;
  results: MemorySearchResult[];
}

const knownModules = ["memory", "templates", "exports", "webhooks"] as const;

export const LegacyBridgePanel = ({
  tenantProfile,
  onToggleModule,
  onSearch,
  results
}: LegacyBridgePanelProps) => {
  const [query, setQuery] = useState("");
  const [busyToggle, setBusyToggle] = useState<string | null>(null);
  const [busySearch, setBusySearch] = useState(false);

  const flagMap = useMemo(() => {
    const map = new Map<string, boolean>();
    tenantProfile?.featureFlags.forEach((flag) => map.set(flag.module, flag.enabled));
    return map;
  }, [tenantProfile]);

  const handleToggle = async (moduleName: string): Promise<void> => {
    const nextEnabled = !(flagMap.get(moduleName) ?? false);
    setBusyToggle(moduleName);
    try {
      await onToggleModule(moduleName, nextEnabled);
    } finally {
      setBusyToggle(null);
    }
  };

  const handleSearch = async (): Promise<void> => {
    if (query.trim().length < 2) {
      return;
    }

    setBusySearch(true);
    try {
      await onSearch(query.trim());
    } finally {
      setBusySearch(false);
    }
  };

  return (
    <Panel title="Compatibility Bridge" subtitle="Legacy module continuity and memory search compatibility">
      {tenantProfile ? (
        <div className="mb-4 grid grid-cols-2 gap-2 text-xs uppercase tracking-[0.12em] text-zaria-purple-700">
          <span className="rounded-lg border border-zaria-purple-200 bg-zaria-purple-50 px-2 py-1">
            Docs {tenantProfile._count.documents}
          </span>
          <span className="rounded-lg border border-zaria-purple-200 bg-zaria-purple-50 px-2 py-1">
            Exports {tenantProfile._count.exports}
          </span>
          <span className="rounded-lg border border-zaria-purple-200 bg-zaria-purple-50 px-2 py-1">
            Users {tenantProfile._count.users}
          </span>
          <span className="rounded-lg border border-zaria-purple-200 bg-zaria-purple-50 px-2 py-1">
            Hooks {tenantProfile._count.webhooks}
          </span>
        </div>
      ) : null}

      <div className="space-y-2">
        {knownModules.map((moduleName) => {
          const enabled = flagMap.get(moduleName) ?? false;
          const pending = busyToggle === moduleName;

          return (
            <button
              key={moduleName}
              type="button"
              disabled={pending}
              onClick={() => void handleToggle(moduleName)}
              className="flex w-full items-center justify-between rounded-xl border border-zaria-purple-200 bg-zaria-white px-3 py-2 text-left"
            >
              <span className="text-sm font-semibold uppercase tracking-[0.12em] text-zaria-purple-700">
                {moduleName}
              </span>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  enabled
                    ? "bg-zaria-gold-500 text-zaria-purple-900"
                    : "bg-zaria-purple-100 text-zaria-purple-700"
                }`}
              >
                {pending ? "..." : enabled ? "ON" : "OFF"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-zaria-purple-200 bg-zaria-purple-50 p-3">
        <label className="text-sm text-zaria-purple-700">
          Memory Search
          <div className="mt-1 flex gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search transformed memory"
              className="w-full rounded-lg border border-zaria-purple-200 px-3 py-2"
            />
            <button
              type="button"
              disabled={busySearch}
              onClick={() => void handleSearch()}
              className="rounded-lg bg-zaria-purple-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zaria-white"
            >
              {busySearch ? "..." : "Find"}
            </button>
          </div>
        </label>

        <div className="mt-3 space-y-2">
          {results.slice(0, 5).map((item) => (
            <article key={item.id} className="rounded-lg border border-zaria-purple-200 bg-zaria-white p-2">
              <p className="text-sm font-semibold text-zaria-purple-800">{item.title}</p>
              <p className="mt-1 text-xs text-zaria-purple-700">{item.snippet}</p>
            </article>
          ))}
        </div>
      </div>
    </Panel>
  );
};
