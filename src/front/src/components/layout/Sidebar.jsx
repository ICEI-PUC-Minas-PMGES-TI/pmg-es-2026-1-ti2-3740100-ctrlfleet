import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { adminNavigationItems } from '../../data/adminData';
import { fleetNavigationItems } from '../../data/fleetData';
import { listarUsuarios } from '../../services/usuarioApi';

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const navigationItems = useMemo(() => {
    if (!isAdminArea) return fleetNavigationItems;

    return adminNavigationItems.map((item) => {
      if (item.to !== '/admin/usuarios') return item;
      return {
        ...item,
        badge: pendingUsersCount > 0 ? pendingUsersCount : null,
      };
    });
  }, [isAdminArea, pendingUsersCount]);
  const navigationLabel = isAdminArea ? 'Administração' : 'Gestor de Frotas';

  useEffect(() => {
    if (!isAdminArea) {
      setPendingUsersCount(0);
      return undefined;
    }

    let ignore = false;

    async function refreshPendingUsersCount() {
      try {
        const usuarios = await listarUsuarios();
        if (ignore) return;
        const pendingCount = usuarios.filter((usuario) => usuario.status === 'PENDENTE').length;
        setPendingUsersCount(pendingCount);
      } catch {
        if (!ignore) setPendingUsersCount(0);
      }
    }

    refreshPendingUsersCount();
    window.addEventListener('focus', refreshPendingUsersCount);
    window.addEventListener('ctrlfleet:usuarios-updated', refreshPendingUsersCount);

    return () => {
      ignore = true;
      window.removeEventListener('focus', refreshPendingUsersCount);
      window.removeEventListener('ctrlfleet:usuarios-updated', refreshPendingUsersCount);
    };
  }, [isAdminArea]);

  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <img alt="CtrlFleet" className="sidebar__logo" src="/ctrlfleet-logo-icon.png" />
          <div>
            <strong>CtrlFleet</strong>
            <span>{navigationLabel}</span>
          </div>
        </div>
        <button aria-label="Fechar menu" className="sidebar__close" onClick={onClose} type="button">
          <Icon name="close" />
        </button>
      </div>

      <nav className="sidebar__nav">
        {navigationItems.map((item) => (
          <NavLink
            className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
            key={item.to}
            onClick={onClose}
            to={item.to}
          >
            <span className="sidebar__link-copy">
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </span>
            {item.badge ? <span className="sidebar__badge">{item.badge}</span> : null}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__profile">
          <span className="sidebar__avatar">
            <span className="avatar-initials">{isAdminArea ? 'AS' : 'AC'}</span>
          </span>
          <div>
            <strong>{isAdminArea ? 'Ana Souza' : 'Ana Costa'}</strong>
            <span>{isAdminArea ? 'Admin Setorial' : navigationLabel}</span>
          </div>
        </div>
        <Link className="sidebar__logout" to="/login">
          <Icon name="logout" />
          <span>Sair</span>
        </Link>
      </div>
    </aside>
  );
}
