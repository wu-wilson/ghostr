import React from 'react';

interface GhostMarkProps {
  /** Invoked when the wordmark is clicked; returns to the board. */
  onClick: () => void;
}

/**
 * The "ghostr" wordmark with a blinking block cursor. Clicking returns to the board.
 * @param props - Click handler
 * @returns The wordmark button
 */
export const GhostMark: React.FC<GhostMarkProps> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1 text-ink"
    aria-label="ghostr — back to board"
  >
    <span
      className="font-display font-black"
      style={{ fontSize: '26px', letterSpacing: '-0.04em' }}
    >
      ghostr
    </span>
    <span
      className="animate-ghostr-blink bg-ink"
      style={{ width: '10px', height: '21px' }}
      aria-hidden="true"
    />
  </button>
);
