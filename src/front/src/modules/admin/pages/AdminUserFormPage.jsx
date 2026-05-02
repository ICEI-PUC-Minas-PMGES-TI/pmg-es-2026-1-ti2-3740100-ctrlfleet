import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { adminSecretariats, adminUsers } from '../../../data/adminData';

const roleOptions = ['Administrador', 'Gestor de Frota', 'Motorista', 'Servidor Solicitante'];
const statusOptions = ['Ativo', 'Pendente', 'Bloqueado', 'Inativo'];

export function AdminUserFormPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const user = useMemo(() => adminUsers.find((item) => item.id === userId), [userId]);
  const selectedUser = user ?? adminUsers[0];

  function handleSubmit(event) {
    event.preventDefault();
    navigate('/admin/usuarios');
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
