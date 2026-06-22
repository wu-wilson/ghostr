import type { PostingSource } from '../types/posting';

/**
 * Format an integer with thousands separators.
 * @param value - The number to format
 * @returns The value with comma group separators (e.g. `1,284`)
 */
export function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

/**
 * Format a 0..1 fraction as a whole-number percentage.
 * @param fraction - A ratio in the range 0..1
 * @returns A percentage string (e.g. `41%`)
 */
export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

/**
 * Capitalize an ATS source for display.
 * @param source - The lowercase provider key
 * @returns The provider name title-cased (e.g. `Greenhouse`)
 */
export function capitalizeSource(source: PostingSource): string {
  return source.charAt(0).toUpperCase() + source.slice(1);
}
