import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { adminNavigationItems } from '../../data/adminData';
import { fleetNavigationItems } from '../../data/fleetData';

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');
  const navigationItems = isAdminArea ? adminNavigationItems : fleetNavigationItems;
  const navigationLabel = isAdminArea ? 'Administração' : 'Gestor de Frotas';

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
