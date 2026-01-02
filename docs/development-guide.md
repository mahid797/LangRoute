# Development Guide

## Purpose & Scope

This guide outlines development conventions, coding standards, and architectural patterns for the LangRoute codebase. It serves as the source of truth for how we write, organize, and maintain code across the project. Use this guide to ensure consistency, maintainability, and clarity in all contributions.

> For local setup and scripts, see the Setup Guide (Internal):
> [`Setup Guide`](https://github.com/bluewave-labs/LangRoute/wiki/Setup-Guide-(Internal-Use))

> For architecture/onboarding docs, see: [`docs/architecture.md`](../docs/architecture.md), [`docs/getting-started.md`](../docs/getting-started.md).

---

## Directory & Path Rules

The following structure reflects the organization exactly:

> Prefer import **aliases** from `tsconfig.json` (`@/*`, `@services/*`, `@lib/*`, `@hooks/*`, etc.) over long relative paths.

- **API routes** → `src/app/(server)/api/**/route.ts`
  - Canonical: `/api/completions`, `/api/access-keys`, `/api/usage`
  - OpenAI-compatible alias: `/api/v1/chat/completions` (maintains OpenAI spec compatibility)
  - Do **not** version other routes with `/v1`.

- **Services (all business logic)** → `src/app/(server)/services/**`
  Pure business logic that can be called from API routes or background jobs; services never depend on `Request`/`Response`.

- **Validation** (Zod + `z.infer`) → `src/lib/validation/**`
  Shared validation schemas used across client and server.

- **Prisma client** → `src/db/prisma.ts`
  Singleton client for server-only database access.

- **Query keys** (for TanStack Query) → `src/lib/queryKeys.ts`
  Canonical query key patterns for consistent caching.

- **Middleware** → `src/middleware.ts` and helpers in `src/lib/middleware/**`
  Authentication, guards, and request shaping only; no business logic.

- **Error mapping** → `src/app/(server)/services/system/errorService.ts`
  Centralized error handling and response formatting.

- **Utilities** → `src/lib/utils/**`
  `cn()` in `classnames.ts`; re-export via `src/lib/utils/index.ts` so `@lib/utils` works.

- **Domain models (logic-free DTOs/types)** → `src/lib/models/**`
  Re-export via `src/lib/models/index.ts` for stable imports.

- **shadcn primitives** (generated, treat as vendor) → `src/shadcn-ui/**`
  > ⚠️ **Warning:** _Do **not** modify these files directly._
  > Instead, create wrappers under `src/app/(client)/components/**`.
  > Modifying shadcn files can cause maintenance issues and break updates.

- **Components/wrappers** → `src/app/(client)/components/**`
  Custom components and shadcn wrappers.

## Coding Standards

- **TypeScript strict**: Avoid `any`/non-null assertions unless justified (e.g., Zod parsing edge cases).
- **Meaningful names**: Use descriptive, full words; avoid abbreviations.
- **Small, focused files**: Keep files under ~200 lines when possible; if a file mixes concerns, split it.
- **Reuse before re-implementing**: Check existing utilities, hooks, and components first.
- **Import aliases**: Prefer `@services`, `@lib`, `@hooks`, etc. over relative paths.
- **Comments for non-trivial logic**: JSDoc for complex services; inline comments sparingly.
- **Structure logic before styling**: Focus on functionality first, styling second.

## API Route Pattern

> **Routes are thin**: validate → delegate → respond.

All API routes follow this consistent pattern:

1. **Validate** `body`/`params`/`searchParams` with Zod (prefer shared schemas in `src/lib/validation/**`).
2. **Call a Service** with the validated data.
3. **Return** `Response.json(data)` with an appropriate HTTP status.

**Example:**

```ts
import { z } from 'zod';
import { AccessKeyService } from '@services';
import { CreateAccessKeySchema } from '@lib/validation';

export async function POST(req: Request) {
  const body = await req.json();
  const input = CreateAccessKeySchema.parse(body);
  const key = await AccessKeyService.createAccessKey(input);
  return Response.json({ accessKey: key }, { status: 201 });
}
```

> **Do not** import `@/db/prisma` or call Redis directly in routes. No business logic in routes.

## Services Pattern

**Services contain all domain logic** and are reusable from routes or jobs:

- **No framework globals** — no `Request`/`Response`/cookies/`next/server`.
- **Typed inputs/outputs** — plain data in, typed results out (or typed errors).
- **Error handling** — throw domain-specific errors and **normalize via `errorService`** in routes for consistent client responses.
- **Domain separation** — split large domains into clear modules; promote shared helpers to `src/lib/**` when broadly reused.
- **Reusable**: Callable from API handlers, background jobs, and other services.

## Frontend Rules

- **No fetch in components** — use **TanStack Query** hooks for all async data.
- **Query keys** — import from **`src/lib/queryKeys.ts`** (authoritative); add new keys there.
- **Hooks naming** — `useX` (e.g., `useCreateKey`, `useUsageByPeriod`).
- **Mutations** — invalidate or update relevant query keys after success.
- **Forms** — React Hook Form + Zod resolver; co-locate schema + typed form hook; export typed APIs.
- **Styling** — Tailwind-first. Use `cn()` helper from `@lib/utils` for dynamic classes.
- **Shadcn Wrappers** — compose new UI via wrappers in `src/app/(client)/components/**`; **never edit** `src/shadcn-ui/**`.

## Validation Rules

- **Shared schemas** live in `src/lib/validation/**`; infer types with `z.infer<typeof Schema>`.
- **Fail fast**: Validate input early and return 400 responses immediately on failure.
- **Status codes** — choose appropriately: `400/422` (client input), `401/403` (authz), `404` (missing), `409` (conflict), `500` (unexpected).

## Middleware Rules

Keep middleware lean and focused:

- **Authentication/guards**: Session checks and role verification.
- **Request shaping**: Input parsing and transformation.
- **No business logic**: Delegate complex operations to services.
- **Public routes**: Configure bypass patterns in `src/lib/middleware/publicRoutes.ts`.

## Utilities & Domain Models

- **Utilities** (`src/lib/utils/**`) are **pure** and **small**; one responsibility per function. Re-export via `src/lib/utils/index.ts` to enable `@lib/utils`.
- **Domain models** (`src/lib/models/**`) are **logic-free DTOs/types** shared across boundaries. Re-export via `src/lib/models/index.ts`.

## Environment & Config

- **Environment variables**: If you add env vars, also update `env/.env.example`. Never commit real env files.
- **Env generation**: `scripts/prepare-env.mjs` helps compose local env files for dev.
- **Config YAML (Planned)**: Sample at `src/lib/config/sample-config-yaml-file-for-models`. GitOps-style seeding will be added later; **do not rely on it at runtime yet**.
- **Redis (Planned)**: Tentative client path `src/lib/redis/redis.ts` when introduced; usage stays in **services**, never in routes.

## Scripts (reference only)

- `npm run dev:boot` — check → env → DB boot → dev server.
- `npm run check` — TypeScript (`--noEmit`) + ESLint.
- `npm run db` — DB CLI (migrations/seed helpers).
- `npm run env` — prepare local env files.

(For full setup steps, use the **Internal Setup Guide** on the wiki.)

## Workflow
- Branch from `dev`; no direct pushes to `dev`/`master`.
- Naming: `feature/*`, `fix/*`, `refactor/*`, `chore/*`.
- Commits: `type(scope): message` (e.g., `feat(auth): add forgot password route`).
- PRs: small & focused; target `dev`; link issue (`Closes #123`); screenshots if UI; expect CodeRabbit review.

---

*Last updated: 2025-09-25*
