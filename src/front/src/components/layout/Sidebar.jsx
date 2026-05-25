import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { adminNavigationItems } from '../../data/adminData';
import { driverNavigationItems, fleetNavigationItems, requesterNavigationItems } from '../../data/fleetData';
import {
  clearAuthSession,
  getAreaLabel,
  getAuthSession,
  getMotoristaIdFromSession,
  getUserInitials,
} from '../../services/authSession';
import { listarUsuarios } from '../../services/usuarioApi';

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const session = getAuthSession();
  const isAdminArea = location.pathname.startsWith('/admin');
  const isDriverArea = location.pathname.startsWith('/motorista');
  const isRequesterArea = location.pathname.startsWith('/solicitante');
  const motoristaId = String(
    getMotoristaIdFromSession(session) ?? location.pathname.match(/^\/motorista\/(\d+)/)?.[1] ?? '',
  );
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  const navigationItems = useMemo(() => {
    if (isDriverArea && motoristaId) {
      return driverNavigationItems.map((item) => ({
        ...item,
        to: item.to.replace(':motoristaId', motoristaId),
      }));
    }

    if (isRequesterArea) return requesterNavigationItems;
    if (!isAdminArea) return fleetNavigationItems;

    return adminNavigationItems.map((item) => {
      if (item.to !== '/admin/usuarios') return item;
      return {
        ...item,
        badge: pendingUsersCount > 0 ? pendingUsersCount : null,
      };
    });
  }, [isAdminArea, isDriverArea, isRequesterArea, motoristaId, pendingUsersCount]);

  const areaKey = isAdminArea ? 'admin' : isDriverArea ? 'motorista' : isRequesterArea ? 'solicitante' : 'gestor';
  const navigationLabel = getAreaLabel(areaKey);
  const displayName = session?.nome ?? 'Usuário';
  const displayRole = session?.perfilAcesso ?? navigationLabel;
  const initials = getUserInitials(session?.nome);

  useEffect(() => {
    if (!isAdminArea) {
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
            end={item.end}
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
            <span className="avatar-initials">{initials}</span>
          </span>
          <div>
            <strong>{displayName}</strong>
            <span>{displayRole}</span>
          </div>
        </div>
        <Link className="sidebar__logout" to="/login" onClick={clearAuthSession}>
          <Icon name="logout" />
          <span>Sair</span>
        </Link>
      </div>
    </aside>
  );
}
