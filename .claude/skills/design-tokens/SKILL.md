---
name: design-tokens
description: Exact color hex values, fonts, the scanline backdrop, and animation duration constants used in Ghostr.
user-invocable: true
---

# Design Tokens

Dark, editorial audit aesthetic. Source of truth: CSS custom properties in `client/src/index.css` (stored as **space-separated RGB channels**, hex in comments) consumed via `rgb(var(--token) / <alpha-value>)` in `client/tailwind.config.js` so alpha modifiers resolve. Durations live in `client/src/constants/animations.ts`. Never hardcode hex in components. For rules about how to apply these, see `.claude/rules/styling.md`.

## Colors (dark mode — only theme, defined on `:root`)

**Surfaces (darkest tiers)**
- Page background: `#121210`
- Raised / inset panels: `#101009`
- Pure-black accents: `#0a0a09`

**Ink (primary text / logo)**
- `#edede6`

**Muted text ramp (lightest → deepest)**
- `#cfcfc6`
- `#a6a69a`
- `#8f8f84`
- `#82827a`  ← headline's non-accent words ("Every job board is a little bit …")
- `#6b6862`
- `#5c5c54`

**Borders (dark → light)**
- `#1a1a15`
- `#26261f`
- `#2e2e27`
- `#4a4a3f`

**Selection**
- background `#edede6`, text `#0a0a09`

The headline accent word "haunted" renders in full-ink `#edede6` against the `#82827a` surrounding copy.

## Typography

Both from Google Fonts.

- **Display / headlines / numbers:** `Archivo`, weights 600–900. First-seen ages, stat-strip figures, the `01`–`05` methodology numerals. Use `tabular-nums` on numbers.
- **Body / UI:** `IBM Plex Mono`, weights 400–600. Micro-labels are uppercase + tracked.
- Base size 14px, line-height 1.5 (set on `body`).

## Texture (page backdrop)

Defined once in `index.css`, understated:

- A faint horizontal scanline: `repeating-linear-gradient` with a **4px period** at roughly **1.6% white**, set on the root element so it reaches the iOS safe-area insets.

## Animation

- Named `DURATION` / `EASE` constants in `constants/animations.ts`. All in-flow motion **≤300ms**; no instant visual changes.
- Logo block cursor blink: `@keyframes` at **1.1s** with `steps(1)` timing (hard on/off, no fade).
- Repost-timeline tick positions and other JS-derived values are passed via inline `style` (Tailwind can't statically extract them); everything else uses tokens/utilities.
