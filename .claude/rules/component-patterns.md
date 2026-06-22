---
paths:
  - "client/src/**/*.tsx"
  - "client/src/**/*.ts"
---

# Component Patterns

## File Structure

1. Imports
2. Props interface (with JSDoc on non-obvious props)
3. Component (with JSDoc above)
4. Helper functions

## State Management

- `useState` for local UI state (row expanded/collapsed, search/filter/sort inputs, hover).
- Zustand (`ghostrStore`) for shared state — the active view (board ↔ methodology) and anything spanning components. View switching is store state, not a router; scroll to top on switch.
- `useMemo` for derived values: the record sentence, tag pills, repost-timeline tick positions (placed from `repost_dates` across the first-seen→now span), and `last_reposted_on = max(repost_dates)`. These are computed client-side — never request extra columns or endpoints for them.

## Data Fetching

- `use*` hooks own fetch + loading/error state for each endpoint (`/api/postings`, `/api/stats`, `/api/meta`, `/api/companies/:id/facts`). Company facts are fetched lazily when a row expands.
- Changing search, filter, or sort resets pagination (offset back to 0). Paginate by 6 via "load more".
- Every fetch hook surfaces loading, empty, and error states; a null `lastPolledAt` drives the "first poll pending" state.

## Limits

- Components under 150 lines. Extract sub-components or hooks beyond that.
- Extract hooks when logic exceeds ~20 lines or is reused.
