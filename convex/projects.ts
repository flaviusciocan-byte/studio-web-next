import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

export const createProject = mutation({
  args: {
    name: v.string(),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      ownerId: args.ownerId,
      status: "draft",
      createdAt: now,
    });

    await ctx.db.insert("auditLogs", {
      actorId: args.ownerId,
      action: "project.create",
      entityType: "project",
      entityId: projectId,
      createdAt: now,
    });

    return { projectId };
  },
});

export const listProjects = query({
  args: {
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .order("desc")
      .collect();

    return projects.map((project) => ({
      id: project._id,
      name: project.name,
      status: project.status,
      createdAt: project.createdAt,
    }));
  },
});

export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
    actorId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.projectId);
    await ctx.db.insert("auditLogs", {
      actorId: args.actorId,
      action: "project.delete",
      entityType: "project",
      entityId: args.projectId,
      createdAt: Date.now(),
    });
    return null;
  },
});

export const exportProjectJson = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const pages = await ctx.db
      .query("pages")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const components = (
      await Promise.all(
        pages.map((page) =>
          ctx.db
            .query("components")
            .withIndex("by_page", (q) => q.eq("pageId", page._id))
            .collect(),
        ),
      )
    ).flat();

    return {
      project,
      pages,
      components,
    };
  },
});

export const importProjectJson = mutation({
  args: {
    payload: v.string(),
    actorId: v.string(),
  },
  handler: async (ctx, args) => {
    let parsed: {
      project?: Record<string, unknown>;
      pages?: Array<Record<string, unknown>>;
      components?: Array<Record<string, unknown>>;
    };

    try {
      parsed = JSON.parse(args.payload) as {
        project?: Record<string, unknown>;
        pages?: Array<Record<string, unknown>>;
        components?: Array<Record<string, unknown>>;
      };
    } catch {
      throw new Error("Invalid JSON payload");
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.project ||
      !Array.isArray(parsed.pages) ||
      !Array.isArray(parsed.components)
    ) {
      throw new Error("Invalid payload shape");
    }

    const now = Date.now();
    const project = parsed.project as {
      name?: string;
    };

    const projectId = await ctx.db.insert("projects", {
      name: `${project.name ?? "Project"} (imported)`,
      ownerId: args.actorId,
      status: "draft",
      createdAt: now,
    });

    const pageIdMap = new Map<string, Id<"pages">>();

    const toKey = (value: unknown) => {
      if (typeof value === "string") return value;
      if (value && typeof (value as { toString: () => string }).toString === "function") {
        return (value as { toString: () => string }).toString();
      }
      return "";
    };

    for (const page of parsed.pages) {
      const pageRecord = page as {
        _id?: unknown;
        id?: unknown;
        logicalId?: string;
        name?: string;
        route?: string;
        version?: string;
        createdAt?: number;
      };

      const newPageId = await ctx.db.insert("pages", {
        logicalId: pageRecord.logicalId ?? "",
        projectId,
        name: pageRecord.name ?? "Untitled",
        route: pageRecord.route ?? "/",
        version: pageRecord.version ?? "v1",
        createdAt: pageRecord.createdAt ?? now,
      });

      const key = toKey(pageRecord._id ?? pageRecord.id ?? pageRecord.logicalId ?? "");
      if (key) {
        pageIdMap.set(key, newPageId);
      }
    }

    for (const component of parsed.components) {
      const componentRecord = component as {
        logicalId?: string;
        pageId?: unknown;
        type?: string;
        props?: unknown;
        order?: number;
        createdAt?: number;
      };

      const pageKey = toKey(componentRecord.pageId);
      const mappedPageId = pageIdMap.get(pageKey);
      if (!mappedPageId) {
        throw new Error("Invalid component page reference");
      }

      await ctx.db.insert("components", {
        logicalId: componentRecord.logicalId ?? "",
        pageId: mappedPageId,
        type: componentRecord.type ?? "unknown",
        props: componentRecord.props ?? {},
        order: componentRecord.order ?? 0,
        createdAt: componentRecord.createdAt ?? now,
      });
    }

    await ctx.db.insert("auditLogs", {
      actorId: args.actorId,
      action: "project.import",
      entityType: "project",
      entityId: projectId,
      createdAt: now,
    });

    return projectId;
  },
});

export const duplicateProject = mutation({
  args: {
    projectId: v.id("projects"),
    actorId: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const pages = await ctx.db
      .query("pages")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const components = (
      await Promise.all(
        pages.map((page) =>
          ctx.db
            .query("components")
            .withIndex("by_page", (q) => q.eq("pageId", page._id))
            .collect(),
        ),
      )
    ).flat();

    const now = Date.now();

    const newProjectId = await ctx.db.insert("projects", {
      name: `${project.name} (copy)`,
      ownerId: args.actorId,
      status: "draft",
      createdAt: now,
    });

    const pageIdMap = new Map<string, Id<"pages">>();
    for (const page of pages) {
      const newPageId = await ctx.db.insert("pages", {
        logicalId: page.logicalId,
        projectId: newProjectId,
        name: page.name,
        route: page.route,
        version: page.version,
        createdAt: page.createdAt,
      });
      pageIdMap.set(page._id, newPageId);
    }

    for (const component of components) {
      const mappedPageId = pageIdMap.get(component.pageId);
      if (!mappedPageId) {
        throw new Error("Invalid component page reference");
      }

      await ctx.db.insert("components", {
        logicalId: component.logicalId,
        pageId: mappedPageId,
        type: component.type,
        props: component.props,
        order: component.order,
        createdAt: component.createdAt,
      });
    }

    await ctx.db.insert("auditLogs", {
      actorId: args.actorId,
      action: "project.duplicate",
      entityType: "project",
      entityId: newProjectId,
      createdAt: now,
    });

    return newProjectId;
  },
});
