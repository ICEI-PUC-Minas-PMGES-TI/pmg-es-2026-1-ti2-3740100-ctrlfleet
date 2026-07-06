import { useEffect, useState } from 'react';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { alterarSenha, atualizarPerfil, buscarPerfilAtual } from '../../../services/perfilApi';
import { getAuthSession, getUserInitials, saveAuthSession } from '../../../services/authSession';
import {
  formatBrDate,
  mapBackendUserToView,
} from '../../../services/usuarioMappers';

const fieldPatterns = {
  name: "[A-Za-zÀ-ÿ .'-]{2,120}",
};

export function ProfilePage() {
  const session = getAuthSession();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [profile, setProfile] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaConfirmacao, setSenhaConfirmacao] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');

    buscarPerfilAtual({ signal: controller.signal })
      .then((dto) => {
        const view = mapBackendUserToView(dto);
        setProfile(view);
        setNome(view.name || '');
        setEmail(view.email || '');
        setLoading(false);
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setLoadError(error.message || 'Não foi possível carregar seu perfil.');
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setProfileError('');
    setProfileMessage('');
    setProfileSubmitting(true);

    try {
      const dto = await atualizarPerfil({ nome: nome.trim(), email: email.trim() });
      const view = mapBackendUserToView(dto);
      setProfile(view);
      setNome(view.name || '');
      setEmail(view.email || '');

      if (session) {
        saveAuthSession({
          ...session,
          nome: dto.nome,
          email: dto.email,
        });
        window.dispatchEvent(new Event('ctrlfleet:session-updated'));
      }

      setProfileMessage('Informações pessoais atualizadas com sucesso.');
    } catch (error) {
      setProfileError(error.message || 'Não foi possível salvar as alterações.');
    } finally {
      setProfileSubmitting(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (senhaNova !== senhaConfirmacao) {
      setPasswordError('A confirmação da nova senha não confere.');
      return;
    }

    if (senhaNova.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setPasswordSubmitting(true);

    try {
      await alterarSenha({ senhaAtual, senhaNova });
      setSenhaAtual('');
      setSenhaNova('');
      setSenhaConfirmacao('');
      setPasswordMessage('Senha alterada com sucesso.');
    } catch (error) {
      setPasswordError(error.message || 'Não foi possível alterar a senha.');
    } finally {
      setPasswordSubmitting(false);
    }
  }

  const initials = getUserInitials(profile?.name || session?.nome);
  const isMotorista = profile?.role === 'Motorista';

  return (
    <div className="page-stack profile-page">
      <PageHeader
        subtitle="Consulte seus dados, atualize informações pessoais e altere sua senha de acesso."
        title="Meu perfil"
      />

      {loading ? (
        <div className="admin-dashboard__loading">
          <span className="admin-dashboard__spinner" aria-hidden="true" />
          <p>Carregando perfil...</p>
        </div>
      ) : loadError ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <div>
            <strong>Falha ao carregar perfil</strong>
            <p>{loadError}</p>
          </div>
        </div>
      ) : (
        <>
          <section className="profile-page__hero">
            <span className="profile-page__avatar">
              <span className="avatar-initials">{initials}</span>
            </span>
            <div>
              <h2>{profile?.name}</h2>
              <p>{profile?.email}</p>
              <div className="profile-page__badges">
                <StatusBadge label={profile?.status || 'Ativo'} />
                <span className="profile-page__role">{profile?.role}</span>
              </div>
            </div>
          </section>

          <SectionCard title="Informações pessoais">
            <form className="profile-page__form" onSubmit={handleProfileSubmit}>
              <div className="admin-form-grid">
                <label className="admin-form-field">
                  <span className="admin-form-field__label">
                    Nome completo <span className="admin-form-field__req">*</span>
                  </span>
                  <input
                    className="admin-form-field__input"
                    maxLength={120}
                    onChange={(event) => setNome(event.target.value)}
                    pattern={fieldPatterns.name}
                    required
                    type="text"
                    value={nome}
                  />
                </label>

                <label className="admin-form-field">
                  <span className="admin-form-field__label">
                    E-mail institucional <span className="admin-form-field__req">*</span>
                  </span>
                  <input
                    autoComplete="email"
                    className="admin-form-field__input"
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    type="email"
                    value={email}
                  />
                </label>

                <label className="admin-form-field">
                  <span className="admin-form-field__label">Matrícula</span>
                  <input
                    className="admin-form-field__input"
                    disabled
                    readOnly
                    type="text"
                    value={profile?.matricula || '—'}
                  />
                </label>

                <label className="admin-form-field">
                  <span className="admin-form-field__label">Perfil de acesso</span>
                  <input
                    className="admin-form-field__input"
                    disabled
                    readOnly
                    type="text"
                    value={profile?.role || '—'}
                  />
                </label>

                {profile?.cargo ? (
                  <label className="admin-form-field">
                    <span className="admin-form-field__label">Cargo</span>
                    <input
                      className="admin-form-field__input"
                      disabled
                      readOnly
                      type="text"
                      value={profile.cargo}
                    />
                  </label>
                ) : null}

                {profile?.dataAdmissao ? (
                  <label className="admin-form-field">
                    <span className="admin-form-field__label">Data de admissão</span>
                    <input
                      className="admin-form-field__input"
                      disabled
                      readOnly
                      type="text"
                      value={formatBrDate(profile.dataAdmissao)}
                    />
                  </label>
                ) : null}
              </div>

              {isMotorista ? (
                <div className="profile-page__readonly-block">
                  <h3>Dados de motorista</h3>
                  <dl className="admin-modal-list">
                    <div>
                      <dt>CNH</dt>
                      <dd>{profile?.cnh || '—'}</dd>
                    </div>
                    <div>
                      <dt>Validade da CNH</dt>
                      <dd>{formatBrDate(profile?.cnhExpiry)}</dd>
                    </div>
                  </dl>
                  <p className="profile-page__hint">
                    Alterações de CNH devem ser solicitadas ao administrador do sistema.
                  </p>
                </div>
              ) : null}

              {profileError ? <p className="profile-page__feedback profile-page__feedback--error">{profileError}</p> : null}
              {profileMessage ? (
                <p className="profile-page__feedback profile-page__feedback--success">{profileMessage}</p>
              ) : null}

              <div className="profile-page__actions">
                <ActionButton disabled={profileSubmitting} icon="check" type="submit">
                  {profileSubmitting ? 'Salvando...' : 'Salvar informações'}
                </ActionButton>
              </div>
            </form>
          </SectionCard>

          <SectionCard title="Alterar senha">
            <form className="profile-page__form" onSubmit={handlePasswordSubmit}>
              <div className="admin-form-grid">
                <label className="admin-form-field admin-form-field--full">
                  <span className="admin-form-field__label">
                    Senha atual <span className="admin-form-field__req">*</span>
                  </span>
                  <input
                    autoComplete="current-password"
                    className="admin-form-field__input"
                    onChange={(event) => setSenhaAtual(event.target.value)}
                    required
                    type="password"
                    value={senhaAtual}
                  />
                </label>

                <label className="admin-form-field admin-form-field--full">
                  <span className="admin-form-field__label">
                    Nova senha <span className="admin-form-field__req">*</span>
                  </span>
                  <input
                    autoComplete="new-password"
                    className="admin-form-field__input"
                    minLength={6}
                    onChange={(event) => setSenhaNova(event.target.value)}
                    required
                    type="password"
                    value={senhaNova}
                  />
                </label>

                <label className="admin-form-field admin-form-field--full">
                  <span className="admin-form-field__label">
                    Confirmar nova senha <span className="admin-form-field__req">*</span>
                  </span>
                  <input
                    autoComplete="new-password"
                    className="admin-form-field__input"
                    minLength={6}
                    onChange={(event) => setSenhaConfirmacao(event.target.value)}
                    required
                    type="password"
                    value={senhaConfirmacao}
                  />
                </label>
              </div>

              <p className="profile-page__hint">
                Use pelo menos 6 caracteres. Para recuperação de acesso, entre em contato com o administrador.
              </p>

              {passwordError ? (
                <p className="profile-page__feedback profile-page__feedback--error">{passwordError}</p>
              ) : null}
              {passwordMessage ? (
                <p className="profile-page__feedback profile-page__feedback--success">{passwordMessage}</p>
              ) : null}

              <div className="profile-page__actions">
                <ActionButton disabled={passwordSubmitting} icon="shield" type="submit" variant="secondary">
                  {passwordSubmitting ? 'Alterando...' : 'Alterar senha'}
                </ActionButton>
              </div>
            </form>
          </SectionCard>
        </>
      )}
    </div>
  );
}
