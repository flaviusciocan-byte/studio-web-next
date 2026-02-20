import type { SpineMetrics } from "@zaria/shared";
import { deriveSpineProfile, spineScore } from "@zaria/shared";

export const describeSpine = (metrics: SpineMetrics): {
  score: number;
  profile: ReturnType<typeof deriveSpineProfile>;
  guidance: string;
} => {
  const profile = deriveSpineProfile(metrics);
  const score = spineScore(metrics);

  const guidance =
    profile.density === "dense"
      ? "Compact visual rhythm with stronger hierarchy and tighter line cadence."
      : profile.density === "balanced"
        ? "Balanced page rhythm optimized for long-form comprehension."
        : "Expanded spacing profile for reflective and low-friction reading.";

  return { score, profile, guidance };
};
