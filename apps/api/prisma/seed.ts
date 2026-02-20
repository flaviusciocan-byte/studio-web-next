import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const systemTemplates = [
  {
    key: "zaria-imperial",
    name: "ZARIA Imperial",
    description: "Premium editorial structure with assertive hierarchy.",
    config: {
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
    }
  },
  {
    key: "zaria-lumiere",
    name: "ZARIA Lumiere",
    description: "Airy composition optimized for calm reading momentum.",
    config: {
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
    }
  },
  {
    key: "zaria-vanguard",
    name: "ZARIA Vanguard",
    description: "Dense and energetic composition for high activation flows.",
    config: {
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
  }
];

const run = async (): Promise<void> => {
  for (const template of systemTemplates) {
    await prisma.template.upsert({
      where: { key: template.key },
      update: {
        name: template.name,
        description: template.description,
        config: template.config,
        isSystem: true
      },
      create: {
        key: template.key,
        name: template.name,
        description: template.description,
        config: template.config,
        isSystem: true
      }
    });
  }
};

run()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    // The process must fail in CI when seed fails.
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
