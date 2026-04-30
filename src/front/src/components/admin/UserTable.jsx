import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { StatusBadge } from '../common/StatusBadge';

export function UserTable({ users }) {
  return (
    <>
      <div className="table-wrapper">
        <table className="fleet-table admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>CPF</th>
              <th>Perfil</th>
              <th>Secretaria</th>
              <th>Status</th>
              <th>Ultimo acesso</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <span className="user-cell__avatar">
                      <span className="avatar-initials">{getInitials(user.name)}</span>
                    </span>
                    <div>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>
                </td>
                <td>{user.cpf}</td>
                <td>{user.role}</td>
                <td>{user.secretariat}</td>
                <td>
                  <StatusBadge label={user.status} />
                </td>
                <td>{user.lastAccess}</td>
                <td>
                  <div className="table-actions">
                    <Link aria-label={`Editar ${user.name}`} className="icon-button" to={`/admin/usuarios/${user.id}/editar`}>
                      <Icon name="edit" />
                    </Link>
                    <button aria-label={`Inativar ${user.name}`} className="icon-button icon-button--danger" type="button">
                      <Icon name="close" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="vehicle-card-list">
        {users.map((user) => (
          <article className="vehicle-card user-card" key={user.id}>
            <div className="vehicle-card__header">
              <span className="user-cell__avatar">
                <span className="avatar-initials">{getInitials(user.name)}</span>
              </span>
              <div>
                <StatusBadge label={user.status} />
                <h3>{user.name}</h3>
                <span>{user.email}</span>
              </div>
            </div>
            <dl className="vehicle-card__meta">
              <div>
                <dt>CPF</dt>
                <dd>{user.cpf}</dd>
              </div>
              <div>
                <dt>Perfil</dt>
                <dd>{user.role}</dd>
              </div>
              <div>
                <dt>Secretaria</dt>
                <dd>{user.secretariat}</dd>
              </div>
              <div>
                <dt>Ultimo acesso</dt>
                <dd>{user.lastAccess}</dd>
              </div>
            </dl>
            <div className="table-actions">
              <Link className="icon-button icon-button--label" to={`/admin/usuarios/${user.id}/editar`}>
                <Icon name="edit" />
                <span>Editar usuario</span>
              </Link>
              <button className="icon-button icon-button--label icon-button--danger" type="button">
                <Icon name="close" />
                <span>Inativar</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
