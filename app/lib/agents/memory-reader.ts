type MemoryQueryIntent =
  | "spec"
  | "decisions"
  | "artifacts"
  | "logs"
  | "general";

type MemoryReadPlan = {
  shouldRead: boolean;
  intent: MemoryQueryIntent;
  scope: "user" | "project" | "module" | "global";
  scopeId: string;
  topK: number;
  query: string;
};

/**
 * Agent: Memory Reader (policy-only)
 * – nu cheamă modele LLM
 * – nu face I/O
 * – doar decide: când să citească, ce scope, ce topK, ce query
 */
export function planMemoryRead(params: {
  userId?: string;
  projectId?: string;
  moduleId?: string;
  task: string; // ce vrea userul / agentul să facă acum
}): MemoryReadPlan {
  const task = (params.task || "").trim();
  const t = task.toLowerCase();

  // Heuristic gates (strict, predictable)
  const triggers = [
    "resume",
    "recall",
    "what did we decide",
    "previous",
    "context",
    "spec",
    "requirements",
    "contract",
    "tokens",
    "schema",
    "endpoint",
    "api",
    "bug",
    "error",
    "fix",
    "commit",
    "turso",
    "vector",
    "memory",
  ];

  const shouldRead = triggers.some((k) => t.includes(k));
  if (!shouldRead) {
    return {
      shouldRead: false,
      intent: "general",
      scope: "project",
      scopeId: params.projectId || "default",
      topK: 0,
      query: "",
    };
  }

  // Intent classification (simple, deterministic)
  let intent: MemoryQueryIntent = "general";
  if (t.includes("spec") || t.includes("requirements") || t.includes("contract")) intent 
= "spec";
  else if (t.includes("decide") || t.includes("decision")) intent = "decisions";
  else if (t.includes("artifact") || t.includes("file") || t.includes("schema") || 
t.includes("endpoint")) intent = "artifacts";
  else if (t.includes("error") || t.includes("bug") || t.includes("fix") || 
t.includes("commit")) intent = "logs";

  // Scope routing
  let scope: "user" | "project" | "module" | "global" = "project";
  let scopeId = params.projectId || "default";

  if (params.moduleId && (t.includes("module") || 
t.includes(params.moduleId.toLowerCase()))) {
    scope = "module";
    scopeId = params.moduleId;
  } else if (t.includes("my") || t.includes("user")) {
    scope = "user";
    scopeId = params.userId || "default";
  }

  // topK policy
  const topK = intent === "spec" ? 8 : intent === "logs" ? 6 : 5;

  // Query: compress task into retrieval string (no LLM)
  const query = task.length > 300 ? task.slice(0, 300) : task;

  return { shouldRead: true, intent, scope, scopeId, topK, query };
}

