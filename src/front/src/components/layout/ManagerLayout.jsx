import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { Sidebar } from './Sidebar';

export function ManagerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen ? (
        <button
          aria-label="Fechar menu"
          className="shell-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          type="button"
        />
      ) : null}

      <div className="app-shell__content">
        <header className="mobile-topbar">
          <button
            aria-label="Abrir menu"
            className="mobile-topbar__toggle"
            onClick={() => setIsSidebarOpen(true)}
            type="button"
          >
            <Icon name="menu" />
          </button>
          <div className="mobile-topbar__brand">
            <Icon name="fleet" />
            <span>CtrlFleet</span>
          </div>
        </header>

        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
