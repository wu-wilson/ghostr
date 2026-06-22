import React from 'react';

interface GhostGlyphProps {
  /** Rendered width/height; the viewBox is a fixed 24×26. */
  size?: number;
  /** Body fill color (any CSS color or token-backed value). */
  bodyColor?: string;
  /** Eye fill color. */
  eyeColor?: string;
  className?: string;
}

/**
 * Reusable ghost glyph — a domed body with a three-hump scalloped bottom and two
 * rounded-rect eyes. Used in the empty and first-poll-pending states; the favicon
 * uses the same path inline in index.html.
 * @param props - Sizing and color overrides
 * @returns The ghost SVG
 */
export const GhostGlyph: React.FC<GhostGlyphProps> = ({
  size = 48,
  bodyColor = 'rgb(var(--line-2))',
  eyeColor = 'rgb(var(--black))',
  className,
}) => (
  <svg
    width={size}
    height={(size * 26) / 24}
    viewBox="0 0 24 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M3 12a9 9 0 0 1 18 0v11.4l-3 -2.1 -3 2.1 -3 -2.1 -3 2.1 -3 -2.1z"
      fill={bodyColor}
    />
    <rect x="8" y="9" width="2.6" height="4.4" rx="1.3" fill={eyeColor} />
    <rect x="13.4" y="9" width="2.6" height="4.4" rx="1.3" fill={eyeColor} />
  </svg>
);
