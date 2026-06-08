import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { Modal } from '../../../components/common/Modal';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { permissionGroups } from '../../../data/adminData';
import { useAdminDashboardSync } from '../../../hooks/useAdminDashboardSync';
import { getAuthSession } from '../../../services/authSession';
import { aprovarUsuario, recusarUsuario } from '../../../services/usuarioApi';
import { formatBrDate, pad2 } from '../../../services/usuarioMappers';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';

function getInitials(name) {
  if (!name) return '?';
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

function todayBrLabel() {
  return new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

function toPendingApproval(user) {
  return {
    ...user,
    requestedAt: formatBrDate(user.dataAdmissao),
    requestedBy: 'Sistema',
    type: 'Novo cadastro',
  };
}

const USER_STATUS_GROUPS = [
  { key: 'Ativo', label: 'Ativos', tone: 'active' },
  { key: 'Pendente', label: 'Pendentes', tone: 'pending' },
  { key: 'Bloqueado', label: 'Bloqueados', tone: 'blocked' },
  { key: 'Inativo', label: 'Inativos', tone: 'muted' },
];

export function AdminDashboardPage() {
  const session = getAuthSession();
  const greetingName = session?.nome?.split(' ')[0] ?? 'Admin';

  const { loading, syncing, error, lastSyncedAt, now, users, audit, refresh } =
    useAdminDashboardSync();

  const [feedback, setFeedback] = useState(null);
  const [approvalModal, setApprovalModal] = useState({
    open: false,
    intent: 'approve',
    item: null,
  });
  const [activityModal, setActivityModal] = useState({ open: false, item: null });
  const [userModal, setUserModal] = useState({ open: false, item: null });
  const [dismissedPendingIds, setDismissedPendingIds] = useState(() => new Set());

  const recentUsers = useMemo(() => users.slice(0, 5), [users]);
  const totalUsers = users.length;

  const pendingList = useMemo(
    () =>
      users
        .filter((user) => user.status === 'Pendente' && !dismissedPendingIds.has(user.id))
        .map(toPendingApproval),
    [users, dismissedPendingIds],
  );

  const distribution = useMemo(() => {
    const counts = new Map();
    for (const user of users) {
      if (!user.role || user.role === '—') continue;
      counts.set(user.role, (counts.get(user.role) || 0) + 1);
    }
    const total = users.length || 1;
    return permissionGroups.map((group) => {
      const userCount = counts.get(group.name) || 0;
      return {
        name: group.name,
        description: group.description,
        modules: group.modules,
        users: userCount,
        percent: Math.round((userCount / total) * 100),
      };
    });
  }, [users]);

  const userBreakdown = useMemo(() => {
    if (users.length === 0) return [];
    return USER_STATUS_GROUPS.map((group) => {
      const count = users.filter((user) => user.status === group.key).length;
      return {
        ...group,
        count,
        percent: Math.round((count / users.length) * 100),
      };
    }).filter((group) => group.count > 0);
  }, [users]);

  const auditTodayCount = useMemo(() => {
    const today = todayBrLabel();
    return audit.filter((event) => event.date?.startsWith(today)).length;
  }, [audit]);

  const recentActivity = useMemo(() => audit.slice(0, 6), [audit]);

  const dashboardStats = useMemo(() => {
    const perfisAtivos = distribution.filter((group) => group.users > 0).length;
    return [
      {
        caption: 'Contas no sistema',
        icon: 'users',
        title: 'Usuários',
        value: pad2(totalUsers),
        variant: 'total',
      },
      {
        caption: 'Aguardando validação',
        icon: 'alert',
        title: 'Pendências',
        value: pad2(pendingList.length),
        variant: 'maintenance',
      },
      {
        caption: 'Perfis com contas ativas',
        icon: 'shield',
        title: 'Perfis',
        value: pad2(perfisAtivos),
        variant: 'active',
      },
      {
        caption: 'Registros de hoje',
        icon: 'reports',
        title: 'Auditoria',
        value: pad2(auditTodayCount),
        variant: 'inactive',
      },
    ];
  }, [auditTodayCount, distribution, pendingList.length, totalUsers]);

  const syncLabel = lastSyncedAt
    ? formatRelativeTime(lastSyncedAt, now)
    : syncing
      ? 'em andamento'
      : 'nunca';

  const syncStatus = error ? 'error' : syncing ? 'syncing' : 'ok';

  function openApprovalModal(item, intent) {
    setApprovalModal({ open: true, intent, item });
  }

  function closeApprovalModal() {
    setApprovalModal((current) => ({ ...current, open: false }));
  }

  async function confirmApproval() {
    if (!approvalModal.item) {
      closeApprovalModal();
      return;
    }
    const { item, intent } = approvalModal;
    try {
      const updated =
        intent === 'approve' ? await aprovarUsuario(item.id) : await recusarUsuario(item.id);
      setDismissedPendingIds((current) => new Set(current).add(item.id));
      window.dispatchEvent(new Event('ctrlfleet:usuarios-updated'));
      await refresh();
      setFeedback({
        tone: intent === 'approve' ? 'success' : 'danger',
        message:
          intent === 'approve'
            ? `${item.name} aprovado com sucesso.`
            : `${item.name} foi recusado e inativado.`,
      });
      closeApprovalModal();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({
        tone: 'danger',
        message: err instanceof Error ? err.message : 'Não foi possível concluir a ação.',
      });
      setTimeout(() => setFeedback(null), 4000);
    }
  }

  async function handleRefresh() {
    try {
      await refresh();
      setFeedback({ tone: 'success', message: 'Dados sincronizados com sucesso.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      /* erro tratado no hook */
    }
  }

  return (
    <div className="page-stack admin-dashboard">
      <PageHeader
        eyebrow="Painel administrativo"
        subtitle="Contas, permissões e auditoria do CtrlFleet em tempo real."
        title="Dashboard"
      />

      <section className="admin-dashboard-hero">
        <div className="admin-dashboard-hero__copy">
          <span className="admin-dashboard-hero__eyebrow">Centro de governança</span>
          <h2>Olá, {greetingName}</h2>
          <p>
            {totalUsers} usuários cadastrados ·{' '}
            <strong>{pendingList.length} aprovações pendentes</strong> · {auditTodayCount} eventos
            de auditoria hoje.
          </p>
        </div>
        <div className="admin-dashboard-hero__metrics" aria-hidden="true">
          <div className="admin-dashboard-hero__metric">
            <Icon name="users" />
            <span>{pad2(totalUsers)}</span>
            <small>Usuários</small>
          </div>
          <div className="admin-dashboard-hero__metric admin-dashboard-hero__metric--accent">
            <Icon name="alert" />
            <span>{pad2(pendingList.length)}</span>
            <small>Pendentes</small>
          </div>
        </div>
      </section>

      <div className={`admin-dashboard__sync admin-dashboard__sync--${syncStatus}`}>
        <div className="admin-dashboard__sync-meta">
          <span className="admin-dashboard__chip">
            {syncing ? (
              <span className="admin-dashboard__spinner admin-dashboard__spinner--inline" aria-hidden="true" />
            ) : (
              <span className={`admin-dashboard__pulse admin-dashboard__pulse--${syncStatus}`} />
            )}
            {syncStatus === 'error'
              ? 'Falha na sincronização'
              : syncing
                ? 'Sincronizando…'
                : 'Sistema operacional'}
          </span>
          <div className="admin-dashboard__sync-times">
            <span className="admin-dashboard__toolbar-info">
              Última sincronização {syncLabel}
            </span>
            <span className="admin-dashboard__toolbar-info admin-dashboard__toolbar-info--muted">
              Atualização automática a cada 60 s
            </span>
          </div>
        </div>
        <div className="admin-dashboard__toolbar-actions">
          <ActionButton
            disabled={syncing}
            icon="refresh"
            onClick={handleRefresh}
            variant="secondary"
          >
            {syncing ? 'Sincronizando…' : 'Sincronizar agora'}
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

      {error ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <div>
            <strong>Falha ao sincronizar</strong>
            <p>{error}</p>
          </div>
          <ActionButton icon="refresh" onClick={handleRefresh} variant="secondary">
            Tentar novamente
          </ActionButton>
        </div>
      ) : null}

      <section className="stats-grid admin-dashboard__stats">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <div className="admin-dashboard__layout">
        <div className="admin-dashboard__main">
          <SectionCard
            subtitle={
              loading
                ? 'Carregando solicitações…'
                : 'Solicitações que aguardam validação administrativa.'
            }
            title={`Aprovações pendentes (${pendingList.length})`}
          >
            {loading ? (
              <div className="admin-dashboard__loading">
                <span className="admin-dashboard__spinner" aria-hidden="true" />
                <p>Buscando solicitações…</p>
              </div>
            ) : pendingList.length === 0 ? (
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
                        <span>{item.role}</span>
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

          <SectionCard
            subtitle="Eventos mais recentes registrados na auditoria."
            title="Atividade recente"
          >
            {loading ? (
              <div className="admin-dashboard__loading">
                <span className="admin-dashboard__spinner" aria-hidden="true" />
                <p>Carregando auditoria…</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="admin-empty">
                <Icon name="reports" />
                <p>Nenhum evento registrado ainda.</p>
              </div>
            ) : (
              <ol className="admin-timeline">
                {recentActivity.map((event) => (
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
                        {event.actor} • {event.date}
                      </small>
                    </button>
                  </li>
                ))}
              </ol>
            )}
            <Link className="text-link admin-dashboard__inline-link" to="/admin/auditoria">
              Ver auditoria completa
              <Icon name="chevronRight" />
            </Link>
          </SectionCard>
        </div>

        <aside className="admin-dashboard__side">
          <SectionCard
            subtitle={`Distribuição de ${totalUsers} contas por status.`}
            title="Status das contas"
          >
            {loading ? (
              <div className="admin-dashboard__loading">
                <span className="admin-dashboard__spinner" aria-hidden="true" />
              </div>
            ) : userBreakdown.length === 0 ? (
              <p className="admin-dashboard__muted">Sem usuários cadastrados.</p>
            ) : (
              <ul className="admin-status-breakdown">
                {userBreakdown.map((group) => (
                  <li className="admin-status-breakdown__item" key={group.key}>
                    <div className="admin-status-breakdown__head">
                      <strong>{group.label}</strong>
                      <span>
                        {group.count} · {group.percent}%
                      </span>
                    </div>
                    <div className="admin-status-breakdown__bar">
                      <span
                        className={`admin-status-breakdown__fill admin-status-breakdown__fill--${group.tone}`}
                        style={{ width: `${group.percent}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            subtitle={
              loading
                ? 'Calculando distribuição…'
                : `Perfis com usuários ativos no sistema.`
            }
            title="Perfis e permissões"
          >
            {loading ? (
              <div className="admin-dashboard__loading">
                <span className="admin-dashboard__spinner" aria-hidden="true" />
              </div>
            ) : (
              <ul className="admin-distribution admin-distribution--compact">
                {distribution.map((group) => (
                  <li className="admin-distribution__item" key={group.name}>
                    <div className="admin-distribution__head">
                      <strong>{group.name}</strong>
                      <span>{group.users} usuários</span>
                    </div>
                    <div className="admin-distribution__bar">
                      <span
                        className="admin-distribution__bar-fill"
                        style={{ width: `${group.percent}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link className="text-link admin-dashboard__inline-link" to="/admin/perfis">
              Gerenciar perfis
              <Icon name="chevronRight" />
            </Link>
          </SectionCard>

          <nav className="admin-dashboard__quick-links" aria-label="Atalhos administrativos">
            <Link className="admin-dashboard__quick-link" to="/admin/usuarios">
              <Icon name="users" />
              <span>Gerenciar usuários</span>
            </Link>
            <Link className="admin-dashboard__quick-link" to="/admin/auditoria">
              <Icon name="reports" />
              <span>Auditoria completa</span>
            </Link>
            <Link className="admin-dashboard__quick-link" to="/admin/perfis">
              <Icon name="shield" />
              <span>Perfis e permissões</span>
            </Link>
          </nav>
        </aside>
      </div>

      <SectionCard
        subtitle={
          loading
            ? 'Carregando usuários…'
            : `Mostrando ${recentUsers.length} de ${totalUsers} usuários cadastrados.`
        }
        title="Últimos usuários"
      >
        {loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Buscando usuários…</p>
          </div>
        ) : recentUsers.length === 0 ? (
          <div className="admin-empty">
            <Icon name="users" />
            <p>Nenhum usuário cadastrado ainda.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="fleet-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Perfil</th>
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
        )}
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
          approvalModal.intent === 'approve' ? 'Aprovar nova conta' : 'Recusar solicitação'
        }
      >
        {approvalModal.item ? (
          <dl className="admin-modal-list">
            <div>
              <dt>Nome</dt>
              <dd>{approvalModal.item.name}</dd>
            </div>
            <div>
              <dt>Matrícula</dt>
              <dd>{approvalModal.item.matricula}</dd>
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
                <dd>{activityModal.item.date}</dd>
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
              <dt>E-mail</dt>
              <dd>{userModal.item.email}</dd>
            </div>
            <div>
              <dt>Matrícula</dt>
              <dd>{userModal.item.matricula}</dd>
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
