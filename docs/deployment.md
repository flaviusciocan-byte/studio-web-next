# ZARIA Builder Deployment Guide

## 1. Requirements
- Node.js 20+
- npm 10+
- PostgreSQL 15+

## 2. Environment Setup
1. Copy `.env.example` to `.env`.
2. Configure `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, and storage path.
3. Ensure PostgreSQL database exists.

## 3. Install Dependencies
```bash
npm install
```

## 4. Initialize Database
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed -w @zaria/api
```

## 5. Start in Development
```bash
npm run dev
```
- API: `http://localhost:8080`
- Web: `http://localhost:5173`

## 6. Production Build
```bash
npm run build
```

## 7. Production Runtime
```bash
npm run start -w @zaria/api
npm run preview -w @zaria/web
```

## 8. Reverse Proxy and TLS
- Put API and Web behind a reverse proxy (Nginx/Traefik).
- Enforce HTTPS.
- Restrict CORS to the web origin.

## 9. Persistence and Backups
- Back up PostgreSQL daily.
- Persist `apps/api/storage` to durable block storage or object storage mount.

## 10. Scaling
- Scale API horizontally with sticky-less JWT auth.
- Use shared storage backend for export files when running multiple API replicas.
- Add queue workers for webhook and long export workloads when traffic grows.
