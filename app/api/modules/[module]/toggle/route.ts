import { NextResponse } from "next/server";
import { ProjectState } from "../../../../lib/project-state";

export async function POST(
  _req: Request,
  ctx: { params: { module: string } }
) {
  const moduleId = (ctx.params.module || "").toLowerCase();
  const next = await ProjectState.toggleModule(moduleId);

  return NextResponse.json(next);
}

