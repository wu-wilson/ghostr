---
paths:
  - "client/**/*.ts"
  - "client/**/*.tsx"
  - "server/**/*.ts"
  - "poller/**/*.ts"
---

# Code Style

## TypeScript

- Strict mode enabled everywhere. No `any` — use `unknown` with type narrowing. Parse every external feed payload with Zod before use. Prefer `interface` for object shapes, `type` for unions and intersections.
- Functional components: `const` arrow functions typed via a `{ComponentName}Props` interface defined directly above the component.
- Named exports only — no default exports (exception: lazy-loaded route components).

## Docstrings

- Every exported function, hook, component, and type must have a JSDoc docstring.
- **Functions, hooks, components:** one-sentence overview (extend to a second sentence when extra context helps), then `@param name - description` for each parameter, then `@returns description` (omit `@returns` only on void functions). Both tags are mandatory — never "as appropriate".
- **Types/interfaces:** one-line overview is sufficient. Add inline `/** one-line description */` on individual fields that need explanation; leave self-evident fields untagged.
- `@param`/`@returns` descriptions are prose only — don't restate the TypeScript type. Add semantic info the signature doesn't carry (units, date format, UTC, null-vs-empty semantics, retry behavior).
- Don't use `@throws` — describe error/failure semantics in the prose overview or via a result shape.
- Internal (non-exported) helpers: one-line `/** … */` only when the name doesn't carry the whole meaning.

## Imports

- Group with blank lines: third-party → Components → Hooks/stores → Lib/utils → Constants → Types (via `import type`).
- Alphabetical within groups.

## Naming

- Event handlers: `handle{Event}`. Hooks: `use{Name}`. Booleans: `is`/`has`/`should`.
- PascalCase component files (`PostingRow.tsx`); camelCase for hooks, lib, util, and adapter files (`audit.ts`, `greenhouse.ts`).
- SCREAMING_SNAKE_CASE constants; PascalCase types.

## Patterns

- Pure functions, early returns, no deep nesting. 2-space indent, semicolons always, single quotes in code / double in JSX.
- Try/catch all async operations with meaningful error messages; `finally` for cleanup, no silent swallowing.
- In the poller, **isolate failures per company** — one feed 404/timeout must not abort the run; record it and continue.
- No dead code, unused imports, unused exports, or speculative abstractions.
- No `console.log` in client code. Server/poller may use `console.*` for operational logging only (run outcomes, per-company results, lifecycle, errors) — not for debugging.
