import { NextRequest, NextResponse } from "next/server";
import { ProjectState } from "../../../../lib/project-state";

type RouteContext = {
  params: Promise<{ module: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  const { module } = await context.params;
  const moduleId = (module || "").toLowerCase();
  const nextState = await ProjectState.toggleModule(moduleId);

  return NextResponse.json(nextState);
}
