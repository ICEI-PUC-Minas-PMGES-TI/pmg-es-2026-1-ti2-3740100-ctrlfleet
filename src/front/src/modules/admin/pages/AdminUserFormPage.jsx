import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { adminSecretariats, adminUsers } from '../../../data/adminData';

const roleOptions = ['Administrador', 'Gestor de Frota', 'Motorista', 'Servidor Solicitante'];
const statusOptions = ['Ativo', 'Pendente', 'Bloqueado', 'Inativo'];

const accessProfileOptions = ['Solicitante', 'Administrador', 'Gestor de Frota', 'Motorista'];

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

export function AdminUserFormPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const isCreateMode = !userId;
  const user = useMemo(() => adminUsers.find((item) => item.id === userId), [userId]);
  const selectedUser = user ?? adminUsers[0];

  const [personKind, setPersonKind] = useState('usuario');
  const [tempPassword, setTempPassword] = useState('F1eet@2024!');
  const [sendCredentialsByEmail, setSendCredentialsByEmail] = useState(true);

  function handleSubmit(event) {
    event.preventDefault();
    navigate('/admin/usuarios');
  }

  if (isCreateMode) {
    return (
      <div className="page-stack page-stack--admin-create-user">
        <header className="admin-user-create__page-title">
          <h1>Criar Novo Usuário</h1>
          <p>Cadastre um novo usuário ou motorista no sistema</p>
        </header>

        <div className="admin-user-create-card">
          <div aria-label="Tipo de cadastro" className="admin-user-create__segment" role="tablist">
            <button
              aria-selected={personKind === 'usuario'}
              className={personKind === 'usuario' ? 'is-active' : ''}
              onClick={() => setPersonKind('usuario')}
              role="tab"
              type="button"
            >
              Usuário
            </button>
            <button
              aria-selected={personKind === 'motorista'}
              className={personKind === 'motorista' ? 'is-active' : ''}
              onClick={() => setPersonKind('motorista')}
              role="tab"
              type="button"
            >
              Motorista
            </button>
          </div>

          <form onSubmit={handleSubmit}>
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
                  name="fullName"
                  placeholder="Digite o nome completo"
                  required
                  type="text"
                />
              </label>

              <label className="admin-form-field">
                <span className="admin-form-field__label">
                  Matrícula
                  <span className="admin-form-field__req">*</span>
                </span>
                <input
                  className="admin-form-field__input"
                  name="registration"
                  placeholder="Ex.: 001234"
                  required
                  type="text"
                />
              </label>

              <label className="admin-form-field">
                <span className="admin-form-field__label">
                  Email
                  <span className="admin-form-field__req">*</span>
                </span>
                <input
                  className="admin-form-field__input"
                  autoComplete="email"
                  name="email"
                  placeholder="usuario@prefeitura.gov.br"
                  required
                  type="email"
                />
              </label>

              <div className="admin-form-field">
                <span className="admin-form-field__label">Departamento</span>
                <div className="admin-form-field__select-wrap">
                  <select className="admin-form-field__select" defaultValue="Saúde" name="department">
                    {adminSecretariats.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                  <Icon className="admin-form-field__chevron" name="chevronDown" />
                </div>
              </div>

              <div className="admin-form-field">
                <span className="admin-form-field__label">Perfil de acesso</span>
                <div className="admin-form-field__select-wrap">
                  <select className="admin-form-field__select" defaultValue="Solicitante" name="accessProfile">
                    {accessProfileOptions.map((profile) => (
                      <option key={profile} value={profile}>
                        {profile}
                      </option>
                    ))}
                  </select>
                  <Icon className="admin-form-field__chevron" name="chevronDown" />
                </div>
              </div>

              <label className="admin-form-field">
                <span className="admin-form-field__label">Cargo</span>
                <input
                  className="admin-form-field__input"
                  name="jobTitle"
                  placeholder="Ex.: Analista de sistemas"
                  type="text"
                />
              </label>

              <label className="admin-form-field admin-form-field--date">
                <span className="admin-form-field__label">Data admissão</span>
                <div className="admin-form-field__input-wrap">
                  <input className="admin-form-field__input" name="admissionDate" placeholder="dd/mm/aaaa" type="text" />
                  <Icon className="admin-form-field__date-icon" name="calendar" />
                </div>
              </label>

              {personKind === 'motorista' ? (
                <>
                  <label className="admin-form-field">
                    <span className="admin-form-field__label">
                      CNH
                      <span className="admin-form-field__req">*</span>
                    </span>
                    <input className="admin-form-field__input" name="cnh" placeholder="Número da CNH" type="text" />
                  </label>
                  <label className="admin-form-field admin-form-field--date">
                    <span className="admin-form-field__label">
                      Validade CNH
                      <span className="admin-form-field__req">*</span>
                    </span>
                    <div className="admin-form-field__input-wrap">
                      <input
                        className="admin-form-field__input"
                        name="cnhExpiry"
                        placeholder="dd/mm/aaaa"
                        type="text"
                      />
                      <Icon className="admin-form-field__date-icon" name="calendar" />
                    </div>
                  </label>
                </>
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
              <button className="action-button action-button--primary" type="submit">
                Cadastrar usuário
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Administracao"
        subtitle="Atualize dados cadastrais, perfil de acesso e situacao da conta."
        title="Editar usuario"
      />

      <section className="content-grid content-grid--form">
        <SectionCard title="Dados do usuario">
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Nome completo</span>
              <input defaultValue={selectedUser.name} placeholder="Ex.: Ana Costa" required type="text" />
            </label>

            <label className="form-field">
              <span>E-mail institucional</span>
              <input
                defaultValue={selectedUser.email}
                placeholder="usuario@ctrlfleet.gov.br"
                required
                type="email"
              />
            </label>

            <label className="form-field">
              <span>Perfil</span>
              <select defaultValue={selectedUser.role}>
                {roleOptions.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Secretaria</span>
              <select defaultValue={selectedUser.secretariat}>
                {adminSecretariats.map((secretariat) => (
                  <option key={secretariat}>{secretariat}</option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Status da conta</span>
              <select defaultValue={selectedUser.status}>
                {statusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Matricula</span>
              <input placeholder="Ex.: MAT-2048" type="text" />
            </label>

            <div className="form-actions">
              <ActionButton to="/admin/usuarios" variant="secondary">
                Cancelar
              </ActionButton>
              <button className="action-button action-button--primary" type="submit">
                Salvar alteracoes
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard subtitle="Acesso aplicado automaticamente aos modulos permitidos." title="Resumo do acesso">
          <dl className="summary-list admin-summary">
            <div>
              <dt>Perfil</dt>
              <dd>{selectedUser.role}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge label={selectedUser.status} />
              </dd>
            </div>
            <div>
              <dt>Secretaria</dt>
              <dd>{selectedUser.secretariat}</dd>
            </div>
            <div>
              <dt>Ultimo acesso</dt>
              <dd>{selectedUser.lastAccess}</dd>
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
