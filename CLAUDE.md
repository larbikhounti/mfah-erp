# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status — read this first

This repo is mid-pivot. It started as a "DOM server" system for a **gaming/entertainment company** (arcade machines, games, tickets, chairs, coupons) and is being repurposed into an **ERP for a transportation company**. As of the current working tree:

- `backend/src` has had the gaming-domain modules deleted (`doms`, `experiences`, `games`, `game-types`, `machines`, `machine-types`, `machine-chairs`, `tickets`/`sync`, `comments`, `coupons`, `cdn`). Only `auth`, `roles`, `users`, `statistics`, and `prisma` remain — these are the foundation being kept for the new ERP.
- `backend/prisma/schema.prisma` and `backend/prisma/seed.ts` **still define/reference the old gaming models** (`doms`, `games`, `machines`, `tickets`, `coupons`, etc.) — the schema has not yet been cleaned up to match the trimmed `src`.
- `frontend/src` **has not been touched** — it still fully contains the gaming-domain UI (dashboard pages, Zustand stores, and service calls for doms/experiences/games/machines/coupons/comments/etc.), which now targets backend endpoints that no longer exist.
- `backend/dist` is stale compiled output from before the module deletions; don't treat it as a source of truth.

When working here: don't be surprised that `git status` shows large uncommitted deletions in `backend/src` — that's intentional pruning, not accidental data loss. Do not resurrect the deleted gaming modules unless explicitly asked. When adding new backend features for the ERP domain, follow the module conventions below (used by `roles`/`users`/`statistics`), and expect that most of `frontend/src` (stores, dashboard pages, services outside `auth`/`user`) is legacy and will need to be replaced or removed as the ERP domain is built out.

## Repo layout

Two independent Node projects, no shared root package (root `package-lock.json` is a stub):
- `backend/` — NestJS 11 API (TypeScript, Prisma, PostgreSQL)
- `frontend/` — Next.js 15 (App Router, React 19, TypeScript, Tailwind v4, shadcn/ui "new-york" style)

Run all commands from inside `backend/` or `frontend/` respectively — there is no root-level script runner.

## Commands

### Backend (`backend/`)
```bash
npm run start:dev        # watch mode, http://localhost:8459 (hardcoded port in main.ts)
npm run build             # nest build
npm run lint               # eslint --fix on src/apps/libs/test
npm run format              # prettier --write

npm run test                 # jest unit tests (rootDir: src, pattern *.spec.ts)
npm run test -- users.service  # run a single spec by filename match
npm run test:watch
npm run test:cov
npm run test:e2e             # uses test/jest-e2e.json, pattern *.e2e-spec.ts

npx prisma studio            # inspect DB
npx prisma migrate dev       # create/apply a migration after editing schema.prisma
npm run migrate:fresh        # prisma generate + migrate reset --force + migrate dev + db seed (destructive)
npx prisma db seed           # runs prisma/seed.ts directly (ts-node)
```
Swagger docs are served at `/api/docs` when the backend is running.

### Frontend (`frontend/`)
```bash
npm run dev      # next dev --turbopack, http://localhost:3000
npm run build    # next build --turbopack
npm run start
npm run lint      # eslint (flat config)
```
No test runner is configured in `frontend/package.json`.

### Docker
```bash
docker-compose up --build   # postgres + backend + frontend
```
Note: `docker-compose.yml` sets the backend's `DATABASE_URL` to a `med_project_db` database name (a leftover from an earlier project name) while `postgres` provisions `mfah_project_db` — these don't match as currently written.

## Backend architecture (NestJS)

Each domain is a self-contained Nest module under `src/<domain>/` with a consistent internal shape:
```
<domain>/
  <domain>.module.ts
  controllers/<domain>.controller.ts
  services/<domain>.service.ts
  dtos/                    # create/update/filter/bulk-delete DTOs, class-validator + swagger decorated
  types/<domain>-response.type.ts
```
Look at `src/roles/` or `src/users/` as the reference implementation for a new module — they follow the same recipe end-to-end (module wiring, controller route/guard layout, service, DTOs, response type).

Key conventions used across existing modules:
- **Auth**: global `AuthGuard` (registered as `APP_GUARD` in `AuthModule`) checks a Bearer JWT on every route unless the handler/class carries `@Public()` (`src/decorator/public.decorator.ts` — note `src/auth/decorator/public.decorator.ts` is a duplicate of the same decorator; both exist). `AdminRoleGuard` (`src/auth/guards/admin-role.guard.ts`) additionally checks the authenticated user's `roles.name === 'admin'` via a DB lookup — apply both guards together (`@UseGuards(AuthGuard, AdminRoleGuard)`) for admin-only routes.
- **Route layout**: controllers under a domain typically split public/read endpoints (e.g. `GET :domain/all`, often `@Public()`) from `admin/*`-prefixed CRUD endpoints requiring `AuthGuard` + `AdminRoleGuard` (create, update, bulk delete, restore, bulk restore). New CRUD modules should follow this same public-read / admin-write split.
- **API versioning**: URI versioning is enabled globally (`app.enableVersioning({ type: VersioningType.URI })`); controllers declare `@Controller({ path: '<domain>', version: '1' })`, giving routes like `/api/v1/roles/...`.
- **Soft deletes**: models use a `deletedAt` timestamp rather than hard deletes; filter DTOs commonly expose a `showArchived` boolean to toggle between active/archived records, plus `offset`/`limit`/`search` pagination and a free-text `status` filter (see `src/users/dtos/filter/filter-params.dto.ts`). Services expose `restore`/`bulkRestore` alongside `remove`/`bulkDelete`.
- **Passwords**: hashed/compared via `src/helpers/helper.helpers.ts` (`hashPassword`/`comparePassword`, bcrypt-based).
- **Prisma access**: no repository layer — services inject `PrismaService` (`src/prisma/prisma.service.ts`) directly and call `this.prisma.<model>....`.
- **Validation**: global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, and `transform` enabled — DTOs must declare every accepted field with `class-validator`/`class-transformer` decorators or requests get rejected.
- **Env vars**: `JWT_ACCESS_SECRET`, `JWT_EXPIRATION_TIME`, `DATABASE_URL` are read via `ConfigModule`/`ConfigService` (global). There is currently no `backend/.env.example` in the tree to copy from — check with the user before assuming which env vars are required if adding new ones.

## Frontend architecture (Next.js)

- App Router under `src/app`; the authenticated area lives under `src/app/dashboard/*`, one directory per domain, gated client-side by `src/app/dashboard/layout.tsx` (redirects to `/` if `useAuth()` reports unauthenticated).
- `src/hooks/use-auth.ts` is a localStorage-backed auth hook (`access_token`/`user_email`/`user_name` keys) — there's no cookie/session-based auth or context provider; any component needing auth state calls this hook directly.
- `src/lib/utils.ts` exports a shared `axiosInstance` (Axios) that attaches the bearer token from `localStorage` on every request and, on a 401 response, clears auth keys, toasts via `sonner`, and hard-redirects to `/`. Use this instance (not a bare `axios` import) for any new API call so 401 handling stays consistent.
- `src/services/*.service.ts` wrap `axiosInstance` calls per domain (currently only `auth.service.ts` and `user.service.ts` are current; the rest of the domain UI reads/writes through `src/stores/*` directly — see the pivot note above).
- `src/stores/*` are Zustand stores, one per domain, used as the primary client-side data layer for dashboard pages (most of these target the now-deleted gaming-domain backend endpoints — see status note above).
- `src/components/ui/` is shadcn/ui (`components.json`: style `new-york`, base color `neutral`, icon library `lucide`); other `src/components/<domain>/` folders hold feature-specific tables/forms per domain, generally named `enhanced-<domain>-table.tsx`.
- `NEXT_PUBLIC_API_URL` controls the API base URL the frontend targets (set at build/run time; see `docker-compose.yml` for the containerized value `http://localhost:8459/api/v1`).
