import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from '../components/common/ActionButton';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { adminSecretariats, adminUsers } from '../data/adminData';

const roleOptions = ['Administrador', 'Gestor de Frota', 'Motorista', 'Servidor Solicitante'];
const statusOptions = ['Ativo', 'Pendente', 'Bloqueado', 'Inativo'];

export function AdminUserFormPage({ mode = 'create' }) {
  const navigate = useNavigate();
  const { userId } = useParams();
  const user = useMemo(() => adminUsers.find((item) => item.id === userId), [userId]);
  const isEditing = mode === 'edit';
  const selectedUser = isEditing ? user ?? adminUsers[0] : null;

  function handleSubmit(event) {
    event.preventDefault();
    navigate('/admin/usuarios');
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Administração"
        subtitle={
          isEditing
            ? 'Atualize dados cadastrais, perfil de acesso e situação da conta.'
            : 'Cadastre um usuário e defina o primeiro perfil de acesso.'
        }
        title={isEditing ? 'Editar usuário' : 'Novo usuário'}
      />

      <section className="content-grid content-grid--form">
        <SectionCard title="Dados do usuário">
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Nome completo</span>
              <input defaultValue={selectedUser?.name} placeholder="Ex.: Ana Costa" required type="text" />
            </label>

            <label className="form-field">
              <span>E-mail institucional</span>
              <input
                defaultValue={selectedUser?.email}
                placeholder="usuario@ctrlfleet.gov.br"
                required
                type="email"
              />
            </label>

            <label className="form-field">
              <span>Perfil</span>
              <select defaultValue={selectedUser?.role ?? 'Servidor Solicitante'}>
                {roleOptions.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Secretaria</span>
              <select defaultValue={selectedUser?.secretariat ?? 'Administração'}>
                {adminSecretariats.map((secretariat) => (
                  <option key={secretariat}>{secretariat}</option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Status da conta</span>
              <select defaultValue={selectedUser?.status ?? 'Pendente'}>
                {statusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Matrícula</span>
              <input placeholder="Ex.: MAT-2048" type="text" />
            </label>

            <div className="form-actions">
              <ActionButton to="/admin/usuarios" variant="secondary">
                Cancelar
              </ActionButton>
              <button className="action-button action-button--primary" type="submit">
                {isEditing ? 'Salvar alterações' : 'Criar usuário'}
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard subtitle="Acesso aplicado automaticamente aos módulos permitidos." title="Resumo do acesso">
          <dl className="summary-list admin-summary">
            <div>
              <dt>Perfil</dt>
              <dd>{selectedUser?.role ?? 'Servidor Solicitante'}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge label={selectedUser?.status ?? 'Pendente'} />
              </dd>
            </div>
            <div>
              <dt>Secretaria</dt>
              <dd>{selectedUser?.secretariat ?? 'A definir'}</dd>
            </div>
            <div>
              <dt>Último acesso</dt>
              <dd>{selectedUser?.lastAccess ?? 'Ainda não acessou'}</dd>
            </div>
          </dl>

          <div className="quick-links admin-access-links">
            <Link className="quick-link" to="/admin/perfis">
              <strong>Revisar permissões</strong>
              <span>Confira as regras antes de salvar perfis sensíveis.</span>
            </Link>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
