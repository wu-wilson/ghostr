import React from 'react';

import { Footer } from '../common/Footer';

import { useGhostrStore } from '../../store/ghostrStore';

import { DURATION } from '../../constants/animations';

interface MethodologyRow {
  number: string;
  title: string;
  body: string;
}

const ROWS: MethodologyRow[] = [
  {
    number: '01',
    title: 'Daily polling',
    body: "Once every 24 hours we read each company's public applicant-tracking feed — Greenhouse, Lever, Ashby — and snapshot every open posting. We only touch endpoints the company already publishes; nothing behind a login is scraped, and we store the posting's stable ID, not applicant data.",
  },
  {
    number: '02',
    title: 'True age',
    body: 'A board shows the date a listing was last edited — so a one-character change resets it to "posted today." We record the first calendar day we ever saw a posting ID and never move it. That first-seen date is the real age, even when the board insists the role is brand new.',
  },
  {
    number: '03',
    title: 'Repost detection',
    body: 'When a posting disappears and a matching role — same title, location, and department — reappears under a fresh ID within 30 days, we link them into one repost chain. The repost count is how many times that chain has been relisted. A chain\'s age always traces back to the earliest link, never the newest.',
  },
  {
    number: '04',
    title: 'The conclusion is yours',
    body: 'ghostr reports only what it directly observed — the first-seen date, every relist, and whether salary is disclosed — and stops there. The same dates that read as a stalled hire to one person are an honest hard-to-fill role to another. We give you the record; the reading is yours.',
  },
  {
    number: '05',
    title: "What we don't claim",
    body: 'A long-open role can be a genuinely hard hire; a repost can be a real backfill; hidden salary can be policy, not malice. ghostr surfaces the pattern and the dates — never an accusation. We publish our matching rules and revise them in the open.',
  },
];

/**
 * The methodology view: header, intro, five numbered method rows, and the shared footer
 * (with a "back to board" control). Reached via the top-bar methodology link.
 * @returns The methodology view
 */
export const MethodologyView: React.FC = () => {
  const closeMethodology = useGhostrStore((s) => s.closeMethodology);

  return (
    <div>
      <button
        type="button"
        onClick={closeMethodology}
        className="mt-6 uppercase text-muted-3 transition-colors hover:text-ink"
        style={{ fontSize: '12px', letterSpacing: '0.1em', transitionDuration: `${DURATION.fast}ms` }}
      >
        ← back to board
      </button>

      <section
        className="border-b border-line-2"
        style={{ paddingTop: 'clamp(28px, 5vw, 42px)', paddingBottom: 'clamp(28px, 5vw, 40px)' }}
      >
        <div className="uppercase text-ink" style={{ fontSize: '11px', letterSpacing: '0.18em' }}>
          methodology
        </div>
        <h1
          className="mt-4 font-display font-extrabold text-muted-4"
          style={{ fontSize: 'clamp(30px, 8vw, 46px)', lineHeight: 1.04, letterSpacing: '-0.035em', maxWidth: '820px' }}
        >
          We don't guess intent. We <span className="text-ink">timestamp the evidence.</span>
        </h1>
        <p className="mt-5 text-muted-2" style={{ fontSize: '15px', lineHeight: 1.7, maxWidth: '600px' }}>
          ghostr never decides whether a job is "real," and never estimates how long a role takes to
          fill — a ghost posting may never close, so any such figure would be a guess. It records only
          what public boards quietly overwrite: when a posting first appeared and how often it's been
          relisted. Here's exactly how each number is produced.
        </p>
      </section>

      {ROWS.map((row) => (
        <section
          key={row.number}
          className="grid gap-x-11 gap-y-3 border-b border-line-1 py-8 md:grid-cols-[230px_1fr]"
        >
          <div>
            <div className="font-display font-extrabold text-ink" style={{ fontSize: '30px' }}>
              {row.number}
            </div>
            <div className="mt-1 text-ink" style={{ fontSize: '15px' }}>
              {row.title}
            </div>
          </div>
          <p className="text-muted-1" style={{ fontSize: '14px', lineHeight: 1.75, maxWidth: '620px' }}>
            {row.body}
          </p>
        </section>
      ))}

      <Footer backToBoard />
    </div>
  );
};
