---
paths:
  - "client/src/**/*.tsx"
  - "client/src/**/*.css"
  - "client/tailwind.config.js"
---

# Styling

Dark, editorial audit aesthetic. No UI component libraries — build all components from scratch with Tailwind.

## Theming

- All colors via CSS custom properties / Tailwind semantic tokens. Never hardcode hex in components (no `bg-[#ABC]`).
- **Dark mode only** — palette defined on `:root` in `index.css`. Never use Tailwind `dark:` prefixes; there is no theme toggle.
- Tokens are stored as **space-separated RGB channels** (e.g. `--ink: 237 237 230;`, hex in a comment) and consumed via `rgb(var(--token) / <alpha-value>)` in `tailwind.config.js`, so alpha modifiers like `text-ink/60` resolve. Direct `var(--token)` uses (SVG `fill`/`stroke`) must wrap as `rgb(var(--token))`.
- Page background `#121210`; raised/inset panels `#101009`; pure-black accents `#0a0a09`. Primary ink `#edede6`; muted-text ramp down to `#5c5c54`. Borders dark→light `#1a1a15` → `#4a4a3f`. Selection: bg `#edede6`, text `#0a0a09`.

## Visual Language

- Display/headlines/numbers use **Archivo** (weights 600–900); body/UI uses **IBM Plex Mono** (400–600). Base 14px, line-height 1.5.
- Big first-seen ages and stat-strip figures are large Archivo numbers (`tabular-nums`). Micro-labels are uppercase tracked mono.
- Square corners, hairline borders from the border ramp, surface-tier shifts (`bg-page` vs panel) for depth — no shadows. The expanded detail panel separates with a **dashed top border**.
- Headline accent: "haunted" in full-ink `#edede6`, surrounding words in muted `#82827a` — via tokens, not literal hex.

## Texture

- The page carries subtle layered `radial-gradient` glows (top-right + bottom-left, ~5% white) plus a faint 4px-period horizontal scanline (`repeating-linear-gradient`, ~1.6% white). Keep it understated — defined once in `index.css`, not per-component.

## Interactive States

- Every clickable element has a hover state via a smooth `transition-colors` / `transition-[filter]`. No instant visual changes — all in-flow motion ≤300ms.
- The logo carries a blinking block cursor (`@keyframes`, 1.1s `steps(1)`).

## Animation

- Duration/easing constants from `constants/animations.ts`; all in-flow ≤300ms. Prefer `transform`/`opacity`.
- Inline `style={{...}}` is reserved for values Tailwind can't statically extract (JS-derived durations, timeline tick positions, animation delays).
