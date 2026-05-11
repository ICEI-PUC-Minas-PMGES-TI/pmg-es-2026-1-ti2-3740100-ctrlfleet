import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { StatusBadge } from '../common/StatusBadge';

export function UserTable({ onUserAction, users }) {
  return (
    <>
      <div className="table-wrapper">
        <table className="fleet-table admin-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Matrícula</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Ações</th>
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
                <td>{user.matricula}</td>
                <td>{user.role}</td>
                <td>
                  <StatusBadge label={user.status} />
                </td>
                <td>
                  <div className="table-actions">
                    <ActionButtons onUserAction={onUserAction} user={user} />
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
                <dt>Matrícula</dt>
                <dd>{user.matricula}</dd>
              </div>
              <div>
                <dt>Perfil</dt>
                <dd>{user.role}</dd>
              </div>
            </dl>
            <div className="table-actions">
              <ActionButtons labels onUserAction={onUserAction} user={user} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function ActionButtons({ labels = false, onUserAction, user }) {
  const buttonClass = labels ? 'icon-button icon-button--label' : 'icon-button';

  return (
    <>
      <Link
        aria-label={`Editar ${user.name}`}
        className={buttonClass}
        title="Editar usuário"
        to={`/admin/usuarios/${user.id}/editar`}
      >
        <Icon name="edit" />
        {labels ? <span>Editar</span> : null}
      </Link>

      {user.status === 'Pendente' ? (
        <>
          <button
            className={buttonClass}
            onClick={() => onUserAction?.('approve', user)}
            title="Aprovar usuário"
            type="button"
          >
            <Icon name="check" />
            {labels ? <span>Aprovar</span> : null}
          </button>
          <button
            className={`${buttonClass} icon-button--danger`}
            onClick={() => onUserAction?.('reject', user)}
            title="Recusar solicitação"
            type="button"
          >
            <Icon name="close" />
            {labels ? <span>Recusar</span> : null}
          </button>
          <button
            className={buttonClass}
            onClick={() => onUserAction?.('invite', user)}
            title="Reenviar convite"
            type="button"
          >
            <Icon name="mail" />
            {labels ? <span>Convite</span> : null}
          </button>
        </>
      ) : null}

      {user.status === 'Ativo' ? (
        <>
          <button
            className={buttonClass}
            onClick={() => onUserAction?.('resetPassword', user)}
            title="Redefinir senha"
            type="button"
          >
            <Icon name="shield" />
            {labels ? <span>Senha</span> : null}
          </button>
          <button
            className={`${buttonClass} icon-button--danger`}
            onClick={() => onUserAction?.('block', user)}
            title="Bloquear usuário"
            type="button"
          >
            <Icon name="alert" />
            {labels ? <span>Bloquear</span> : null}
          </button>
          <button
            className={`${buttonClass} icon-button--danger`}
            onClick={() => onUserAction?.('deactivate', user)}
            title="Inativar usuário"
            type="button"
          >
            <Icon name="close" />
            {labels ? <span>Inativar</span> : null}
          </button>
        </>
      ) : null}

      {user.status === 'Bloqueado' || user.status === 'Inativo' ? (
        <button
          className={buttonClass}
          onClick={() => onUserAction?.('reactivate', user)}
          title="Reativar usuário"
          type="button"
        >
          <Icon name="check" />
          {labels ? <span>Reativar</span> : null}
        </button>
      ) : null}
    </>
  );
}

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
