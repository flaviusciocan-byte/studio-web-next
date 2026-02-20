# ZARIA Builder API Reference

## Base URL
- `http://localhost:8080`

## Authentication
- JWT bearer token in `Authorization: Bearer <token>`
- Tenant isolation via `x-tenant-id: <tenantId>`
- Optional API key support through `x-api-key: <apiKeyId.secret>`

## Rate Limits
- Global API limit: controlled by `API_RATE_LIMIT_WINDOW_MS` and `API_RATE_LIMIT_MAX`
- Export limit: controlled by `EXPORT_RATE_LIMIT_MAX`

## Core v1 Endpoints

### Auth
1. `POST /v1/auth/register`
2. `POST /v1/auth/login`
3. `POST /v1/auth/api-keys`

### Templates
1. `GET /v1/templates`
2. `POST /v1/templates`
- Creates tenant-level custom templates while preserving the system catalog.

### Documents (Input + Processing)
1. `POST /v1/documents`
- Accepts raw, structured, imported-reference, and copywriter-origin text.

2. `POST /v1/documents/import`
- Accepts file upload (`text/plain`, `text/markdown`, `application/json`).

3. `GET /v1/documents`
4. `GET /v1/documents/:documentId`
5. `POST /v1/documents/:documentId/process`
- Runs normalization, chapter detection, hierarchy creation, metadata extraction, TOC generation, and layout synthesis.

6. `PATCH /v1/documents/:documentId/spine`
- Updates AD/PM/ESI metrics and invalidates prior processing digest.

### Exports
1. `POST /v1/exports/:documentId`
- `format`: `pdf | epub | docx | bundle`
- `includeFormats` for bundle (array of `pdf`, `epub`, `docx`)
- Optional runtime Spine override.

2. `GET /v1/exports/:exportId`
3. `GET /v1/exports/:exportId/download`

### Webhooks
1. `GET /v1/webhooks`
2. `POST /v1/webhooks`
3. `GET /v1/webhooks/deliveries`
4. `DELETE /v1/webhooks/:endpointId`

### Spine
1. `POST /v1/spine/evaluate`
- Returns derived density/rhythm/emotional profile and weighted score.

### Tenant
1. `GET /v1/tenants/me`
- Tenant profile, feature flags, and usage counters.

2. `PATCH /v1/tenants/features/:module`
- Feature flag management for module-level controls.

## Compatibility Bridge Endpoints

These routes preserve legacy client compatibility while using the new engine internals.

1. `POST /api/modules/:module/toggle`
- Legacy module toggle endpoint, persisted as tenant feature flags.

2. `POST /api/memory/search`
- Legacy memory search endpoint, backed by document corpus.

3. `POST /api/ollama/generate`
- Compatibility transformation endpoint.
- Does not generate new text.
- Returns structured result from the processing engine.

## OpenAPI
- Source file: `apps/api/openapi/openapi.yaml`
- Served at: `GET /v1/openapi/openapi.yaml`
