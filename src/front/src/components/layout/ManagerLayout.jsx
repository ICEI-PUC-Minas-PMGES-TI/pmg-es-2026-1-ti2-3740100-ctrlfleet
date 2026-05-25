import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { Sidebar } from './Sidebar';
import { listarNotificacoesPendentes } from '../../services/notificacaoApi';

export function ManagerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!isAdminArea) {
      setNotifCount(0);
      return;
    }
    listarNotificacoesPendentes().then((lista) => setNotifCount(lista.length));
  }, [isAdminArea, location.pathname]);

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

          {isAdminArea && (
            <Link
              aria-label={`${notifCount} notificações pendentes`}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: 'auto', padding: '6px' }}
              to="/admin/auditoria"
            >
              <Icon name="alert" />
              {notifCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '999px',
                  background: '#d84f38',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  {notifCount > 99 ? '99+' : notifCount}
                </span>
              )}
            </Link>
          )}
        </header>

        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
