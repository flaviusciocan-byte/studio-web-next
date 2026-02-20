import { NextRequest, NextResponse } from "next/server";

type FactoryOutput = {
  title: string;
  positioning: string;
  pdfStructure: string[];
  gumroadDescription: string;
  digistoreDescription: string;
  marketingBullets: string[];
  socialPosts: string[];
};

function createFactoryOutput(topic: string, moduleId: string): FactoryOutput {
  const normalized = topic.replace(/\s+/g, " ").trim();
  const shortTopic = normalized.slice(0, 120);

  return {
    title: `${shortTopic} - ZARIA Text Edition Blueprint`,
    positioning:
      `A premium text-first digital product around "${shortTopic}" designed for high-clarity delivery and rapid monetization.`,
    pdfStructure: [
      "1. Cover + promise",
      "2. Reader outcome and positioning",
      "3. Core framework (3-5 pillars)",
      "4. Action checklist",
      "5. Templates and prompts",
      "6. Implementation roadmap (7-30 days)",
      "7. Offer + next-step CTA",
    ],
    gumroadDescription:
      `Built with module ${moduleId}. This product gives practical implementation steps for ${shortTopic}, packaged as a premium text asset ready to sell.`,
    digistoreDescription:
      `Text Edition package for ${shortTopic}: clear structure, execution steps, and monetization-ready messaging for immediate publishing.`,
    marketingBullets: [
      "Execution-first framework with no filler",
      "Fast-to-publish structure",
      "Conversion-oriented positioning",
      "Repurposable snippets for social channels",
      "Clear CTA path for upsells and bundles",
    ],
    socialPosts: [
      `I just turned ${shortTopic} into a premium text product using ZARIA Builder - Text Edition.`,
      `From idea to structured digital asset in one workflow: ${shortTopic}.`,
      `Shipping ${shortTopic} as a production-ready PDF/EPUB/DOCX bundle this week.`,
    ],
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const topic = String(body?.topic ?? "").trim();
  const moduleId = String(body?.moduleId ?? "builder-core").trim().toLowerCase();

  if (!topic) {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }

  const output = createFactoryOutput(topic, moduleId || "builder-core");

  return NextResponse.json(
    {
      status: "generated",
      version: "zaria-builder-text-edition-v1",
      output,
    },
    { status: 200 },
  );
}
