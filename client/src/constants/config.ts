/** Base URL of the ghostr API; baked in at Vite build time. */
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

/** GitHub repository URL surfaced in the footer "source on GitHub" link. */
export const GITHUB_URL = 'https://github.com/wu-wilson/ghostr';

/** Number of posting rows revealed per page (initial and per "load more"). */
export const PAGE_SIZE = 6;
