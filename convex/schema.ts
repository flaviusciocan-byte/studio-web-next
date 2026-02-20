import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  generations: defineTable({
    moduleId: v.string(),
    prompt: v.string(),
    result: v.string(),
    createdAt: v.number(),
  }).index("by_module_createdAt", ["moduleId", "createdAt"]),

  projects: defineTable({
    name: v.string(),
    ownerId: v.string(),
    status: v.string(),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_createdAt", ["createdAt"]),

  pages: defineTable({
    logicalId: v.optional(v.string()),
    projectId: v.id("projects"),
    name: v.string(),
    route: v.string(),
    version: v.string(),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_createdAt", ["projectId", "createdAt"]),

  components: defineTable({
    logicalId: v.optional(v.string()),
    pageId: v.id("pages"),
    type: v.string(),
    props: v.any(),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_page", ["pageId"])
    .index("by_page_order", ["pageId", "order"]),

  deployments: defineTable({
    logicalId: v.optional(v.string()),
    projectId: v.id("projects"),
    target: v.string(),
    status: v.string(),
    version: v.string(),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_createdAt", ["createdAt"]),

  integrations: defineTable({
    logicalId: v.optional(v.string()),
    projectId: v.id("projects"),
    provider: v.string(),
    config: v.any(),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_provider", ["provider"]),

  users: defineTable({
    logicalId: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_createdAt", ["createdAt"]),

  roles: defineTable({
    logicalId: v.optional(v.string()),
    name: v.string(),
    permissions: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_createdAt", ["createdAt"]),

  auditLogs: defineTable({
    projectId: v.optional(v.id("projects")),
    actorId: v.string(),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    createdAt: v.number(),
  })
    .index("by_actor", ["actorId"])
    .index("by_project_createdAt", ["projectId", "createdAt"]),

  changelog: defineTable({
    message: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});
