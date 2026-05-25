import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { login } from '../../../services/authApi';
import { getAuthSession, getHomePathForSession } from '../../../services/authSession';

const TEST_ACCOUNTS = [
  { perfil: 'Administrador', email: 'ana.costa@ctrlfleet.gov.br' },
  { perfil: 'Gestor de Frota', email: 'joao.duarte@ctrlfleet.gov.br' },
  { perfil: 'Motorista', email: 'patricia.melo@ctrlfleet.gov.br' },
  { perfil: 'Solicitante', email: 'fernando.tavares@ctrlfleet.gov.br' },
];

export function LoginPage() {
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

  return (
    <main className="login-page">
      <section className="login-panel" aria-label="Login CtrlFleet">
        <Link className="public-brand login-panel__brand" to="/">
          <img alt="CtrlFleet" src="/ctrlfleet-logo-icon.png" />
          <span>CtrlFleet</span>
        </Link>

        <div className="login-panel__copy">
          <span className="public-eyebrow">Acesso ao sistema</span>
          <h1>Entre para gerenciar a frota</h1>
          <p>Use seu e-mail institucional e senha para acessar o painel correspondente ao seu perfil.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span>Email institucional</span>
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

          <label className="login-field">
            <span>Senha</span>
            <input
              autoComplete="current-password"
              name="password"
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Digite sua senha"
              required
              type="password"
              value={senha}
            />
          </label>

          {error ? (
            <p className="login-form__error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="login-form__meta">
            <label>
              <input type="checkbox" />
              <span>Lembrar acesso</span>
            </label>
            <a href="mailto:suporte@ctrlfleet.local">Esqueci minha senha</a>
          </div>

          <ActionButton className="login-form__submit" disabled={loading} icon="logout" type="submit">
            {loading ? 'Entrando…' : 'Entrar'}
          </ActionButton>
        </form>

        <aside className="login-test-accounts" aria-label="Contas de teste">
          <p>
            <strong>Contas de teste</strong> (senha: <code>123456</code>)
          </p>
          <ul>
            {TEST_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setSenha('123456');
                    setError('');
                  }}
                >
                  {account.perfil}: {account.email}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}
