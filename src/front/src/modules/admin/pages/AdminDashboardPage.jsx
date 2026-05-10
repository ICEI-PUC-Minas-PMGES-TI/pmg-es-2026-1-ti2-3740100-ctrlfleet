import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { Modal } from '../../../components/common/Modal';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import {
  adminPendingApprovals,
  adminRecentActivity,
  adminStats,
  adminUsers,
  permissionGroups,
} from '../../../data/adminData';

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function severityToBadge(severity) {
  if (severity === 'critical') return 'Bloqueado';
  if (severity === 'warning') return 'Pendente';
  return 'Ativo';
}

const totalUsers = adminUsers.length;

export function AdminDashboardPage() {
  const [pendingList, setPendingList] = useState(adminPendingApprovals);
  const [feedback, setFeedback] = useState(null);

  const [approvalModal, setApprovalModal] = useState({
    open: false,
    intent: 'approve',
    item: null,
  });
  const [activityModal, setActivityModal] = useState({ open: false, item: null });
  const [userModal, setUserModal] = useState({ open: false, item: null });

  const recentUsers = useMemo(() => adminUsers.slice(0, 5), []);

  const dashboardStats = useMemo(() => {
    const base = [...adminStats];
    base[1] = {
      ...base[1],
      value: String(pendingList.length).padStart(2, '0'),
    };
    return base;
  }, [pendingList.length]);

  const distribution = useMemo(() => {
    const total = permissionGroups.reduce((sum, group) => sum + group.users, 0) || 1;
    return permissionGroups.map((group) => ({
      ...group,
      percent: Math.round((group.users / total) * 100),
    }));
  }, []);

  function openApprovalModal(item, intent) {
    setApprovalModal({ open: true, intent, item });
  }

  function closeApprovalModal() {
    setApprovalModal((current) => ({ ...current, open: false }));
  }

  function confirmApproval() {
    if (!approvalModal.item) {
      closeApprovalModal();
      return;
    }
    const { item, intent } = approvalModal;
    setPendingList((current) => current.filter((entry) => entry.id !== item.id));
    setFeedback({
      tone: intent === 'approve' ? 'success' : 'danger',
      message:
        intent === 'approve'
          ? `${item.name} aprovado com sucesso. Convite reenviado.`
          : `${item.name} foi recusado e removido da fila.`,
    });
    closeApprovalModal();
    setTimeout(() => setFeedback(null), 4000);
  }

  return (
    <div className="page-stack admin-dashboard">
      <PageHeader
        eyebrow="Painel administrativo"
        subtitle="Visão consolidada de contas, segurança e atividade do CtrlFleet."
        title="Dashboard administrativo"
      />

      <div className="admin-dashboard__toolbar">
        <div className="admin-dashboard__toolbar-meta">
          <span className="admin-dashboard__chip">
            <span className="admin-dashboard__pulse" />
            Sistema operacional
          </span>
          <span className="admin-dashboard__toolbar-info">
            Última sincronização há 2 minutos
          </span>
        </div>
        <div className="admin-dashboard__toolbar-actions">
          <ActionButton
            icon="refresh"
            onClick={() => setFeedback({ tone: 'success', message: 'Indicadores atualizados.' })}
            variant="secondary"
          >
            Atualizar
          </ActionButton>
          <ActionButton icon="plus" to="/admin/usuarios/novo">
            Novo usuário
          </ActionButton>
        </div>
      </div>

      {feedback ? (
        <div className={`admin-dashboard__flash admin-dashboard__flash--${feedback.tone}`}>
          {feedback.message}
        </div>
      ) : null}

      <section className="stats-grid">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <SectionCard
        subtitle="Solicitações que aguardam validação administrativa."
        title={`Aprovações pendentes (${pendingList.length})`}
      >
          {pendingList.length === 0 ? (
            <div className="admin-empty">
              <Icon name="check" />
              <p>Nada pendente! Todas as solicitações foram tratadas.</p>
            </div>
          ) : (
            <ul className="admin-pending-list">
              {pendingList.map((item) => (
                <li className="admin-pending-item" key={item.id}>
                  <div className="user-cell">
                    <span className="user-cell__avatar" aria-hidden="true">
                      <span className="avatar-initials">{getInitials(item.name)}</span>
                    </span>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.role} • {item.secretariat}</span>
                    </div>
                  </div>
                  <div className="admin-pending-item__meta">
                    <StatusBadge label="Pendente" />
                    <span>{item.requestedAt}</span>
                  </div>
                  <div className="admin-pending-item__actions">
                    <button
                      className="icon-button"
                      onClick={() => setUserModal({ open: true, item })}
                      title="Ver detalhes"
                      type="button"
                    >
                      <Icon name="eye" />
                    </button>
                    <button
                      className="icon-button icon-button--danger"
                      onClick={() => openApprovalModal(item, 'reject')}
                      title="Recusar"
                      type="button"
                    >
                      <Icon name="close" />
                    </button>
                    <button
                      className="action-button action-button--primary action-button--sm"
                      onClick={() => openApprovalModal(item, 'approve')}
                      type="button"
                    >
                      <Icon className="action-button__icon" name="check" />
                      <span>Aprovar</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
      </SectionCard>

      <section className="content-grid admin-dashboard__primary">
        <SectionCard
          subtitle="Eventos administrativos importantes do dia."
          title="Atividade recente"
        >
          <ol className="admin-timeline">
            {adminRecentActivity.map((event) => (
              <li className="admin-timeline__item" key={event.id}>
                <span
                  className={`admin-timeline__dot admin-timeline__dot--${event.severity}`}
                  aria-hidden="true"
                />
                <button
                  className="admin-timeline__body"
                  onClick={() => setActivityModal({ open: true, item: event })}
                  type="button"
                >
                  <div className="admin-timeline__head">
                    <strong>{event.action}</strong>
                    <StatusBadge label={severityToBadge(event.severity)} />
                  </div>
                  <p>{event.detail}</p>
                  <small>
                    {event.actor} • {event.timestamp}
                  </small>
                </button>
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard
          subtitle="Distribuição de contas pelos perfis ativos."
          title="Perfis e permissões"
        >
          <ul className="admin-distribution">
            {distribution.map((group) => (
              <li className="admin-distribution__item" key={group.name}>
                <div className="admin-distribution__head">
                  <strong>{group.name}</strong>
                  <span>{group.users} usuários • {group.percent}%</span>
                </div>
                <div className="admin-distribution__bar">
                  <span
                    className="admin-distribution__bar-fill"
                    style={{ width: `${group.percent}%` }}
                  />
                </div>
                <small>{group.modules}</small>
              </li>
            ))}
          </ul>
          <Link className="text-link admin-dashboard__inline-link" to="/admin/perfis">
            Gerenciar perfis
            <Icon name="chevronRight" />
          </Link>
        </SectionCard>
      </section>

      <SectionCard
        subtitle={`Mostrando ${recentUsers.length} de ${totalUsers} usuários cadastrados.`}
        title="Últimos usuários"
      >
        <div className="table-wrapper">
          <table className="fleet-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Perfil</th>
                <th>Secretaria</th>
                <th>Status</th>
                <th>Último acesso</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <span className="user-cell__avatar" aria-hidden="true">
                        <span className="avatar-initials">{getInitials(user.name)}</span>
                      </span>
                      <div>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{user.role}</td>
                  <td>{user.secretariat}</td>
                  <td>
                    <StatusBadge label={user.status} />
                  </td>
                  <td>{user.lastAccess}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-button"
                        onClick={() => setUserModal({ open: true, item: user })}
                        title="Ver detalhes"
                        type="button"
                      >
                        <Icon name="eye" />
                      </button>
                      <Link
                        className="icon-button"
                        title="Editar usuário"
                        to={`/admin/usuarios/${user.id}/editar`}
                      >
                        <Icon name="edit" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-dashboard__table-footer">
          <Link className="text-link" to="/admin/usuarios">
            Ver todos os usuários
            <Icon name="chevronRight" />
          </Link>
        </div>
      </SectionCard>

      <Modal
        footer={
          <>
            <button
              className="action-button action-button--secondary"
              onClick={closeApprovalModal}
              type="button"
            >
              <span>Cancelar</span>
            </button>
            <button
              className={`action-button ${
                approvalModal.intent === 'approve'
                  ? 'action-button--primary'
                  : 'action-button--danger'
              }`}
              onClick={confirmApproval}
              type="button"
            >
              <Icon
                className="action-button__icon"
                name={approvalModal.intent === 'approve' ? 'check' : 'close'}
              />
              <span>
                {approvalModal.intent === 'approve' ? 'Aprovar usuário' : 'Recusar solicitação'}
              </span>
            </button>
          </>
        }
        onClose={closeApprovalModal}
        open={approvalModal.open}
        size="md"
        subtitle={
          approvalModal.intent === 'approve'
            ? 'Confirme os dados antes de liberar o acesso.'
            : 'Confirme a recusa. O solicitante será notificado.'
        }
        title={
          approvalModal.intent === 'approve'
            ? 'Aprovar nova conta'
            : 'Recusar solicitação'
        }
      >
        {approvalModal.item ? (
          <dl className="admin-modal-list">
            <div>
              <dt>Nome</dt>
              <dd>{approvalModal.item.name}</dd>
            </div>
            <div>
              <dt>CPF</dt>
              <dd>{approvalModal.item.cpf}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{approvalModal.item.email}</dd>
            </div>
            <div>
              <dt>Perfil solicitado</dt>
              <dd>{approvalModal.item.role}</dd>
            </div>
            <div>
              <dt>Secretaria</dt>
              <dd>{approvalModal.item.secretariat}</dd>
            </div>
            <div>
              <dt>Tipo de solicitação</dt>
              <dd>{approvalModal.item.type}</dd>
            </div>
            <div>
              <dt>Solicitado por</dt>
              <dd>{approvalModal.item.requestedBy}</dd>
            </div>
            <div>
              <dt>Data</dt>
              <dd>{approvalModal.item.requestedAt}</dd>
            </div>
          </dl>
        ) : null}
      </Modal>

      <Modal
        footer={
          <button
            className="action-button action-button--secondary"
            onClick={() => setActivityModal({ open: false, item: null })}
            type="button"
          >
            <span>Fechar</span>
          </button>
        }
        onClose={() => setActivityModal({ open: false, item: null })}
        open={activityModal.open}
        subtitle="Detalhes completos do evento de auditoria."
        title={activityModal.item?.action}
      >
        {activityModal.item ? (
          <>
            <dl className="admin-modal-list">
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusBadge label={severityToBadge(activityModal.item.severity)} />
                </dd>
              </div>
              <div>
                <dt>Data</dt>
                <dd>{activityModal.item.timestamp}</dd>
              </div>
              <div>
                <dt>Responsável</dt>
                <dd>{activityModal.item.actor}</dd>
              </div>
              <div>
                <dt>Alvo</dt>
                <dd>{activityModal.item.target}</dd>
              </div>
              <div>
                <dt>Endereço IP</dt>
                <dd>{activityModal.item.ip}</dd>
              </div>
            </dl>
            <p className="admin-modal-detail">{activityModal.item.detail}</p>
          </>
        ) : null}
      </Modal>

      <Modal
        footer={
          userModal.item ? (
            <>
              <button
                className="action-button action-button--secondary"
                onClick={() => setUserModal({ open: false, item: null })}
                type="button"
              >
                <span>Fechar</span>
              </button>
              <Link
                className="action-button action-button--primary"
                onClick={() => setUserModal({ open: false, item: null })}
                to={`/admin/usuarios/${userModal.item.id}/editar`}
              >
                <Icon className="action-button__icon" name="edit" />
                <span>Editar usuário</span>
              </Link>
            </>
          ) : null
        }
        onClose={() => setUserModal({ open: false, item: null })}
        open={userModal.open}
        subtitle="Informações cadastrais do usuário."
        title={userModal.item?.name}
      >
        {userModal.item ? (
          <dl className="admin-modal-list">
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge label={userModal.item.status ?? 'Pendente'} />
              </dd>
            </div>
            <div>
              <dt>Perfil</dt>
              <dd>{userModal.item.role}</dd>
            </div>
            <div>
              <dt>Secretaria</dt>
              <dd>{userModal.item.secretariat}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{userModal.item.email}</dd>
            </div>
            <div>
              <dt>CPF</dt>
              <dd>{userModal.item.cpf}</dd>
            </div>
            {userModal.item.cnh ? (
              <div>
                <dt>CNH</dt>
                <dd>
                  {userModal.item.cnh}
                  {userModal.item.cnhExpiry ? ` • válida até ${userModal.item.cnhExpiry}` : ''}
                </dd>
              </div>
            ) : null}
            {userModal.item.lastAccess ? (
              <div>
                <dt>Último acesso</dt>
                <dd>{userModal.item.lastAccess}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </Modal>
    </div>
  );
}
