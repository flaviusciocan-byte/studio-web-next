# Audit rapid proiect – ce mai trebuie creat / ce pare sărit

## 1) Probleme blocante (build + tipare)

1. **Pagina de modul este declarată `async` deși este Client Component**, iar hook-urile React sunt folosite în acel context (invalid pentru reguli hooks).
2. **Import Convex invalid** în frontend:
   - se importă `skip` din `convex/react` (export inexistent în versiunea actuală),
   - se importă `api` din `convex/_generated/api` (cale nerezolvată în build).
3. **Incompatibilități de tip între schema Convex și mutații/query-uri**:
   - schema `auditLogs` definește `entity`, dar codul folosește `entityType`/`entityId`,
   - schema cere `ownerId`/`actorId` ca `Id<"users">`, dar mutațiile primesc/folosesc `string`.
4. **API route pentru toggle module are semnătură incompatibilă cu tipurile Next 16** (`params` Promise vs obiect direct).

## 2) Ce pare implementat parțial

- Există bazele pentru:
  - proiecte (create/list/delete/duplicate/import/export),
  - changelog,
  - audit log,
  - generate mock pe provider.
- Există UI pentru management proiecte în pagina de modul (căutare/sortare/select/import/export/changelog/audit).

## 3) Ce este încă lipsă vs PRD

Conform `docs/zaria-builder-prd.md`, toate milestone-urile sunt încă bifate ca nefinalizate (`[ ]`).
Asta indică faptul că, la nivel de roadmap, încă lipsesc explicit:

1. **MVP Builder UI complet**
   - prompt + generate robust,
   - basic module view consolidat,
   - stocare Convex matură pentru generații.
2. **MVP Runtime**
   - render static output,
   - target minim de deploy.
3. **Integrări v1**
   - PostHog / Ghost / AppFlowy consumatori reali.
4. **Auth/RBAC v1**
   - roluri + protecție rute.
5. **Deploy v1**
   - pipeline build + versiuni release.
6. **Analytics v1**
   - colectare evenimente + dashboard.

## 4) Prioritate recomandată (ordine de lucru)

1. **Stabilizare tipuri & build** (fără asta nu se poate livra constant):
   - reparat `app/modules/[module]/page.tsx` (fără `async`, importuri Convex corecte),
   - aliniat schema Convex cu usage (`entity` vs `entityType/entityId`, `Id<"users">` vs `string`),
   - corectată semnătura route handler-ului Next.
2. **Hardening frontend**:
   - înlocuit `<a>` cu `Link` pentru navigare internă,
   - rezolvat warnings React hooks (`set-state-in-effect`, dependency arrays).
3. **MVP features din PRD**:
   - runtime/deploy minim,
   - integrare reală de provider (nu doar mock string),
   - auth/rbac minim funcțional.
4. **Observabilitate și analytics**:
   - evenimente coerente (generate/import/deploy),
   - interfață dashboard de bază.

## 5) Comenzi rulate pentru audit

- `rg -n "TODO|FIXME|TBD|@todo|HACK|XXX|placeholder|mock|not implemented|coming soon|WIP|sarit|skip|later" .`
- `npm run lint`
- `npm run build`
- `npx tsc --noEmit`

Aceste comenzi au confirmat că principalele goluri sunt mai degrabă **de integritate tehnică și livrare (build/types/contracts)** decât simple TODO-uri lăsate în comentarii.
