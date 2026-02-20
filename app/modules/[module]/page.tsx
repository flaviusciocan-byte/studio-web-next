"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import PromptInput from "./PromptInput";

type Props = {
  params: { module: string };
};

const PREMIUM_MODULES = new Set([
  "kids",
  "parents",
  "zodiac-kids",
  "visual-mind",
  "numerologie",
  "zodiac",
  "motivational",
  "music",
  "antreprenor",
  "contabil",
  "bursa",
  "iq",
  "connect",
  "booking",
  "test-suprem",
  "recomandari",
  "shop",
  "memory-layer",
  "agents",
  "api-gateway",
]);

export default function ModulePage({ params }: Props) {
  const moduleId = (params.module || "").toLowerCase();
  const isPremium = PREMIUM_MODULES.has(moduleId);

  const [isActive, setIsActive] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects"> | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectSort, setProjectSort] = useState<"newest" | "oldest">("newest");
  const [showExport, setShowExport] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const ownerId = "demo-owner";
  const actorId = ownerId;

  const createProject = useMutation(api.projects.createProject);
  const deleteProject = useMutation(api.projects.deleteProject);
  const addChangelog = useMutation(api.changelog.addChangelog);
  const importProjectJson = useMutation(api.projects.importProjectJson);
  const duplicateProject = useMutation(api.projects.duplicateProject);

  const projects = useQuery(api.projects.listProjects, { ownerId });
  const changelog = useQuery(api.changelog.listChangelog);
  const auditLogs = useQuery(api.audit.listAudit);

  const exportData = useQuery(
    api.projects.exportProjectJson,
    selectedProjectId ? { projectId: selectedProjectId } : "skip",
  );

  const sortedProjects = useMemo(() => {
    if (projects === undefined) return undefined;

    const filtered =
      projectSearch.trim() === ""
        ? projects
        : projects.filter((project) =>
            project.name.toLowerCase().includes(projectSearch.trim().toLowerCase()),
          );

    return [...filtered].sort((a, b) =>
      projectSort === "newest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt,
    );
  }, [projectSearch, projectSort, projects]);

  async function handleToggleModule() {
    if (isToggling) return;

    setIsToggling(true);
    try {
      const response = await fetch(`/api/modules/${moduleId}/toggle`, {
        method: "POST",
      });
      const data = (await response.json()) as { active?: boolean };
      setIsActive(Boolean(data.active));
    } catch (error) {
      console.error(error);
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <div className="zaria-shell">
      <div className="zaria-card">
        <div className="zaria-module-header">
          <div className="zaria-module-title">
            <span className={`zaria-badge ${isPremium ? "premium" : "free"}`}>
              {isPremium ? "PREMIUM" : "FREE"}
            </span>
            <h1 className="zaria-h1">
              {moduleId
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </h1>
          </div>

          <button
            className={isActive ? "zaria-btn zaria-btn-danger" : "zaria-btn zaria-btn-primary"}
            type="button"
            disabled={isToggling}
            onClick={() => {
              void handleToggleModule();
            }}
          >
            {isToggling ? "Updating..." : isActive ? "Deactivate" : "Activate"}
          </button>
        </div>

        <div className="zaria-module-body">
          <div className="zaria-kicker">Status</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>
            {isActive ? "Active" : "Inactive"}
          </div>

          <div className="zaria-kicker">Projects</div>
          <input
            type="text"
            placeholder="Search projects..."
            value={projectSearch}
            onChange={(event) => setProjectSearch(event.target.value)}
            style={{ marginBottom: 12 }}
          />
          <select
            value={projectSort}
            onChange={(event) => setProjectSort(event.target.value as "newest" | "oldest")}
            style={{ marginBottom: 12 }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <button
            className="zaria-btn zaria-btn-primary"
            onClick={() => {
              const count = projects?.length ?? 0;
              const name = `New project #${count + 1}`;
              void createProject({ name, ownerId });
            }}
            type="button"
            style={{ marginBottom: 12 }}
          >
            Create project
          </button>

          {projects === undefined ? (
            <div style={{ marginBottom: 14 }}>Loading projects...</div>
          ) : projects.length === 0 ? (
            <div style={{ marginBottom: 14 }}>No projects yet</div>
          ) : (
            <ul style={{ marginBottom: 14 }}>
              {(sortedProjects ?? []).map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setShowExport(false);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {project.name} - {project.status}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="zaria-result" style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Import JSON</div>
            <textarea
              placeholder="Paste project JSON here..."
              value={importJson}
              onChange={(event) => setImportJson(event.target.value)}
              style={{ width: "100%", minHeight: 140, marginBottom: 10 }}
            />
            <button
              className="zaria-btn zaria-btn-primary"
              type="button"
              disabled={isImporting || importJson.trim() === ""}
              onClick={async () => {
                if (isImporting || importJson.trim() === "") return;

                let parsed: unknown;
                try {
                  parsed = JSON.parse(importJson);
                } catch {
                  console.error("Invalid import payload");
                  return;
                }

                if (
                  !parsed ||
                  typeof parsed !== "object" ||
                  !("project" in parsed) ||
                  !("pages" in parsed) ||
                  !("components" in parsed)
                ) {
                  console.error("Invalid import payload");
                  return;
                }

                setIsImporting(true);
                try {
                  await importProjectJson({ payload: importJson, actorId });
                  setImportJson("");
                } catch (error) {
                  console.error(error);
                } finally {
                  setIsImporting(false);
                }
              }}
            >
              Import
            </button>
          </div>

          {selectedProjectId && projects ? (
            (() => {
              const selectedProject = projects.find(
                (project) => project.id === selectedProjectId,
              );
              if (!selectedProject) return null;

              return (
                <div className="zaria-result" style={{ marginBottom: 14 }}>
                  <div>Project: {selectedProject.name}</div>
                  <div>Status: {selectedProject.status}</div>
                  <div>Created: {selectedProject.createdAt}</div>
                  <button
                    className="zaria-btn zaria-btn-danger"
                    onClick={async () => {
                      if (!selectedProjectId) return;
                      await deleteProject({ projectId: selectedProjectId, actorId });
                      setSelectedProjectId(null);
                    }}
                    type="button"
                    style={{ marginTop: 10 }}
                  >
                    Delete
                  </button>
                  <button
                    className="zaria-btn"
                    onClick={async () => {
                      if (!selectedProjectId) return;
                      await duplicateProject({ projectId: selectedProjectId, actorId });
                    }}
                    type="button"
                    style={{ marginTop: 10, marginLeft: 8 }}
                  >
                    Duplicate
                  </button>
                  <button
                    className="zaria-btn"
                    type="button"
                    onClick={() => setShowExport((current) => !current)}
                    style={{ marginTop: 10, marginLeft: 8 }}
                  >
                    Export JSON
                  </button>
                  {showExport ? (
                    exportData === undefined ? (
                      <div style={{ marginTop: 10 }}>Loading export...</div>
                    ) : (
                      <pre style={{ marginTop: 10 }}>
                        {JSON.stringify(exportData, null, 2)}
                      </pre>
                    )
                  ) : null}
                </div>
              );
            })()
          ) : null}

          <div className="zaria-result" style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Changelog</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Add a changelog entry..."
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
              />
              <button
                className="zaria-btn zaria-btn-primary"
                type="button"
                disabled={isAdding || newMessage.trim() === ""}
                onClick={async () => {
                  const message = newMessage.trim();
                  if (isAdding || !message) return;

                  setIsAdding(true);
                  try {
                    await addChangelog({ message, actorId });
                    setNewMessage("");
                  } finally {
                    setIsAdding(false);
                  }
                }}
              >
                {isAdding ? "Adding..." : "Add changelog"}
              </button>
            </div>

            {changelog === undefined ? (
              <div>Loading changelog...</div>
            ) : changelog.length === 0 ? (
              <div>No changelog yet</div>
            ) : (
              <ul>
                {changelog.map((entry) => (
                  <li key={entry.id}>
                    [{new Date(entry.createdAt).toLocaleString()}] {entry.message}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="zaria-result" style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Audit Log</div>
            {auditLogs === undefined ? (
              <div>Loading audit...</div>
            ) : auditLogs.length === 0 ? (
              <div>No audit yet</div>
            ) : (
              <ul>
                {auditLogs.map((entry) => (
                  <li key={entry.id}>
                    [{new Date(entry.createdAt).toLocaleString()}] {entry.action} {entry.entityType}:
                    {entry.entityId} (actor: {entry.actorId})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="zaria-kicker">Scope</div>
          <p className="zaria-muted" style={{ maxWidth: 720 }}>
            Real AI module. Produces deployable artifacts (code, routes, configs)
            from versioned blocks. No demos—production output.
          </p>

          <PromptInput key={moduleId} moduleId={moduleId} />
        </div>
      </div>
    </div>
  );
}
