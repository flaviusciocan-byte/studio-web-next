# ZARIA Builder – PRD + Architecture v0.1

## Scope (MVP vs V1 vs V2)

| Area | MVP | V1 | V2 |
| --- | --- | --- | --- |
| Builder UI | Core editor, prompt + generate | Multi-page, templates | Marketplace modules |
| Runtime | Basic render + deploy | Versioned runtime | Multi-tenant runtime |
| Integrations | Minimal webhooks | Core apps (PostHog/Ghost/AppFlowy) | Extended integrations |
| Deploy | Manual deploy | Automated deploy | Multi-region deploy |
| Analytics | Basic events | Full dashboards | Advanced attribution |
| Security | Basic auth | RBAC | Enterprise SSO |

## Architecture Overview

```
Browser/UI
   |
   v
Builder UI (Next.js)
   |
   v
Convex (Builder Engine + Data)
   |
   +--> Runtime (Artifacts + Deploy)
   +--> Integrations (PostHog/Ghost/AppFlowy)
   +--> Analytics (Events + Metrics)
   +--> Security (RBAC + Audit)
```

- Frontend: Next.js app shell + module builder UI
- Builder Engine: Convex functions as source of truth
- Runtime: versioned artifacts, deployable output
- Integrations: consumer-only (PostHog/Ghost/AppFlowy)
- Deploy: artifacts to runtime targets
- Analytics: event ingestion + reporting
- Security: RBAC, audit, access controls

## Module Map

- Builder UI: prompts, component assembly, previews
- Project Runtime: render/serve generated artifacts
- Integrations Hub: outbound connectors and configs
- Deploy Hub: build + deploy pipeline
- Auth/RBAC: user roles, permissions, access control
- Marketplace: templates/modules distribution

## Data Model (Convex)

- Projects: id, name, ownerId, status, createdAt
- Pages: id, projectId, name, route, version
- Components: id, pageId, type, props, order
- Deployments: id, projectId, target, status, createdAt
- Integrations: id, projectId, provider, config
- Users: id, email, name, createdAt
- Roles: id, name, permissions
- AuditLogs: id, actorId, action, entity, createdAt

## API Contracts

```ts
// 1) Create project
type CreateProjectInput = { name: string; ownerId: string };
type CreateProjectOutput = { projectId: string };

// 2) Generate module artifacts
type GenerateInput = { projectId: string; moduleId: string; prompt: string };
type GenerateOutput = { result: string; version: string };

// 3) Publish deployment
type DeployInput = { projectId: string; version: string; target: string };
type DeployOutput = { deploymentId: string; status: "queued" | "success" | "failed" };

// 4) Update integration
type UpdateIntegrationInput = { projectId: string; provider: string; config: Record<string, unknown> };
type UpdateIntegrationOutput = { integrationId: string };

// 5) Audit log query
type AuditLogQueryInput = { projectId: string; since?: number; limit?: number };
type AuditLogQueryOutput = { items: Array<{ action: string; actorId: string; createdAt: number }> };
```

## Non-Functional Requirements

- Security: least privilege, RBAC, audit trails, secret handling
- Scalability: horizontal scaling for Convex functions and runtime
- Observability: structured logs, traces, and metrics for generate/deploy

## Milestones

1) MVP Builder UI
   - [ ] Prompt input + generate response
   - [ ] Basic module view
   - [ ] Convex storage for generations
2) MVP Runtime
   - [ ] Render static output
   - [ ] Basic deploy target
3) Integrations v1
   - [ ] PostHog consumer
   - [ ] Ghost consumer
   - [ ] AppFlowy consumer
4) Auth/RBAC v1
   - [ ] Roles defined
   - [ ] Route protection
5) Deploy v1
   - [ ] Build pipeline
   - [ ] Versioned releases
6) Analytics v1
   - [ ] Event collection
   - [ ] Dashboard view

## Differentiators

- AI: deterministic, versioned outputs per prompt
  - Acceptance: same prompt + inputs => same artifact hash
- Testing automation: generated tests for each artifact
  - Acceptance: generated test suite passes in CI for every deploy
- White-label: full branding + domain override
  - Acceptance: customer branding replaces all UI tokens and URLs

## Input (verbatim)

```
[INCLUDE EXACT TEXT FROM USER MESSAGE HERE — păstrează toate punctele 1–8 + diferențiatori]
```
