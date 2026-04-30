import { NavLink } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { adminNavigationItems } from '../../data/adminData';

export function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <img alt="CtrlFleet" className="sidebar__logo" src="/ctrlfleet-logo-icon.png" />
          <div>
            <strong>CtrlFleet</strong>
            <span>Administrador</span>
          </div>
        </div>
        <button aria-label="Fechar menu" className="sidebar__close" onClick={onClose} type="button">
          <Icon name="close" />
        </button>
      </div>

      <nav className="sidebar__nav">
        {adminNavigationItems.map((item) => (
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
            <span className="avatar-initials">AC</span>
          </span>
          <div>
            <strong>Ana Costa</strong>
            <span>Administrador</span>
          </div>
        </div>
        <button className="sidebar__logout" type="button">
          <Icon name="logout" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
