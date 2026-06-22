import { ashbyAdapter } from './ashby';
import { greenhouseAdapter } from './greenhouse';
import { leverAdapter } from './lever';
import type { Adapter } from './types';

/** Supported ATS providers — mirrors the `ats_source` enum. */
export type AtsSource = 'greenhouse' | 'lever' | 'ashby';

/** Registry mapping each `ats_source` to its adapter. */
export const adapters: Record<AtsSource, Adapter> = {
  greenhouse: greenhouseAdapter,
  lever: leverAdapter,
  ashby: ashbyAdapter,
};

export type { Adapter, NormalizedListing } from './types';
