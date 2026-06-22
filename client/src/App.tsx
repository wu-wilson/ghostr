import React from 'react';

import { TopBar } from './components/TopBar';
import { BoardView } from './components/Board/BoardView';
import { MethodologyView } from './components/Methodology/MethodologyView';

import { useGhostrStore } from './store/ghostrStore';

/**
 * Root application component. One page with a persistent top bar; the board and
 * methodology views are switched via Zustand state, no router.
 * @returns The app shell
 */
export const App: React.FC = () => {
  const view = useGhostrStore((s) => s.view);

  return (
    <div
      className="mx-auto min-h-dvh w-full"
      style={{
        maxWidth: '1200px',
        paddingLeft: 'clamp(16px, 4vw, 24px)',
        paddingRight: 'clamp(16px, 4vw, 24px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <TopBar />
      {view === 'board' ? <BoardView /> : <MethodologyView />}
    </div>
  );
};
