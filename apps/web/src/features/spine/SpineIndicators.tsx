import { deriveSpineProfile, spineScore, type SpineMetrics } from "@zaria/shared";
import { Panel } from "../../components/Panel";

interface SpineIndicatorsProps {
  metrics: SpineMetrics;
  onChange: (metrics: SpineMetrics) => void;
}

const MetricSlider = ({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) => (
  <label className="block rounded-2xl border border-zaria-purple-100 bg-zaria-purple-50/80 p-3">
    <div className="mb-2 flex items-center justify-between text-sm font-semibold text-zaria-purple-700">
      <span>{label}</span>
      <span className="rounded-full bg-zaria-white px-2 py-0.5 text-zaria-purple-800">{value}</span>
    </div>
    <input
      type="range"
      min={0}
      max={100}
      step={1}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zaria-purple-200"
    />
  </label>
);

export const SpineIndicators = ({ metrics, onChange }: SpineIndicatorsProps) => {
  const profile = deriveSpineProfile(metrics);

  return (
    <Panel title="ZARIA Spine" subtitle="Layout adaptation using AD, PM, ESI metrics">
      <div className="grid gap-3">
        <MetricSlider
          label="Activation Depth (AD)"
          value={metrics.ad}
          onChange={(ad) => onChange({ ...metrics, ad })}
        />
        <MetricSlider
          label="Progress Momentum (PM)"
          value={metrics.pm}
          onChange={(pm) => onChange({ ...metrics, pm })}
        />
        <MetricSlider
          label="Emotional Signal Index (ESI)"
          value={metrics.esi}
          onChange={(esi) => onChange({ ...metrics, esi })}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-zaria-gold-300 bg-zaria-gold-100 p-4">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zaria-purple-700">Spine Score</p>
        <p className="font-display text-3xl text-zaria-purple-900">{spineScore(metrics)}</p>
        <p className="mt-2 text-sm text-zaria-purple-800">
          Density: {profile.density} • Rhythm: {profile.rhythm} • Emotional mode: {profile.emotionalMode}
        </p>
      </div>
    </Panel>
  );
};
