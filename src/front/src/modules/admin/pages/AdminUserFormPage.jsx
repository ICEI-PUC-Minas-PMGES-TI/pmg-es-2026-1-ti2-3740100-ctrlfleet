import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { atualizarUsuario, buscarUsuario, criarUsuario } from '../../../services/usuarioApi';
import { formatBrDateInput, resolvePerfil, resolveStatus } from '../../../services/usuarioMappers';

const roleOptions = ['Administrador', 'Gestor de Frota', 'Motorista', 'Servidor Solicitante'];
const statusOptions = ['Ativo', 'Pendente', 'Bloqueado', 'Inativo'];

const accessProfileOptions = ['Solicitante', 'Administrador', 'Gestor de Frota', 'Motorista'];
const fieldPatterns = {
  name: "[A-Za-zÀ-ÿ .'-]{2,120}",
  registration: '[0-9]{1,10}',
  brDate: '(0?[1-9]|[12][0-9]|3[01])/(0?[1-9]|1[0-2])/[0-9]{4}',
  cnh: '[0-9]{11}',
};
const fieldHints = {
  name: 'Use apenas letras, espacos, ponto, apostrofo ou hifen.',
  registration: 'Digite apenas o numero da matricula. O prefixo MAT- sera aplicado automaticamente.',
  brDate: 'Use uma data no formato dd/mm/aaaa.',
  cnh: 'Informe exatamente 11 numeros.',
};

const cargoPorPerfilAcesso = {
  Solicitante: 'Servidor Solicitante',
  Administrador: 'Administrador',
  'Gestor de Frota': 'Gestor de Frota',
  Motorista: 'Motorista',
};

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const symbols = '!@#$%&*';
  let pwd = '';
  for (let i = 0; i < 9; i += 1) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  pwd += symbols[Math.floor(Math.random() * symbols.length)];
  for (let i = 0; i < 2; i += 1) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

function keepOnlyDigits(event) {
  event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '');
}

function getMatriculaNumber(matricula) {
  return String(matricula || '').replace(/^MAT-/i, '').replace(/\D/g, '');
}

export function AdminUserFormPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const isCreateMode = !userId;

  const [accessProfile, setAccessProfile] = useState('Solicitante');
  const [editAccessProfile, setEditAccessProfile] = useState('Servidor Solicitante');
  const [editStatus, setEditStatus] = useState('Ativo');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(!isCreateMode);
  const [loadError, setLoadError] = useState('');
  const [tempPassword, setTempPassword] = useState('F1eet@2024!');
  const [sendCredentialsByEmail, setSendCredentialsByEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isCreateMode) return undefined;

    const controller = new AbortController();
    setLoadingUser(true);
    setLoadError('');

    buscarUsuario(userId, { signal: controller.signal })
      .then((dto) => {
        setSelectedUser(dto);
        setEditAccessProfile(resolvePerfil(dto) || 'Servidor Solicitante');
        setEditStatus(resolveStatus(dto));
        setLoadingUser(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setLoadError(err instanceof Error ? err.message : 'Erro ao carregar usuário.');
        setLoadingUser(false);
      });

    return () => controller.abort();
  }, [isCreateMode, userId]);

  async function handleCreateSubmit(event) {
    event.preventDefault();
    setSubmitError('');
    const form = event.currentTarget;
    const fd = new FormData(form);

    const admissionDate = String(fd.get('admissionDate') ?? '').trim();
    const isMotorista = accessProfile === 'Motorista';
    const cargoAutomatico = cargoPorPerfilAcesso[accessProfile] ?? accessProfile;

    const payload = {
      nome: String(fd.get('fullName') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      senha: tempPassword,
      matricula: String(fd.get('registration') ?? '').trim(),
      perfilAcesso: accessProfile,
      cargo: cargoAutomatico,
      dataAdmissao: admissionDate.length > 0 ? admissionDate : null,
      tipoCadastro: isMotorista ? 'motorista' : 'usuario',
      numeroCnh: isMotorista ? String(fd.get('cnh') ?? '').trim() : null,
      cnhValidade: isMotorista ? String(fd.get('cnhExpiry') ?? '').trim() : null,
      enviarCredenciaisEmail: sendCredentialsByEmail,
    };

    setSubmitting(true);
    try {
      await criarUsuario(payload);
      window.dispatchEvent(new Event('ctrlfleet:usuarios-updated'));
      window.alert('Usuário cadastrado com sucesso!');
      navigate('/admin/usuarios');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cadastrar usuário.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitEdit(event) {
    event.preventDefault();
    if (!selectedUser) return;

    setSubmitError('');
    const form = event.currentTarget;
    const fd = new FormData(form);
    const isMotorista = editAccessProfile === 'Motorista';
    const cargoAutomatico = cargoPorPerfilAcesso[editAccessProfile] ?? editAccessProfile;

    const payload = {
      nome: String(fd.get('fullName') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      matricula: String(fd.get('registration') ?? '').trim(),
      perfilAcesso: editAccessProfile,
      status: editStatus,
      cargo: cargoAutomatico,
      dataAdmissao: String(fd.get('admissionDate') ?? '').trim() || null,
      tipoCadastro: isMotorista ? 'motorista' : 'usuario',
      numeroCnh: isMotorista ? String(fd.get('cnh') ?? '').trim() : null,
      cnhValidade: isMotorista ? String(fd.get('cnhExpiry') ?? '').trim() : null,
    };

    setSubmitting(true);
    try {
      await atualizarUsuario(userId, payload);
      window.dispatchEvent(new Event('ctrlfleet:usuarios-updated'));
      window.alert('Usuario atualizado com sucesso!');
      navigate('/admin/usuarios');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar usuário.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (isCreateMode) {
    return (
      <div className="page-stack page-stack--admin-create-user">
        <header className="admin-user-create__page-title">
          <h1>Criar Novo Usuário</h1>
          <p>
            Defina o perfil de acesso (papel no sistema). Para motoristas, informe também a CNH e a validade — os
            demais perfis compartilham a mesma ficha de usuário, sem dados de habilitação.
          </p>
        </header>

        <div className="admin-user-create-card">
          <form onSubmit={handleCreateSubmit}>
            {submitError ? (
              <p className="admin-user-create__error" role="alert">
                {submitError}
              </p>
            ) : null}
            <div className="admin-user-create__form-grid">
              <label className="admin-form-field admin-form-field--full">
                <span className="admin-form-field__label">
                  Nome completo
                  <span className="admin-form-field__req" title="Obrigatório">
                    *
                  </span>
                </span>
                <input
                  className="admin-form-field__input"
                  maxLength={120}
                  name="fullName"
                  pattern={fieldPatterns.name}
                  placeholder="Digite o nome completo"
                  required
                  title={fieldHints.name}
                  type="text"
                />
              </label>

              <label className="admin-form-field">
                <span className="admin-form-field__label">
                  Matrícula
                  <span className="admin-form-field__req">*</span>
                </span>
                <div className="matricula-input">
                  <span className="matricula-input__prefix">MAT-</span>
                  <input
                    className="admin-form-field__input"
                    inputMode="numeric"
                    maxLength={10}
                    name="registration"
                    onInput={keepOnlyDigits}
                    pattern={fieldPatterns.registration}
                    placeholder="0001"
                    required
                    title={fieldHints.registration}
                    type="text"
                  />
                </div>
              </label>

              <label className="admin-form-field">
                <span className="admin-form-field__label">
                  Email
                  <span className="admin-form-field__req">*</span>
                </span>
                <input
                  className="admin-form-field__input"
                  autoComplete="email"
                  maxLength={160}
                  name="email"
                  placeholder="usuario@prefeitura.gov.br"
                  required
                  type="email"
                />
              </label>

              <div className="admin-form-field">
                <span className="admin-form-field__label">
                  Perfil de acesso
                  <span className="admin-form-field__req">*</span>
                </span>
                <div className="admin-form-field__select-wrap">
                  <select
                    aria-describedby="access-profile-hint"
                    className="admin-form-field__select"
                    name="accessProfile"
                    onChange={(e) => setAccessProfile(e.target.value)}
                    value={accessProfile}
                  >
                    {accessProfileOptions.map((profile) => (
                      <option key={profile} value={profile}>
                        {profile}
                      </option>
                    ))}
                  </select>
                  <Icon className="admin-form-field__chevron" name="chevronDown" />
                </div>
                <p className="admin-user-create__field-hint" id="access-profile-hint">
                  O cargo enviado ao cadastro segue automaticamente este perfil:{' '}
                  <strong>{cargoPorPerfilAcesso[accessProfile]}</strong>.
                </p>
              </div>

              <label className="admin-form-field admin-form-field--date">
                <span className="admin-form-field__label">Data admissão</span>
                <div className="admin-form-field__input-wrap">
                  <input
                    className="admin-form-field__input"
                    maxLength={10}
                    name="admissionDate"
                    pattern={fieldPatterns.brDate}
                    placeholder="dd/mm/aaaa"
                    title={fieldHints.brDate}
                    type="text"
                  />
                  <Icon className="admin-form-field__date-icon" name="calendar" />
                </div>
              </label>

              {accessProfile === 'Motorista' ? (
                <div className="admin-user-create__motorista-block admin-form-field--full">
                  <h2 className="admin-user-create__motorista-title">Dados do motorista</h2>
                  <p className="admin-user-create__motorista-lead">
                    Obrigatório para perfil Motorista: habilitação e validade, armazenados como dados específicos de
                    domínio (entidade motorista), separados da conta de usuário.
                  </p>
                  <div className="admin-user-create__form-grid admin-user-create__form-grid--nested">
                    <label className="admin-form-field">
                      <span className="admin-form-field__label">
                        Número da CNH
                        <span className="admin-form-field__req">*</span>
                      </span>
                      <input
                        className="admin-form-field__input"
                        inputMode="numeric"
                        maxLength={11}
                        name="cnh"
                        onInput={keepOnlyDigits}
                        pattern={fieldPatterns.cnh}
                        placeholder="Ex.: 00000000000"
                        required
                        title={fieldHints.cnh}
                        type="text"
                      />
                    </label>
                    <label className="admin-form-field admin-form-field--date">
                      <span className="admin-form-field__label">
                        Validade da CNH
                        <span className="admin-form-field__req">*</span>
                      </span>
                      <div className="admin-form-field__input-wrap">
                        <input
                          className="admin-form-field__input"
                          maxLength={10}
                          name="cnhExpiry"
                          pattern={fieldPatterns.brDate}
                          placeholder="dd/mm/aaaa"
                          required
                          title={fieldHints.brDate}
                          type="text"
                        />
                        <Icon className="admin-form-field__date-icon" name="calendar" />
                      </div>
                    </label>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="admin-user-create__security">
              <h2 className="admin-user-create__security-heading">Segurança</h2>
              <label className="admin-form-field admin-form-field--full" htmlFor="temp-password">
                <span className="admin-form-field__label">Senha temporária</span>
              </label>
              <div className="admin-user-create__password-row">
                <input
                  aria-label="Senha temporária"
                  autoComplete="new-password"
                  className="admin-form-field__input"
                  id="temp-password"
                  name="temporaryPassword"
                  readOnly
                  value={tempPassword}
                />
                <button
                  aria-label="Gerar nova senha temporária"
                  className="admin-user-create__password-refresh"
                  onClick={() => setTempPassword(generateTemporaryPassword())}
                  type="button"
                >
                  <Icon name="refresh" />
                </button>
              </div>

              <label className="admin-user-create__email-opt">
                <input
                  checked={sendCredentialsByEmail}
                  name="sendCredentialsEmail"
                  onChange={() => setSendCredentialsByEmail((v) => !v)}
                  type="checkbox"
                />
                <span className="admin-user-create__email-opt-box" />
                <span>Enviar credenciais por email automaticamente</span>
              </label>
            </div>

            <div className="admin-user-create__actions">
              <ActionButton className="action-button--secondary" to="/admin/usuarios" variant="secondary">
                Cancelar
              </ActionButton>
              <button className="action-button action-button--primary" disabled={submitting} type="submit">
                {submitting ? 'Salvando…' : 'Cadastrar usuário'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loadingUser) {
    return (
      <div className="page-stack">
        <PageHeader subtitle="Carregando dados cadastrados no banco." title="Editar usuário" />
        <SectionCard>
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Carregando usuário...</p>
          </div>
        </SectionCard>
      </div>
    );
  }

  if (loadError || !selectedUser) {
    return (
      <div className="page-stack">
        <PageHeader subtitle="Não foi possível abrir este cadastro." title="Editar usuário" />
        <SectionCard>
          <div className="admin-dashboard__error" role="alert">
            <Icon name="alert" />
            <div>
              <strong>Falha ao carregar usuário</strong>
              <p>{loadError || 'Usuario nao encontrado.'}</p>
            </div>
          </div>
          <div className="form-actions">
            <ActionButton to="/admin/usuarios" variant="secondary">
              Voltar
            </ActionButton>
          </div>
        </SectionCard>
      </div>
    );
  }

  const selectedUserProfile = editAccessProfile || resolvePerfil(selectedUser) || 'Servidor Solicitante';
  const selectedUserStatus = editStatus || resolveStatus(selectedUser);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Administração"
        subtitle="Atualize dados cadastrais, perfil de acesso e situação da conta."
        title="Editar usuário"
      />

      <section className="content-grid content-grid--form">
        <SectionCard title="Dados do usuário">
          <form className="form-grid" onSubmit={handleSubmitEdit}>
            {submitError ? (
              <p className="admin-user-create__error" role="alert">
                {submitError}
              </p>
            ) : null}
            <label className="form-field">
              <span>Nome completo</span>
              <input
                defaultValue={selectedUser.nome}
                maxLength={120}
                name="fullName"
                pattern={fieldPatterns.name}
                placeholder="Ex.: Ana Costa"
                required
                title={fieldHints.name}
                type="text"
              />
            </label>

            <label className="form-field">
              <span>E-mail institucional</span>
              <input
                defaultValue={selectedUser.email}
                maxLength={160}
                name="email"
                placeholder="usuario@ctrlfleet.gov.br"
                required
                type="email"
              />
            </label>

            <label className="form-field">
              <span>Perfil</span>
              <select name="accessProfile" onChange={(e) => setEditAccessProfile(e.target.value)} value={editAccessProfile}>
                {roleOptions.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Status da conta</span>
              <select name="status" onChange={(e) => setEditStatus(e.target.value)} value={editStatus}>
                {statusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Matrícula</span>
              <div className="matricula-input">
                <span className="matricula-input__prefix">MAT-</span>
                <input
                  defaultValue={getMatriculaNumber(selectedUser.matricula)}
                  inputMode="numeric"
                  maxLength={10}
                  name="registration"
                  onInput={keepOnlyDigits}
                  pattern={fieldPatterns.registration}
                  placeholder="0001"
                  required
                  title={fieldHints.registration}
                  type="text"
                />
              </div>
            </label>

            <label className="form-field">
              <span>Data admissao</span>
              <input
                defaultValue={formatBrDateInput(selectedUser.dataAdmissao)}
                maxLength={10}
                name="admissionDate"
                pattern={fieldPatterns.brDate}
                placeholder="dd/mm/aaaa"
                title={fieldHints.brDate}
                type="text"
              />
            </label>

            {editAccessProfile === 'Motorista' ? (
              <>
                <label className="form-field">
                  <span>Numero da CNH</span>
                  <input
                    defaultValue={selectedUser.numeroCnh || ''}
                    inputMode="numeric"
                    maxLength={11}
                    name="cnh"
                    onInput={keepOnlyDigits}
                    pattern={fieldPatterns.cnh}
                    placeholder="Ex.: 00000000000"
                    required
                    title={fieldHints.cnh}
                    type="text"
                  />
                </label>

                <label className="form-field">
                  <span>Validade da CNH</span>
                  <input
                    defaultValue={formatBrDateInput(selectedUser.validadeCnh)}
                    maxLength={10}
                    name="cnhExpiry"
                    pattern={fieldPatterns.brDate}
                    placeholder="dd/mm/aaaa"
                    required
                    title={fieldHints.brDate}
                    type="text"
                  />
                </label>
              </>
            ) : null}

            <div className="form-actions">
              <ActionButton to="/admin/usuarios" variant="secondary">
                Cancelar
              </ActionButton>
              <button className="action-button action-button--primary" disabled={submitting} type="submit">
                {submitting ? 'Salvando...' : 'Salvar alteracoes'}
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard subtitle="Acesso aplicado automaticamente aos modulos permitidos." title="Resumo do acesso">
          <dl className="summary-list admin-summary">
            <div>
              <dt>Perfil</dt>
              <dd>{selectedUserProfile}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge label={selectedUserStatus} />
              </dd>
            </div>
            <div>
              <dt>Ultimo acesso</dt>
              <dd>-</dd>
            </div>
          </dl>

          <div className="quick-links admin-access-links">
            <Link className="quick-link" to="/admin/perfis">
              <strong>Revisar permissoes</strong>
              <span>Confira as regras antes de salvar perfis sensiveis.</span>
            </Link>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
