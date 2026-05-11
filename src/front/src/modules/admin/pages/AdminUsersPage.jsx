import { useEffect, useMemo, useState } from 'react';
import { UserFilters } from '../../../components/admin/UserFilters';
import { UserTable } from '../../../components/admin/UserTable';
import { Icon } from '../../../components/common/Icon';
import { Modal } from '../../../components/common/Modal';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { userRoleOptions, userStatusTabs } from '../../../data/adminData';
import {
  aprovarUsuario,
  bloquearUsuario,
  desativarUsuario,
  listarUsuarios,
  reativarUsuario,
  recusarUsuario,
  redefinirSenhaUsuario,
  reenviarConviteUsuario,
} from '../../../services/usuarioApi';
import { mapBackendUserToView, pad2 } from '../../../services/usuarioMappers';

const ACTION_CONFIG = {
  approve: {
    confirmLabel: 'Aprovar usuário',
    icon: 'check',
    message: 'Acesso aprovado e liberado.',
    subtitle: 'Confirme a liberação do acesso para esta conta.',
    title: 'Aprovar solicitação',
    tone: 'primary',
    run: aprovarUsuario,
  },
  reject: {
    confirmLabel: 'Recusar solicitação',
    icon: 'close',
    message: 'Solicitação recusada.',
    subtitle: 'A conta ficará inativa e a decisão será registrada na auditoria.',
    title: 'Recusar solicitação',
    tone: 'danger',
    run: recusarUsuario,
  },
  invite: {
    confirmLabel: 'Reenviar convite',
    icon: 'mail',
    message: 'Convite reenviado.',
    subtitle: 'Um novo registro de convite será salvo na auditoria.',
    title: 'Reenviar convite',
    tone: 'primary',
    run: reenviarConviteUsuario,
  },
  resetPassword: {
    confirmLabel: 'Redefinir senha',
    icon: 'shield',
    message: 'Senha provisória redefinida.',
    subtitle: 'A senha provisória será redefinida para CtrlFleet@123.',
    title: 'Redefinir senha',
    tone: 'primary',
    run: redefinirSenhaUsuario,
  },
  block: {
    confirmLabel: 'Bloquear usuário',
    icon: 'alert',
    message: 'Usuário bloqueado.',
    subtitle: 'O acesso será bloqueado até nova reativação.',
    title: 'Bloquear usuário',
    tone: 'danger',
    run: bloquearUsuario,
  },
  deactivate: {
    confirmLabel: 'Inativar usuário',
    icon: 'close',
    message: 'Usuário inativado.',
    subtitle: 'A conta será marcada como inativa.',
    title: 'Inativar usuário',
    tone: 'danger',
    run: desativarUsuario,
  },
  reactivate: {
    confirmLabel: 'Reativar usuário',
    icon: 'check',
    message: 'Usuário reativado.',
    subtitle: 'A conta voltará a ter status ativo.',
    title: 'Reativar usuário',
    tone: 'primary',
    run: reativarUsuario,
  },
};

function filterByStatus(user, status) {
  return status === 'Todos' || user.status === status;
}

function filterByRole(user, role) {
  return role === 'Perfil (Todos)' || user.role === role;
}

export function AdminUsersPage() {
  const [nameSearch, setNameSearch] = useState('');
  const [matriculaSearch, setMatriculaSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('Perfil (Todos)');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [actionModal, setActionModal] = useState({ key: null, user: null });
  const [feedback, setFeedback] = useState(null);

  const [usersData, setUsersData] = useState({
    loading: true,
    error: null,
    items: [],
  });
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    setUsersData((current) => ({ ...current, loading: true, error: null }));
    listarUsuarios({ signal: controller.signal })
      .then((items) => {
        setUsersData({
          loading: false,
          error: null,
          items: items.map(mapBackendUserToView),
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setUsersData({
          loading: false,
          error: error.message || 'Falha ao carregar usuários.',
          items: [],
        });
      });

    return () => controller.abort();
  }, []);

  function openActionModal(actionKey, user) {
    setActionError('');
    setActionModal({ key: actionKey, user });
  }

  function closeActionModal() {
    setActionModal({ key: null, user: null });
  }

  async function confirmAction() {
    const config = ACTION_CONFIG[actionModal.key];
    const user = actionModal.user;
    if (!config || !user) return;

    setActionError('');
    try {
      const updated = await config.run(user.id);
      const updatedView = mapBackendUserToView(updated);
      setUsersData((current) => ({
        ...current,
        items: current.items.map((item) => (item.id === user.id ? updatedView : item)),
      }));
      window.dispatchEvent(new Event('ctrlfleet:usuarios-updated'));
      setFeedback({ tone: config.tone === 'danger' ? 'danger' : 'success', message: config.message });
      closeActionModal();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao concluir ação.';
      setActionError(message);
    }
  }

  const filteredUsers = useMemo(() => {
    const normalizedName = nameSearch.trim().toLowerCase();
    const normalizedMatricula = matriculaSearch.trim().toLowerCase();

    return usersData.items.filter((user) => {
      const matchesName =
        normalizedName.length === 0 || user.name.toLowerCase().includes(normalizedName);
      const matchesMatricula =
        normalizedMatricula.length === 0 ||
        (user.matricula || '').toLowerCase().includes(normalizedMatricula);

      return (
        matchesName &&
        matchesMatricula &&
        filterByStatus(user, selectedStatus) &&
        filterByRole(user, selectedRole)
      );
    });
  }, [matriculaSearch, nameSearch, selectedRole, selectedStatus, usersData.items]);

  const summaryCards = useMemo(() => {
    const items = usersData.items;
    const count = (predicate) => items.filter(predicate).length;
    return [
      {
        caption: 'Total cadastradas',
        icon: 'users',
        title: 'Contas',
        value: pad2(items.length),
      },
      {
        caption: 'Com acesso liberado',
        icon: 'check',
        title: 'Ativos',
        value: pad2(count((user) => user.status === 'Ativo')),
      },
      {
        caption: 'Aguardando aprovação',
        icon: 'alert',
        title: 'Pendentes',
        value: pad2(count((user) => user.status === 'Pendente')),
      },
      {
        caption: 'Com restrição de acesso',
        icon: 'shield',
        title: 'Bloqueados',
        value: pad2(count((user) => user.status === 'Bloqueado')),
      },
    ];
  }, [usersData.items]);

  const modalConfig = ACTION_CONFIG[actionModal.key];

  return (
    <div className="page-stack admin-dashboard">
      <PageHeader
        actionIcon="plus"
        actionLabel="Novo usuário"
        actionTo="/admin/usuarios/novo"
        subtitle="Crie, edite, bloqueie e acompanhe usuários por perfil de acesso."
        title="Usuários"
      />

      {feedback ? (
        <div className={`admin-dashboard__flash admin-dashboard__flash--${feedback.tone}`}>
          {feedback.message}
        </div>
      ) : null}

      <section className="stats-grid">
        {summaryCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <SectionCard>
        <UserFilters
          matriculaSearch={matriculaSearch}
          nameSearch={nameSearch}
          onMatriculaSearchChange={setMatriculaSearch}
          onNameSearchChange={setNameSearch}
          onRoleChange={setSelectedRole}
          onStatusChange={setSelectedStatus}
          role={selectedRole}
          roleOptions={userRoleOptions}
          selectedStatus={selectedStatus}
          statusTabs={userStatusTabs}
        />

        {actionError ? (
          <div className="admin-dashboard__error" role="alert">
            <Icon name="alert" />
            <div>
              <strong>Falha na ação</strong>
              <p>{actionError}</p>
            </div>
          </div>
        ) : null}

        {usersData.loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Carregando usuários...</p>
          </div>
        ) : usersData.error ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Falha ao carregar usuários</strong>
              <p>{usersData.error}</p>
            </div>
          </div>
        ) : usersData.items.length === 0 ? (
          <div className="admin-empty">
            <Icon name="users" />
            <p>Nenhum usuário cadastrado ainda.</p>
          </div>
        ) : (
          <>
            <div className="table-summary">
              <span>
                Mostrando {filteredUsers.length} de {usersData.items.length} usuários
              </span>
              <span>Permissões, status e dados cadastrais disponíveis em cada linha.</span>
            </div>

            <UserTable onUserAction={openActionModal} users={filteredUsers} />
          </>
        )}
      </SectionCard>

      <Modal
        footer={
          modalConfig ? (
            <>
              <button
                className="action-button action-button--secondary"
                onClick={closeActionModal}
                type="button"
              >
                <span>Cancelar</span>
              </button>
              <button
                className={`action-button ${
                  modalConfig.tone === 'danger' ? 'action-button--danger' : 'action-button--primary'
                }`}
                onClick={confirmAction}
                type="button"
              >
                <Icon className="action-button__icon" name={modalConfig.icon} />
                <span>{modalConfig.confirmLabel}</span>
              </button>
            </>
          ) : null
        }
        onClose={closeActionModal}
        open={Boolean(modalConfig && actionModal.user)}
        size="md"
        subtitle={modalConfig?.subtitle}
        title={modalConfig?.title}
      >
        {actionModal.user ? (
          <dl className="admin-modal-list">
            <div>
              <dt>Nome</dt>
              <dd>{actionModal.user.name}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{actionModal.user.email}</dd>
            </div>
            <div>
              <dt>Perfil</dt>
              <dd>{actionModal.user.role}</dd>
            </div>
            <div>
              <dt>Status atual</dt>
              <dd>{actionModal.user.status}</dd>
            </div>
          </dl>
        ) : null}
      </Modal>
    </div>
  );
}
