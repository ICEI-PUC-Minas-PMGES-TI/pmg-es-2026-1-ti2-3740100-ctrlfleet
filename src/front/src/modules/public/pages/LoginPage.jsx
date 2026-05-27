import { useEffect, useState, useSyncExternalStore } from 'react';

function subscribeMobileLogin(onStoreChange) {
  const mq = window.matchMedia('(max-width: 768px)');
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getMobileLoginSnapshot() {
  return window.matchMedia('(max-width: 768px)').matches;
}
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { FleetSceneAnimation } from '../../../components/public/FleetSceneAnimation';
import { login } from '../../../services/authApi';
import { getAuthSession, getHomePathForSession } from '../../../services/authSession';

const TEST_ACCOUNTS = [
  { perfil: 'Administrador', email: 'ana.costa@ctrlfleet.gov.br' },
  { perfil: 'Gestor de Frota', email: 'joao.duarte@ctrlfleet.gov.br' },
  { perfil: 'Motorista', email: 'patricia.melo@ctrlfleet.gov.br' },
  { perfil: 'Solicitante', email: 'fernando.tavares@ctrlfleet.gov.br' },
];

export function LoginPage() {
  const isMobileLayout = useSyncExternalStore(
    subscribeMobileLogin,
    getMobileLoginSnapshot,
    () => false,
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(location.state?.message ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (session?.token) {
      navigate(getHomePathForSession(session), { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { homePath } = await login({ email, senha });
      navigate(homePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  function fillTestAccount(account) {
    setEmail(account.email);
    setSenha('123456');
    setError('');
  }

  return (
    <main className={`login-v2${isMobileLayout ? ' login-v2--mobile' : ''}`}>
      {!isMobileLayout ? (
        <section className="login-v2__scene" aria-hidden="true">
          <FleetSceneAnimation variant="login" />
          <div className="login-v2__scene-copy">
            <span className="pub-hero__badge">
              <span className="pub-hero__badge-dot" />
              CtrlFleet · Gestão de frotas
            </span>
            <h1>Operação da frota com visibilidade e controle</h1>
            <p>
              Acompanhe reservas, checklists de saída e retorno, quilometragem e disponibilidade dos
              veículos em tempo real.
            </p>
          </div>
        </section>
      ) : null}

      <section className="login-v2__panel" aria-label="Formulário de login">
        <Link className="login-v2__brand" to="/">
          <img alt="CtrlFleet" src="/ctrlfleet-logo-icon.png" />
          <span>CtrlFleet</span>
        </Link>

        <header className="login-v2__head">
          <h2>Bem-vindo de volta</h2>
          <p>Entre com seu e-mail institucional para acessar o painel do seu perfil.</p>
        </header>

        <form className="login-v2__form" onSubmit={handleSubmit}>
          <label className="login-v2__field">
            <span>E-mail institucional</span>
            <input
              autoComplete="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nome@prefeitura.gov.br"
              required
              type="email"
              value={email}
            />
          </label>

          <label className="login-v2__field">
            <span>Senha</span>
            <input
              autoComplete="current-password"
              name="password"
              onChange={(event) => setSenha(event.target.value)}
              placeholder="••••••••"
              required
              type="password"
              value={senha}
            />
          </label>

          {error ? (
            <p className="login-v2__error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="login-v2__meta">
            <label>
              <input type="checkbox" />
              <span>Manter conectado</span>
            </label>
            <a href="mailto:suporte@ctrlfleet.local">Esqueci minha senha</a>
          </div>

          <ActionButton className="login-v2__submit" disabled={loading} icon="logout" type="submit">
            {loading ? 'Autenticando…' : 'Entrar no sistema'}
          </ActionButton>
        </form>

        <aside className="login-v2__test" aria-label="Contas de demonstração">
          <p>Acesso rápido · senha: 123456</p>
          <div className="login-v2__test-grid">
            {TEST_ACCOUNTS.map((account) => (
              <button
                className="login-v2__test-btn"
                key={account.email}
                onClick={() => fillTestAccount(account)}
                type="button"
              >
                <strong>{account.perfil}</strong>
                <span>{account.email}</span>
              </button>
            ))}
          </div>
        </aside>

        <p className="login-v2__back">
          <Link to="/">← Voltar à página inicial</Link>
        </p>
      </section>
    </main>
  );
}
