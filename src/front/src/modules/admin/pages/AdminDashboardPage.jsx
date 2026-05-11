import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { Modal } from '../../../components/common/Modal';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { adminRecentActivity, permissionGroups } from '../../../data/adminData';
import { aprovarUsuario, listarUsuarios, recusarUsuario } from '../../../services/usuarioApi';
import {
  formatBrDate,
  mapBackendUserToView,
  pad2,
} from '../../../services/usuarioMappers';

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

/**
 * Enriquece um usuário (já mapeado para o formato de UI) com os campos
 * extras esperados pela seção de aprovações pendentes.
 */
function toPendingApproval(user) {
  return {
    ...user,
    requestedAt: formatBrDate(user.dataAdmissao),
    requestedBy: 'Sistema',
    type: 'Novo cadastro',
  };
}

export function AdminDashboardPage() {
  const [feedback, setFeedback] = useState(null);

  const [approvalModal, setApprovalModal] = useState({
    open: false,
    intent: 'approve',
    item: null,
  });
  const [activityModal, setActivityModal] = useState({ open: false, item: null });
  const [userModal, setUserModal] = useState({ open: false, item: null });

  const [usersData, setUsersData] = useState({
    loading: true,
    error: null,
    items: [],
  });

  const [dismissedPendingIds, setDismissedPendingIds] = useState(() => new Set());

  function fetchUsuarios(signal) {
    setUsersData((current) => ({ ...current, loading: true, error: null }));
    return listarUsuarios({ signal })
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
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchUsuarios(controller.signal);
    return () => controller.abort();
  }, []);

  const recentUsers = useMemo(() => usersData.items.slice(0, 5), [usersData.items]);
  const totalUsers = usersData.items.length;

  const pendingList = useMemo(
    () =>
      usersData.items
        .filter((user) => user.status === 'Pendente' && !dismissedPendingIds.has(user.id))
        .map(toPendingApproval),
    [usersData.items, dismissedPendingIds],
  );

  const distribution = useMemo(() => {
    const counts = new Map();
    for (const user of usersData.items) {
      if (!user.role || user.role === '—') continue;
      counts.set(user.role, (counts.get(user.role) || 0) + 1);
    }
    const total = usersData.items.length || 1;
    return permissionGroups.map((group) => {
      const users = counts.get(group.name) || 0;
      return {
        name: group.name,
        description: group.description,
        modules: group.modules,
        users,
        percent: Math.round((users / total) * 100),
      };
    });
  }, [usersData.items]);

  const dashboardStats = useMemo(() => {
    const total = usersData.items.length;
    const pendentes = pendingList.length;
    const perfisAtivos = distribution.filter((group) => group.users > 0).length;
    return [
      {
        caption: 'Usuários cadastrados',
        icon: 'users',
        title: 'Contas',
        value: pad2(total),
      },
      {
        caption: 'Aguardando validação',
        icon: 'alert',
        title: 'Pendências',
        value: pad2(pendentes),
      },
      {
        caption: 'Perfis com usuários ativos',
        icon: 'shield',
        title: 'Perfis',
        value: pad2(perfisAtivos),
      },
      {
        caption: 'Ações registradas hoje',
        icon: 'reports',
        title: 'Auditoria',
        value: '76',
      },
    ];
  }, [usersData.items.length, pendingList.length, distribution]);

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
        intent === 'approve'
          ? await aprovarUsuario(item.id)
          : await recusarUsuario(item.id);
      const updatedView = mapBackendUserToView(updated);
      setUsersData((current) => ({
        ...current,
        items: current.items.map((user) => (user.id === item.id ? updatedView : user)),
      }));
      setDismissedPendingIds((current) => {
        const next = new Set(current);
        next.add(item.id);
        return next;
      });
      window.dispatchEvent(new Event('ctrlfleet:usuarios-updated'));
      setFeedback({
        tone: intent === 'approve' ? 'success' : 'danger',
        message:
          intent === 'approve'
            ? `${item.name} aprovado com sucesso.`
            : `${item.name} foi recusado e inativado.`,
      });
      closeApprovalModal();
      setTimeout(() => setFeedback(null), 4000);
    } catch (error) {
      setFeedback({
        tone: 'danger',
        message: error instanceof Error ? error.message : 'Não foi possível concluir a ação.',
      });
      setTimeout(() => setFeedback(null), 4000);
    }
  }

  function handleRefresh() {
    setDismissedPendingIds(new Set());
    fetchUsuarios()
      .then(() => setFeedback({ tone: 'success', message: 'Indicadores atualizados.' }))
      .then(() => setTimeout(() => setFeedback(null), 3000))
      .catch(() => {});
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
            onClick={handleRefresh}
            variant="secondary"
            disabled={usersData.loading}
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
        subtitle={
          usersData.loading
            ? 'Carregando solicitações...'
            : usersData.error
              ? 'Não foi possível carregar as solicitações.'
              : 'Solicitações que aguardam validação administrativa.'
        }
        title={`Aprovações pendentes (${pendingList.length})`}
      >
          {usersData.loading ? (
            <div className="admin-dashboard__loading">
              <span className="admin-dashboard__spinner" aria-hidden="true" />
              <p>Buscando solicitações...</p>
            </div>
          ) : usersData.error ? (
            <div className="admin-dashboard__error">
              <Icon name="alert" />
              <div>
                <strong>Falha ao carregar solicitações</strong>
                <p>{usersData.error}</p>
              </div>
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
          subtitle={
            usersData.loading
              ? 'Calculando distribuição...'
              : `Distribuição de ${totalUsers} ${totalUsers === 1 ? 'conta' : 'contas'} pelos perfis ativos.`
          }
          title="Perfis e permissões"
        >
          {usersData.loading ? (
            <div className="admin-dashboard__loading">
              <span className="admin-dashboard__spinner" aria-hidden="true" />
              <p>Agrupando perfis...</p>
            </div>
          ) : (
            <ul className="admin-distribution">
              {distribution.map((group) => (
                <li className="admin-distribution__item" key={group.name}>
                  <div className="admin-distribution__head">
                    <strong>{group.name}</strong>
                    <span>
                      {group.users} {group.users === 1 ? 'usuário' : 'usuários'} • {group.percent}%
                    </span>
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
          )}
          <Link className="text-link admin-dashboard__inline-link" to="/admin/perfis">
            Gerenciar perfis
            <Icon name="chevronRight" />
          </Link>
        </SectionCard>
      </section>

      <SectionCard
        subtitle={
          usersData.loading
            ? 'Carregando usuários do banco...'
            : usersData.error
              ? 'Não foi possível carregar a lista.'
              : `Mostrando ${recentUsers.length} de ${totalUsers} usuários cadastrados.`
        }
        title="Últimos usuários"
      >
        {usersData.loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Buscando usuários...</p>
          </div>
        ) : usersData.error ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Falha ao carregar usuários</strong>
              <p>{usersData.error}</p>
            </div>
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
