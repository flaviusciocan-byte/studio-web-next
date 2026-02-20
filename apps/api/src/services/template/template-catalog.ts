import type { TemplateSpec } from "@zaria/shared";

export const zariaSystemTemplates: TemplateSpec[] = [
  {
    id: "zaria-imperial",
    name: "ZARIA Imperial",
    description: "High-contrast editorial hierarchy for premium books and manuals.",
    typography: {
      headingFont: "Playfair Display",
      bodyFont: "Source Serif 4",
      monoFont: "IBM Plex Mono"
    },
    palette: {
      white: "#FFFFFF",
      purple: "#5B2ABF",
      purpleDeep: "#3A177C",
      gold: "#D4AF37"
    },
    coverStyle: "monolith",
    pageStyle: "classic"
  },
  {
    id: "zaria-lumiere",
    name: "ZARIA Lumiere",
    description: "Elegant readability tuned for mid-range AD/PM flow.",
    typography: {
      headingFont: "Cormorant Garamond",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono"
    },
    palette: {
      white: "#FFFFFF",
      purple: "#7444D6",
      purpleDeep: "#4A2496",
      gold: "#E0B95A"
    },
    coverStyle: "crest",
    pageStyle: "editorial"
  },
  {
    id: "zaria-vanguard",
    name: "ZARIA Vanguard",
    description: "Dense and kinetic composition for tactical courses and bundles.",
    typography: {
      headingFont: "Manrope",
      bodyFont: "Lora",
      monoFont: "Fira Code"
    },
    palette: {
      white: "#FFFFFF",
      purple: "#632FD1",
      purpleDeep: "#2E1167",
      gold: "#C9A227"
    },
    coverStyle: "minimal",
    pageStyle: "edge"
  }
];

export const systemTemplateById = (templateId: string): TemplateSpec | undefined =>
  zariaSystemTemplates.find((template) => template.id === templateId);
