import type { Metadata } from "next";
import PricingTierCard from "@/components/PricingTierCard";
import SectionCard from "@/components/SectionCard";

export const metadata: Metadata = {
  title: "Control",
  description:
    "ZARIA AI Control System - operational control framework for AI models.",
};

const tiers = [
  {
    tier: "CORE" as const,
    price: "$49/mo",
    description: "Module controls, baseline governance, and generation safeguards.",
    features: [
      "Module status controls",
      "Prompt-level policy checks",
      "Basic audit history",
    ],
  },
  {
    tier: "PRO" as const,
    price: "$149/mo",
    description: "Operational visibility and automated policy orchestration.",
    features: [
      "Advanced workflow orchestration",
      "Expanded memory scopes",
      "Priority export processing",
    ],
    featured: true,
  },
  {
    tier: "BLACK" as const,
    price: "Custom",
    description: "Enterprise-grade runtime, control planes, and support layers.",
    features: [
      "Custom compliance policies",
      "Dedicated deployment lanes",
      "Hands-on architecture support",
    ],
  },
];

export default function ControlPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(79,70,229,0.25),transparent_35%),radial-gradient(circle_at_100%_15%,rgba(251,191,36,0.12),transparent_33%),linear-gradient(180deg,#050913_0%,#0c1428_60%,#050913_100%)]">
      <section className="mx-auto w-full max-w-6xl px-6 pb-8 pt-20 sm:pt-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
            Control Suite
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            ZARIA AI Control System™
          </h1>
          <p className="mt-5 text-lg text-white/75">
            Operational Control Framework for AI Models
          </p>
          <button
            type="button"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Get Access
          </button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-8">
        <SectionCard
          title="Features Overview"
          description="Policy enforcement, runtime controls, activity tracking, and module-level governance for generated assets and operational flows."
        />
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Pricing Tiers</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {tiers.map((tier) => (
            <PricingTierCard key={tier.tier} {...tier} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-8">
        <SectionCard
          title="Testimonials"
          description="Placeholder for operator feedback, team adoption outcomes, and deployment velocity gains."
        />
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <SectionCard
          title="FAQ"
          description="Placeholder for onboarding, security posture, model connectors, support levels, and SLA coverage."
        />
      </section>
    </main>
  );
}
