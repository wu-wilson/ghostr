import { create } from 'zustand';

import { PAGE_SIZE } from '../constants/config';

import type { PostingFilter, PostingSort } from '../types/posting';

/** Which top-level view is rendered. No router — switched purely via store state. */
export type GhostrView = 'board' | 'methodology';

/** Global UI state for the board and view switching. */
interface GhostrStore {
  view: GhostrView;
  /** Case-insensitive company/role search query. */
  query: string;
  filter: PostingFilter;
  sort: PostingSort;
  /** Job id of the currently expanded row, or null when none is open. */
  expandedId: number | null;
  /** Number of rows currently revealed (grows by PAGE_SIZE on "load more"). */
  visible: number;

  setQuery: (query: string) => void;
  setFilter: (filter: PostingFilter) => void;
  setSort: (sort: PostingSort) => void;
  toggleExpanded: (id: number) => void;
  loadMore: () => void;
  openMethodology: () => void;
  closeMethodology: () => void;
}

/**
 * Zustand store for ghostr's view switching and board controls.
 * Changing search/filter/sort resets pagination to one page and clears the expanded row.
 * View switches scroll the window back to the top.
 */
export const useGhostrStore = create<GhostrStore>((set) => ({
  view: 'board',
  query: '',
  filter: 'all',
  sort: 'oldest',
  expandedId: null,
  visible: PAGE_SIZE,

  setQuery: (query) => {
    set({ query, visible: PAGE_SIZE, expandedId: null });
  },

  setFilter: (filter) => {
    set({ filter, visible: PAGE_SIZE, expandedId: null });
  },

  setSort: (sort) => {
    set({ sort, visible: PAGE_SIZE, expandedId: null });
  },

  toggleExpanded: (id) => {
    set((state) => ({ expandedId: state.expandedId === id ? null : id }));
  },

  loadMore: () => {
    set((state) => ({ visible: state.visible + PAGE_SIZE }));
  },

  openMethodology: () => {
    window.scrollTo(0, 0);
    set({ view: 'methodology' });
  },

  closeMethodology: () => {
    window.scrollTo(0, 0);
    set({ view: 'board' });
  },
}));
