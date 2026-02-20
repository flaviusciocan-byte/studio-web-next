# ZARIA Builder - Text Edition

API-first, modular platform that transforms source text into premium digital products (PDF, EPUB, DOCX, bundles) with AD/PM/ESI-driven layout adaptation.

## Architecture

- `apps/api`: Express API Gateway + Processing Layer + Export Engine + Template Engine + Spine Integration.
- `apps/web`: React + Tailwind UI (editor, template gallery, preview, export panel, Spine indicators).
- `packages/shared`: Cross-package types, schemas, and Spine profile logic.
- `docs`: API and deployment documentation.

## Folder Structure

```text
.
├── apps
│   ├── api
│   │   ├── openapi
│   │   │   └── openapi.yaml
│   │   ├── prisma
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── src
│   │   │   ├── config
│   │   │   ├── middleware
│   │   │   ├── modules
│   │   │   │   ├── auth
│   │   │   │   ├── documents
│   │   │   │   ├── exports
│   │   │   │   ├── health
│   │   │   │   ├── spine
│   │   │   │   ├── templates
│   │   │   │   └── webhooks
│   │   │   ├── services
│   │   │   │   ├── export
│   │   │   │   ├── processing
│   │   │   │   ├── spine
│   │   │   │   └── template
│   │   │   ├── types
│   │   │   ├── utils
│   │   │   ├── app.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web
│       ├── src
│       │   ├── api
│       │   ├── components
│       │   ├── features
│       │   │   ├── auth
│       │   │   ├── editor
│       │   │   ├── exports
│       │   │   ├── preview
│       │   │   ├── spine
│       │   │   └── templates
│       │   ├── layout
│       │   ├── styles
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── index.html
│       ├── package.json
│       ├── postcss.config.cjs
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── vite.config.ts
├── packages
│   └── shared
│       ├── src
│       │   ├── index.ts
│       │   ├── spine.ts
│       │   ├── types.ts
│       │   └── validation.ts
│       ├── package.json
│       └── tsconfig.json
├── docs
│   ├── api-reference.md
│   └── deployment.md
├── docker-compose.yml
├── package.json
├── tsconfig.base.json
└── .env.example
```

## Core Modules

### Input Layer
- Raw/structured/imported/copywriter input support (`/v1/documents`, `/v1/documents/import`).
- Strong schema validation using `zod` shared contracts.

### Processing Layer
- Text normalization
- Chapter detection and heading hierarchy
- Metadata extraction
- TOC generation
- Spine-adaptive layout hints

### Export Engine
- PDF (vector-based via `pdf-lib`)
- EPUB 3 (valid package + nav + OPF)
- DOCX (OpenXML via `docx`)
- Bundle ZIP with manifest and checksums

### Template System
- ZARIA Ultra-Premium system templates
- Typography and palette specifications
- Cover/page style adaptation
- White-purple-gold-only design tokens

### API Gateway
- Express REST endpoints
- JWT/API key authentication
- Rate limiting
- Multi-tenant enforcement by tenant context
- Webhooks with HMAC signature

### Continuity Layer
- Legacy-compatible endpoints under `/api/*` for module toggles, memory search, and transformation compatibility.
- Tenant feature-flag controls under `/v1/tenants/*`.
- Existing legacy folders (`app/`, `convex/`, and related files) are preserved to maintain continuity with prior system assets.

### Spine Integration
- Global metrics: AD, PM, ESI
- Layout profile adaptation for all exports
- Score and guidance endpoint (`/v1/spine/evaluate`)

## Run

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed -w @zaria/api
npm run dev
```

## API Docs
- Human guide: `docs/api-reference.md`
- OpenAPI: `apps/api/openapi/openapi.yaml`
- Served file: `GET /v1/openapi/openapi.yaml`

## Deployment
- Full guide: `docs/deployment.md`
- Optional local stack: `docker-compose up --build`
