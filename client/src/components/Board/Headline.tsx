import React from 'react';

/**
 * Board headline and premise paragraph. "haunted." is the only full-ink word.
 * @returns The headline section
 */
export const Headline: React.FC = () => (
  <section
    className="border-b border-line-2"
    style={{
      paddingTop: 'clamp(34px, 7vw, 54px)',
      paddingBottom: 'clamp(28px, 5vw, 40px)',
    }}
  >
    <h1
      className="font-display font-extrabold text-muted-4"
      style={{
        fontSize: 'clamp(30px, 8vw, 46px)',
        lineHeight: 1.04,
        letterSpacing: '-0.035em',
        maxWidth: '820px',
      }}
    >
      Every job board is a little bit <span className="text-ink">haunted.</span>
    </h1>
    <p
      className="text-muted-2"
      style={{ marginTop: '22px', maxWidth: '580px', fontSize: '15px', lineHeight: 1.65 }}
    >
      ghostr polls public ATS feeds every day and tracks each posting over time — surfacing its
      true first-seen age and every quiet relist, so the ghost jobs lingering for months can't pass
      themselves off as posted today.
    </p>
  </section>
);
