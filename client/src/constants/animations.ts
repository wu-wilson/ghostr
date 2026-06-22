/** Named duration constants in milliseconds. All in-flow motion stays at or below 300ms. */
export const DURATION = {
  fast: 150,
  normal: 200,
  smooth: 300,
} as const;

/** Easing curves for CSS transitions. */
export const EASE = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
