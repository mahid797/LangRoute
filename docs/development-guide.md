The goal of this guide is to keep our workflow efficient, our codebase clean, and our communication clear. While every project evolves, we aim to maintain shared practices that scale with the team and the codebase.

---

## Please keep these points in mind:

- ✅ **Follow this guide closely.** It avoids confusion and helps maintain long-term code health.
- ❓ **Unsure how or where to do something?** Ask `@mahid797` or bring it up in a discussion.
- 📝 **Want to suggest changes?** Great! Propose updates in a PR or team discussion thread.

> This guide focuses on how we **write and organize code**.

> To understand **where code should live**, see:
> [`Project Structure Guide`](https://github.com/bluewave-labs/LangRoute/wiki/Project-Structure-Guide)

---

## 1. Coding Standards 💻

Consistency and clarity are critical to the long-term success of the LangRoute codebase. The following standards ensure that all contributors follow a common baseline when writing or reviewing code.

---

### 1.1 General Conventions

1. **Use meaningful, descriptive names**
   - Be descriptive: use full words (`getUserById`, `resetPasswordForm`) instead of short forms (`tmp`, `val`, `x`).
   - Use PascalCase for components, camelCase for variables/functions.

2. **Keep Files Small & Focused**
   - Aim to keep most files under **200 lines** and focused on a single concern.
   - If a file grows too large or mixes concerns, split it into logical parts.

3. **Avoid duplication**
   - Always check if a utility, hook, or component already exists before writing new.
   - Don’t fork code unless necessary — small changes should be made via props or config.

4. **Use Prettier & ESLint**
   - The repo includes a `.prettierrc` and `eslint.config.mjs` to enforce formatting and linting.
   - Husky + lint-staged runs ESLint and Prettier automatically on staged files to auto-fix code.
   - If your pre-commit hook fails, fix issues before retrying. But for urgent hotfixes, you can bypass with `git commit --no-verify`.
	> ⚠️ Only use `--no-verify` in case of emergency — and notify the reviewer when doing so.

5. **Add comments when necessary**
   - Avoid commenting on obvious operations (e.g. `const x = y + 1 // adds one`).
   - Use inline comments sparingly, and only for **non-trivial logic**, e.g., regex patterns, caching behavior, token handling.
   - Use JSDoc-style annotations for complex utility or service functions.

6. **Structure logic before styling**
  - Focus on component logic and flow first. Tailwind styling and UI tweaks should come later in the PR lifecycle to avoid rework.

---

### 1.2 TypeScript Usage

- **LangRoute uses full `strict` mode**
  - LangRoute runs with full `strict` mode enabled in `tsconfig.json`.
  - Avoid `any`, `as unknown`, or `!` unless properly justified (e.g. Zod parsing edge cases).

- **Infer types from validation schemas**
   - Use Zod schemas with `z.infer<typeof schema>` to ensure client/server type sync.
   - Place schemas in `lib/validation/` and import where needed.

- **Shared types go in the right place**
  - Use `lib/models/` for DTOs, domain types, and interfaces used across frontend + backend.
  - Use `types/global.d.ts` for global ambient types (e.g. extending `NextAuth`, env vars).

- **Avoid redundant or overly generic types**
  Don’t declare unnecessary `type Props = {}` or wrap native types (e.g., `type StringAlias = string`) unless semantically helpful.

---

## 2. Frontend Development Guidelines 🎨

> See the [`Project Structure Guide`](https://github.com/bluewave-labs/LangRoute/wiki/Project-Structure-Guide#5components) for where to place components or hooks.

This section outlines best practices for writing maintainable, consistent frontend code in LangRoute. All frontend logic should prioritize reusability, performance, and developer clarity.

### 2.1 Components

- **Use PascalCase for all component files**
   - Example: `Button.tsx`, `UsageTable.tsx`, not `button.tsx` or `usage-table.jsx`.

- **Style exclusively with Tailwind CSS**
   - Avoid external CSS files, styled-components, or custom classnames unless justified.
   - Use Tailwind’s utility classes and built-in responsive variants for layout and spacing.
   - Use the `cn()` helper (`@/lib/utils`) for conditional class composition.
   - For **repeated or semantically meaningful style groups**, you may extract Tailwind styles using `@apply` inside `globals.css` or module-level CSS. For Example:
		```css
		/* globals.css */
		.main-card {
			@apply flex min-h-screen items-center justify-center bg-gray-100;
		}
		```
		And use in JSX:
		```tsx
		<div className="main-card"></div>
		```
	> 🚫 Avoid `@apply` for one-off use cases or when it hides important layout logic behind vague classnames like `.box` or `.styled-div`.

- **Use the `cn()` helper** for conditional styling
  Located at `@/lib/utils`. This helps cleanly compose dynamic class names.

- **Follow Shadcn + CVA conventions** when customizing variants
  If we introduce `class-variance-authority`, follow their `variant`, `size`, and `defaultVariants` patterns for shared components.

- **Co-locate feature-specific components**
  Components tied to a page/route should live near their usage — only promote to global `components/` if used in multiple, unrelated contexts.

- **Error Handling**
   - In most cases, rely on **try/catch** in hooks or fetch logic to handle errors gracefully.
   - Display user-friendly error messages (e.g., using a toast) whenever an API request fails.
   - If needed, React’s **error boundaries** can be used for critical failures.

---

### 2.2 Hooks

- **Never perform data fetching inside components**
  Always create a hook (in `hooks/data`) for any async logic (e.g. fetching usage logs, creating API keys).

- **Name hooks with the `useX` pattern**
  Examples: `useCreateKey()`, `useDeleteUser()`, `useUsageByPeriod()`.

- **Use TanStack Query** for all async state
  - Queries: use descriptive keys like `['usage', period]`
  - Mutations: always invalidate relevant queries after success
  - Store query keys in a dedicated `queryKeys.ts` or similar file for reusability and consistency

	> Group keys by domain: `keys.auth.getSession`, `keys.usage.byPeriod(period)`.
  ```ts
  // Example queryKeys.ts
  export const queryKeys = {
    auth: {
      base: ['auth'] as const,
      getSession: (userId: string) => ['base', userId, 'session'] as const,
    },
    usage: {
      base: ['usage'] as const,
    },
    profile: {
      base: ['profile'] as const,
      getDetails: (userId: string) => ['base', userId, 'details'] as const,
    },
  }
  ```
- **Avoid direct `axios` or `fetch` usage**
  Wrap all requests inside TanStack hooks for consistent error/loading handling.

- **Use `hooks/forms` for React Hook Form logic**
  - Compose Zod schemas with RHF’s resolver.
  - Export typed form hook + schema from a single file to keep forms self-contained.

---

## 3. Backend Development Guidelines 🗄️

> Refer to the [`Project Structure Guide`](https://github.com/bluewave-labs/LangRoute/wiki/Project-Structure-Guide#8services-backend-only) for service placement rules.

This section covers how to write clean, testable, and extensible backend logic — especially in services and API routes.

### 3.1 Services

- **All logic must go through services**
  - Don’t call `prisma`, `redis`, or other side-effects directly in `route.ts` handlers.
  - API routes should only parse input → call service → return response.

- **Keep services pure and reusable**
  - No access to `req`, `res`, or cookies inside services.
  - Services should accept data as input and return typed results or throw errors.
  - Services should be callable from both API handlers and future jobs/workers.

- **Split large services by domain**
  - Example: move `createKey()` to `services/auth/keys.ts` if the file is getting large.

---

### 3.2 Error Handling

- **Use `try/catch` in services if failure is expected**
  - Throw Zod errors, Prisma validation errors, or custom errors as needed.
  - Never swallow errors silently — log or re-throw with context.

- **Return consistent error responses from routes**
  - Use the same shape for error responses across routes.
  - Avoid returning `null` or ambiguous responses — prefer `{ error, message }` patterns.

- **Frontend should handle errors gracefully**
  - If a route fails, show a toast or error state, not just console logs or crashes.

---

### 3.3 Validation

- **Validate all request input using Zod**
  - Parse `req.body`, `req.query`, and `req.params` before calling services.
  - Use shared schemas from `lib/validation` where possible.

- **Infer types using `z.infer<typeof schema>`**
  - Avoid duplicating types manually. This ensures client + server always agree.

- **Fail fast if validation fails**
  - Send early 400 responses instead of passing bad input deeper into the system.

---

## 4. API Route Patterns 🔑

> See the [`Project Structure Guide`](https://github.com/bluewave-labs/LangRoute/wiki/Project-Structure-Guide#32-api-routes) for route placement and structure.

This section describes how to write clean, consistent API route handlers that integrate well with LangRoute's service-based architecture.

### 4.1 Structure & Responsibilities

- API handlers live in `app/_api/v1/{resource}/route.ts`
- Each handler must follow this pattern:
  1. **Validate input** with Zod
  2. **Call a service function** with the validated data
  3. **Return a typed response**

	```ts
	import { z } from 'zod'
	import { createKey } from '@/services/auth/keys'

	export async function POST(req: Request) {
		const body = await req.json()
		const parsed = zodSchema.parse(body)

		const key = await createKey(parsed)
		return Response.json(key)
	}
	```

### 4.2 Naming & REST Conventions

- Use **standard REST verbs**:
  - `GET` for fetching
  - `POST` for creating
  - `PUT` or `PATCH` for updating
  - `DELETE` for removal

- Group routes by resource:
  - `/v1/keys`
  - `/v1/usage`
  - `/v1/auth/verify`

- Avoid nesting routes unless absolutely necessary (e.g., `/users/{id}/keys`)

### 4.3 Input Parsing
- Use Zod in every route to guard input.
- Validate `body`, `params`, and `searchParams` explicitly.
- Always return early (`400 Bad Request`) on invalid input.

### 4.4 Error Responses
- Use consistent error shapes like:

  ```ts
  return Response.json({ error: 'Invalid API key' }, { status: 401 })
  ```
- Avoid leaking stack traces or internal error codes.
- Services should throw typed errors that routes can catch and format.

---

## 5. Shared Helpers & Utilities 🛠️

> See the [`Project Structure Guide`](https://github.com/bluewave-labs/LangRoute/wiki/Project-Structure-Guide#7lib--shared-runtime-helpers) for file locations.

This section focuses on **how to write** helpers, validators, and shared config — not where they live.

### 5.1 Utility Functions (`lib/utils.ts`)

- Must be **pure** — no side effects (e.g., no logging, no fetch, no global mutation)
- Must be **small and focused** — one clear task per function
- Common examples:
  - `cn()` — for composing classNames
  - `capitalize()` — for formatting strings
  - `formatCost()` — for cost display

> Do not create helpers unless a clear use case exists in multiple places.

### 5.2 Zod Schemas (`lib/validation/`)

- Validation schemas should be colocated with the feature **only if not reused**
- For shared schemas (used in both frontend and backend), define them in `lib/validation` and export from a barrel index
- Use `.parse()` only in routes, `.safeParse()` in client code if error handling is needed

### 5.3 Prisma Client (`lib/db/prisma.ts`)

- Singleton client — do not instantiate manually
- Import only in server-side code
- Avoid calling inside loops or conditionals

### 5.4 Redis Client (`lib/redis/redis.ts`)

- Singleton connection, auto-initialized
- Used for:
  - Pub/sub log broadcasting
  - Token bucket rate limiting (planned)
  - Budget tracking (planned)
- Avoid putting custom Redis logic inside route handlers — use a service

### 5.5 Config Files (`lib/config/`)

- Used for:
  - Route matchers (`routesConfig.ts`)
  - Default rate limits, cost thresholds
  - Static provider metadata
- Prefer hardcoded values in config over repeating constants across routes/services

### 5.6 Domain Models (`lib/models/`)

- Use for:
  - DTOs returned from services
  - Enums, unions, discriminated types
  - Shared type contracts between API and UI
- Must be **logic-free**
- All types must be exported from `models/index.ts` for consistent importing

	```ts
	// Example
	export interface ApiKey {
		id: string
		name: string
		createdAt: string
	}
	```

> 💡 **Pro Tip:** If your helper touches DB, Redis, or input validation, it should probably live in a service — not in `lib/`.

---

## 6. Environment & Config 📝

Managing sensitive information and environment-dependent behavior is essential in a self-hosted, configurable app like LangRoute. This section explains how we handle `.env` files and YAML config.

---

### 6.1 `.env` Files

- All environment variables are defined in `env/.env.example`
- To run locally, copy it to `env/.env.local` and populate the required fields
- **Never commit actual `.env` files** — only track `.env.example` in version control.
- Required env vars typically include:
	- `NEXT_PUBLIC_URL`
  - `DATABASE_URL`
  - `REDIS_URL`
  - `NEXTAUTH_SECRET`
  - Provider keys (e.g. `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.)

> Add new variables to `.env.example` immediately if you introduce them in a PR.

---

### 6.2 Config YAML (Planned)

LangRoute will eventually support seeding data from a `config.yaml` file.

- Purpose:
  - Seed models, providers, rate limits, and cost tables on first boot
  - Allow GitOps-friendly config overrides
- Example file:
  `sample-config-yaml-file-for-models` (in repo root)

> The actual seeding and parsing logic will be introduced in a future phase — but the structure is already defined.

> ⚠️ This feature is not yet implemented. Do not rely on config.yaml for any runtime config.
---

## 7. GitHub Workflow 🐙

A consistent workflow across issues, branches, and pull requests helps us collaborate effectively and reduce confusion.

### 7.1 Issues

- Every task, fix, or feature must begin with a GitHub issue
- Issue format:
  - ✅ Clear title
  - ✅ Markdown-formatted description
  - ✅ Checklist of tasks
  - ✅ Label (`Frontend`, `Backend`, `Refactor`, etc.)
  - ✅ Priority (see below)

> Use the [`Project Structure Guide`](https://github.com/bluewave-labs/LangRoute/wiki/Project-Structure-Guide) to determine what kind of work you're doing before creating an issue.

### 7.2 Priority Labels

| Label            | Meaning                                                 |
| ---------------- | ------------------------------------------------------- |
| 🔥 `Critical`     | Blocks core flows, breaks app, or is deadline-bound     |
| ⚡ `Important`    | Needed for next milestone or major feature              |
| 🌱 `Nice-to-Have` | Non-blocking quality-of-life or performance improvement |
| 🛠️ `Backlog`      | Future tasks, not part of current sprint                |
| 📥 `Icebox`       | Unconfirmed or low-priority ideas                       |

> **Handling Priorities**
>
> - **Critical** issues always come first—address them before everything else.
> - If you finish your assigned tasks or are unsure what to tackle next, check for **Critical** or
>   **Important** items.
> - For issues that initially lack clarity or need discussion, add a **Needs Review** or
>   **Question** label to them and collaborate with the team to refine their scope.

### 7.3 Issue Statuses

   - **To Do**: Newly created issues that haven’t been started.
   - **In Progress**: Actively being worked on.
   - **In Review**: A pull request (PR) has been created and is awaiting review.
   - **Done**: Once the code has been reviewed and deployed successfully

### 7.4 Branching Strategy 🌳

- Always branch off of **`dev`**.
- **Never branch from `master`** unless explicitly told.
- **Do not** commit or push directly to `dev` or `master`.
- Always work on a **feature/fix** branch and submit a pull request (PR).
> Always rebase your branch with the latest `dev` before creating a PR to avoid merge conflicts.

### 7.5 Branch naming convention:

| Type     | Prefix      | Example                      |
| -------- | ----------- | ---------------------------- |
| Feature  | `feature/`  | `feature/key-creation-flow`  |
| Bug Fix  | `fix/`      | `fix/login-token-refresh`    |
| Refactor | `refactor/` | `refactor/redis-abstraction` |
| Chore    | `chore/`    | `chore/env-doc-updates`      |


### 7.6 Commit Message Conventions

- Format: `type(scope): message`
  - `feat(auth): add forgot password route`
  - `fix(proxy): correct stream pipe timing`
  - `refactor(hooks): rename useDocumentAnalytics`

- Possible types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`

### 7.7 Pull Requests (PRs)

- Open a PR as soon as a slice of functionality is complete
- PR Requirements:
  - ✅ Target: `dev`
  - ✅ Link the related issue using `Closes #123`
  - ✅ Include a short summary of what changed and why
  - ✅ Attach screenshots if the UI changed
  - ✅ Add a reviewer
  - ❌ Do not self-merge unless explicitly allowed

> Keep PRs small and focused — avoid bundling unrelated tasks.

---

## 8. Final Notes 🤝

- ✅ **Consistency > Preference** — follow established patterns even if you’d personally do it differently.
- ✅ **Reuse before re-implementing** — check the repo for existing hooks, components, services, or types.
- ✅ **Keep docs updated** — If you add a new helper, folder, or pattern, document it here or in [`Project Structure Guide`](https://github.com/bluewave-labs/LangRoute/wiki/Project-Structure-Guide)
- ✅ **Communicate openly** — Use issues, PR comments, and Discord (if applicable) to clarify or align decisions.
- ✅ **Respect boundaries** — UI shouldn’t import backend logic; services shouldn’t leak into components.

---

*Last updated: 2025-07-16*

