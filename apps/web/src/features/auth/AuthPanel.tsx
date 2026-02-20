import { useState } from "react";
import type { Session } from "../../api/client";
import { Panel } from "../../components/Panel";

interface AuthPanelProps {
  onRegister: (input: {
    tenantName: string;
    tenantSlug: string;
    fullName: string;
    email: string;
    password: string;
  }) => Promise<Session>;
  onLogin: (input: { tenantSlug: string; email: string; password: string }) => Promise<Session>;
  onAuthenticated: (session: Session) => void;
}

export const AuthPanel = ({ onRegister, onLogin, onAuthenticated }: AuthPanelProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [tenantName, setTenantName] = useState("Zaria Studio");
  const [tenantSlug, setTenantSlug] = useState("zaria-studio");
  const [fullName, setFullName] = useState("Owner");
  const [email, setEmail] = useState("owner@example.com");
  const [password, setPassword] = useState("ReplaceWithStrongPass#2026");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    setBusy(true);
    setError(null);

    try {
      const session =
        mode === "register"
          ? await onRegister({ tenantName, tenantSlug, fullName, email, password })
          : await onLogin({ tenantSlug, email, password });

      onAuthenticated(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      title="Authentication"
      subtitle="Multi-tenant access for the ZARIA API Gateway"
      actions={
        <div className="inline-flex rounded-full border border-zaria-purple-200 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              mode === "login"
                ? "bg-zaria-purple-600 text-zaria-white"
                : "text-zaria-purple-700 hover:bg-zaria-purple-100"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              mode === "register"
                ? "bg-zaria-purple-600 text-zaria-white"
                : "text-zaria-purple-700 hover:bg-zaria-purple-100"
            }`}
          >
            Register
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {mode === "register" ? (
          <label className="text-sm text-zaria-purple-700">
            Tenant Name
            <input
              className="mt-1 w-full rounded-xl border border-zaria-purple-200 px-3 py-2"
              value={tenantName}
              onChange={(event) => setTenantName(event.target.value)}
            />
          </label>
        ) : null}

        <label className="text-sm text-zaria-purple-700">
          Tenant Slug
          <input
            className="mt-1 w-full rounded-xl border border-zaria-purple-200 px-3 py-2"
            value={tenantSlug}
            onChange={(event) => setTenantSlug(event.target.value)}
          />
        </label>

        {mode === "register" ? (
          <label className="text-sm text-zaria-purple-700">
            Full Name
            <input
              className="mt-1 w-full rounded-xl border border-zaria-purple-200 px-3 py-2"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </label>
        ) : null}

        <label className="text-sm text-zaria-purple-700">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded-xl border border-zaria-purple-200 px-3 py-2"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="text-sm text-zaria-purple-700 md:col-span-2">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded-xl border border-zaria-purple-200 px-3 py-2"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
      </div>

      {error ? <p className="mt-3 rounded-xl bg-zaria-gold-100 px-3 py-2 text-sm text-zaria-purple-900">{error}</p> : null}

      <button
        type="button"
        onClick={() => void submit()}
        disabled={busy}
        className="mt-4 rounded-xl bg-zaria-purple-700 px-4 py-2 font-semibold text-zaria-white transition hover:bg-zaria-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Processing..." : mode === "register" ? "Create Tenant" : "Sign In"}
      </button>
    </Panel>
  );
};
