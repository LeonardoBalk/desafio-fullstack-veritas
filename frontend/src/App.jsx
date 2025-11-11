import React, { useEffect } from 'react';
import KanbanBoard from './components/KanbanBoard.jsx';

export default function App() {
  // ativa dark mode por padrao
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="bg-neutral-850">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <KanbanBoard />
      </div>
    </div>
  );
}