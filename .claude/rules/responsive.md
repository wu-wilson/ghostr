---
paths:
  - "client/src/**/*.tsx"
  - "client/src/**/*.css"
---

# Responsive Design

## Breakpoints

Mobile-first, with a single primary breakpoint at **~760px** (define it as the Tailwind `md` boundary or a custom screen and use it consistently). Base styles target a phone-width column, then layer the desktop overrides above 760px.

## Typography

- Base body 14px (set on `body` in `index.css`), line-height 1.5.
- The board headline and big Archivo numbers (first-seen ages, stat figures) scale up at the desktop breakpoint; mono micro-labels stay small. Never go below `text-xs` (12px) for primary text.

## Layout collapse (≤760px)

- **Stat strip** collapses 4 columns → 2.
- **Posting rows** reflow from a single desktop grid line into a stacked `grid-template-areas` block, with small uppercase mono micro-labels above each value (first seen / role & company / source / reposts / salary). The desktop-only column header is hidden on mobile.
- **Expanded detail** goes from 3 columns to a single stacked column.
- **Controls row** (search, filter chips, sort) stacks vertically.
- The top bar's `last poll · {time}` stamp — and its `|` separator — is **desktop-only** and renders only once a poll has run.

## Viewport

- Never use `h-screen` / `min-h-screen` (`100vh`) — use `min-h-dvh` (dynamic viewport).
- `index.html` viewport: `viewport-fit=cover` for notched devices.
- Respect safe-area insets on top/bottom edges (`env(safe-area-inset-*)`).
- Never allow horizontal overflow — `overflow-x: hidden` on html.

## States

- Every state has designed UI: loading, empty ("no postings match" with the ghost glyph), error, and the "first poll pending" state when the DB has no postings yet.

## Scrolling

- `overscroll-behavior: none` on body to prevent pull-to-refresh.
- Avoid `overflow-x-auto` on containers holding focus-ring-bearing children — the browser also clips `overflow-y`, cropping rings.
