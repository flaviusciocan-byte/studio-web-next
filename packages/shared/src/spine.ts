import type { LayoutHints, SpineMetrics } from "./types.js";

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const normalize = (value: number): number => clamp(value, 0, 100) / 100;

export interface SpineProfile {
  density: "light" | "balanced" | "dense";
  rhythm: "measured" | "steady" | "kinetic";
  emotionalMode: "calm" | "warm" | "intense";
  layout: LayoutHints;
}

export const deriveSpineProfile = (metrics: SpineMetrics): SpineProfile => {
  const ad = normalize(metrics.ad);
  const pm = normalize(metrics.pm);
  const esi = normalize(metrics.esi);

  const bodyFontSize = 10.5 + (1 - ad) * 2;
  const headingScale = 1.22 + pm * 0.35;
  const lineHeight = 1.35 + (1 - pm) * 0.3;
  const paragraphSpacing = 10 + (1 - ad) * 8 + esi * 4;
  const margin = 48 - pm * 10;

  return {
    density: ad > 0.67 ? "dense" : ad > 0.34 ? "balanced" : "light",
    rhythm: pm > 0.67 ? "kinetic" : pm > 0.34 ? "steady" : "measured",
    emotionalMode: esi > 0.67 ? "intense" : esi > 0.34 ? "warm" : "calm",
    layout: {
      pageSize: "A4",
      bodyFontSize: Number(bodyFontSize.toFixed(2)),
      headingScale: Number(headingScale.toFixed(2)),
      lineHeight: Number(lineHeight.toFixed(2)),
      paragraphSpacing: Number(paragraphSpacing.toFixed(2)),
      margin: Number(margin.toFixed(2)),
      accentWeight: esi > 70 ? "bold" : esi > 35 ? "balanced" : "subtle"
    }
  };
};

export const spineScore = (metrics: SpineMetrics): number => {
  const weighted = metrics.ad * 0.35 + metrics.pm * 0.4 + metrics.esi * 0.25;
  return Number(clamp(weighted, 0, 100).toFixed(2));
};
