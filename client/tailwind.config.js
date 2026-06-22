/** @type {import('tailwindcss').Config} */

/** Reference a channel-based CSS custom property so Tailwind opacity modifiers resolve. */
const ch = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      md: '760px',
    },
    extend: {
      colors: {
        page: ch('--page'),
        raised: ch('--raised'),
        black: ch('--black'),
        ink: ch('--ink'),
        muted: {
          1: ch('--muted-1'),
          2: ch('--muted-2'),
          3: ch('--muted-3'),
          4: ch('--muted-4'),
          5: ch('--muted-5'),
          6: ch('--muted-6'),
        },
        line: {
          1: ch('--line-1'),
          2: ch('--line-2'),
          3: ch('--line-3'),
          4: ch('--line-4'),
        },
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
