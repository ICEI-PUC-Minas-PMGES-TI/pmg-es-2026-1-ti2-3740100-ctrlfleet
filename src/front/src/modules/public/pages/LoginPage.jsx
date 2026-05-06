import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';

export function LoginPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState('gestor');

  function handleSubmit(event) {
    event.preventDefault();
    navigate(profile === 'admin' ? '/admin/dashboard' : '/gestor/dashboard');
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
          <p>Use seu perfil institucional para acessar painéis, reservas, usuários e manutenção.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-profile-switch" role="group" aria-label="Perfil de acesso">
            <button
              className={profile === 'gestor' ? 'is-active' : ''}
              onClick={() => setProfile('gestor')}
              type="button"
            >
              Gestor
            </button>
            <button
              className={profile === 'admin' ? 'is-active' : ''}
              onClick={() => setProfile('admin')}
              type="button"
            >
              Admin
            </button>
          </div>

          <label className="login-field">
            <span>Email institucional</span>
            <input autoComplete="email" name="email" placeholder="nome@prefeitura.gov.br" type="email" />
          </label>

          <label className="login-field">
            <span>Senha</span>
            <input autoComplete="current-password" name="password" placeholder="Digite sua senha" type="password" />
          </label>

          <div className="login-form__meta">
            <label>
              <input type="checkbox" />
              <span>Lembrar acesso</span>
            </label>
            <a href="mailto:suporte@ctrlfleet.local">Esqueci minha senha</a>
          </div>

          <ActionButton className="login-form__submit" icon="logout" type="submit">
            Entrar
          </ActionButton>
        </form>
      </section>
    </main>
  );
}
