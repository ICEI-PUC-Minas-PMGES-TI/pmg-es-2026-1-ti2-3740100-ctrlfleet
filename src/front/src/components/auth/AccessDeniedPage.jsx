import { Link } from 'react-router-dom';
import { ActionButton } from '../common/ActionButton';
import { clearAuthSession } from '../../services/authSession';

export function AccessDeniedPage({ title = 'Acesso negado', message, homePath = '/login', homeLabel = 'Ir para login' }) {
  return (
    <main className="access-denied-page">
      <section className="access-denied-panel">
        <span className="public-eyebrow">403</span>
        <h1>{title}</h1>
        <p>{message}</p>
        <div className="access-denied-panel__actions">
          <ActionButton icon="logout" to={homePath}>
            {homeLabel}
          </ActionButton>
          <Link className="access-denied-panel__link" to="/login" onClick={clearAuthSession}>
            Fazer login com outra conta
          </Link>
        </div>
      </section>
    </main>
  );
}
