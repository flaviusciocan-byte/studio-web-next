type PricingTierCardProps = {
  tier: "CORE" | "PRO" | "BLACK";
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
};

export default function PricingTierCard({
  tier,
  price,
  description,
  features,
  featured = false,
}: PricingTierCardProps) {
  return (
    <article
      className={`rounded-2xl border p-6 backdrop-blur-md transition ${
        featured
          ? "border-amber-300/50 bg-amber-100/10 shadow-[0_0_40px_rgba(251,191,36,0.16)]"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
        {tier}
      </div>
      <div className="mt-3 text-3xl font-semibold text-white">{price}</div>
      <p className="mt-3 text-sm leading-relaxed text-white/70">{description}</p>

      <ul className="mt-5 space-y-2 text-sm text-white/80">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-white/70" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
