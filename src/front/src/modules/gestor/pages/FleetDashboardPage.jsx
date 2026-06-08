import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { getAuthSession } from '../../../services/authSession';
import { listarReservas } from '../../../services/reservaApi';
import { listarVeiculos } from '../../../services/veiculoApi';
import { mapBackendVehicleToView, pad2 } from '../../../services/veiculoMappers';
import { formatDateTime, formatStatusReserva } from '../../../utils/motoristaReservaUtils';

function buildAlertsFromVehicles(vehicles) {
  const blocked = vehicles
    .filter((v) => v.status === 'Bloqueado')
    .map((v) => ({
      id: `alert-bloq-${v.id}`,
      status: 'Bloqueado',
      text: `${v.plate} está indisponível para uso.`,
    }));

  const maintenance = vehicles
    .filter((v) => v.status === 'Manutenção')
    .map((v) => ({
      id: `alert-manu-${v.id}`,
      status: 'Manutenção',
      text: `${v.plate} (${v.model}) segue em oficina.`,
    }));

  return [...blocked, ...maintenance].slice(0, 5);
}

export function FleetDashboardPage() {
  const session = getAuthSession();
  const greetingName = session?.nome?.split(' ')[0] ?? 'Gestor';

  const [vehiclesData, setVehiclesData] = useState({
    loading: true,
    error: null,
    items: [],
  });
  const [reservasData, setReservasData] = useState({
    loading: true,
    error: null,
    items: [],
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setVehiclesData((current) => ({ ...current, loading: true, error: null }));
    setReservasData((current) => ({ ...current, loading: true, error: null }));

    listarVeiculos({ signal })
      .then((items) => {
        setVehiclesData({
          loading: false,
          error: null,
          items: items.map(mapBackendVehicleToView),
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setVehiclesData({
          loading: false,
          error: error.message || 'Falha ao carregar veículos.',
          items: [],
        });
      });

    listarReservas(null, { signal })
      .then((items) => {
        setReservasData({
          loading: false,
          error: null,
          items: items || [],
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setReservasData({
          loading: false,
          error: error.message || 'Falha ao carregar reservas.',
          items: [],
        });
      });

    return () => controller.abort();
  }, []);

  const loading = vehiclesData.loading || reservasData.loading;
  const error = vehiclesData.error || reservasData.error;

  const fleetStats = useMemo(() => {
    const items = vehiclesData.items;
    const count = (predicate) => items.filter(predicate).length;
    return [
      {
        caption: 'prontos para uso',
        icon: 'fleet',
        title: 'Disponíveis',
        value: pad2(count((v) => v.status === 'Ativo')),
        variant: 'active',
      },
      {
        caption: 'precisam de atenção',
        icon: 'alert',
        title: 'Bloqueados',
        value: pad2(count((v) => v.status === 'Bloqueado')),
        variant: 'blocked',
      },
      {
        caption: 'em oficina ou revisão',
        icon: 'maintenance',
        title: 'Manutenções',
        value: pad2(count((v) => v.status === 'Manutenção')),
        variant: 'maintenance',
      },
      {
        caption: 'cadastros monitorados',
        icon: 'reports',
        title: 'Total frota',
        value: pad2(items.length),
        variant: 'total',
      },
    ];
  }, [vehiclesData.items]);

  const reservaStats = useMemo(() => {
    const items = reservasData.items;
    const count = (status) => items.filter((r) => r.statusReserva === status).length;
    return [
      {
        caption: 'aguardando decisão',
        icon: 'calendar',
        title: 'Pendentes',
        value: pad2(count('SOLICITADA')),
        variant: 'maintenance',
      },
      {
        caption: 'trajetos em andamento',
        icon: 'fleet',
        title: 'Em uso',
        value: pad2(count('EM_USO')),
        variant: 'inactive',
      },
    ];
  }, [reservasData.items]);

  const fleetBreakdown = useMemo(() => {
    const items = vehiclesData.items;
    if (items.length === 0) return [];

    const groups = [
      { key: 'Ativo', label: 'Disponíveis', tone: 'active' },
      { key: 'Manutenção', label: 'Em manutenção', tone: 'maintenance' },
      { key: 'Bloqueado', label: 'Bloqueados', tone: 'blocked' },
    ];

    return groups
      .map((group) => {
        const count = items.filter((v) => v.status === group.key).length;
        return { ...group, count, percent: Math.round((count / items.length) * 100) };
      })
      .filter((group) => group.count > 0);
  }, [vehiclesData.items]);

  const reservaBreakdown = useMemo(() => {
    const items = reservasData.items;
    if (items.length === 0) return [];

    const groups = [
      { key: 'SOLICITADA', label: 'Pendentes', tone: 'pending' },
      { key: 'APROVADA', label: 'Aprovadas', tone: 'approved' },
      { key: 'EM_USO', label: 'Em uso', tone: 'active' },
      { key: 'CONCLUIDA', label: 'Concluídas', tone: 'done' },
      { key: 'REPROVADA', label: 'Reprovadas', tone: 'rejected' },
    ];

    return groups
      .map((group) => {
        const count = items.filter((r) => r.statusReserva === group.key).length;
        return { ...group, count, percent: Math.round((count / items.length) * 100) };
      })
      .filter((group) => group.count > 0);
  }, [reservasData.items]);

  const pendingReservas = useMemo(
    () =>
      reservasData.items
        .filter((r) => r.statusReserva === 'SOLICITADA')
        .sort(
          (a, b) =>
            new Date(b.dataHoraSolicitacao || 0).getTime() -
            new Date(a.dataHoraSolicitacao || 0).getTime(),
        )
        .slice(0, 5),
    [reservasData.items],
  );

  const activeTrips = useMemo(
    () =>
      reservasData.items
        .filter((r) => r.statusReserva === 'EM_USO')
        .sort(
          (a, b) =>
            new Date(a.dataHoraInicioPrevista || 0).getTime() -
            new Date(b.dataHoraInicioPrevista || 0).getTime(),
        )
        .slice(0, 5),
    [reservasData.items],
  );

  const recentReservas = useMemo(
    () =>
      [...reservasData.items]
        .sort(
          (a, b) =>
            new Date(b.dataHoraSolicitacao || 0).getTime() -
            new Date(a.dataHoraSolicitacao || 0).getTime(),
        )
        .slice(0, 6),
    [reservasData.items],
  );

  const alerts = useMemo(() => buildAlertsFromVehicles(vehiclesData.items), [vehiclesData.items]);

  return (
    <div className="page-stack gestor-page gestor-dashboard">
      <PageHeader
        actionIcon="plus"
        actionLabel="Cadastrar veículo"
        actionTo="/gestor/frota/novo"
        eyebrow="Área do gestor"
        subtitle="Visão operacional da frota, reservas e pendências de aprovação."
        title="Dashboard"
      />

      <section className="gestor-dashboard-hero">
        <div className="gestor-dashboard-hero__copy">
          <span className="gestor-dashboard-hero__eyebrow">Centro de controle</span>
          <h2>Olá, {greetingName}</h2>
          <p>
            {vehiclesData.items.length} veículos monitorados ·{' '}
            <strong>{pendingReservas.length} reservas aguardando decisão</strong> · acompanhe a
            operação em tempo real.
          </p>
        </div>
        <div className="gestor-dashboard-hero__metrics" aria-hidden="true">
          <div className="gestor-dashboard-hero__metric">
            <Icon name="fleet" />
            <span>{pad2(vehiclesData.items.filter((v) => v.status === 'Ativo').length)}</span>
            <small>Disponíveis</small>
          </div>
          <div className="gestor-dashboard-hero__metric gestor-dashboard-hero__metric--accent">
            <Icon name="reservations" />
            <span>{pad2(pendingReservas.length)}</span>
            <small>Pendentes</small>
          </div>
        </div>
      </section>

      {error ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <div>
            <strong>Falha ao carregar dados</strong>
            <p>{error}</p>
          </div>
        </div>
      ) : null}

      <section aria-label="Resumo da frota" className="stats-grid stats-grid--fleet">
        {[...fleetStats, ...reservaStats].map((stat) => (
          <StatCard key={stat.title} layout="vertical" {...stat} />
        ))}
      </section>

      <section className="content-grid">
        <div className="gestor-dashboard-main">
          <SectionCard
            subtitle="Distribuição por status operacional dos veículos cadastrados."
            title="Saúde da frota"
          >
            {loading ? (
              <div className="admin-dashboard__loading">
                <span className="admin-dashboard__spinner" aria-hidden="true" />
                <p>Carregando frota...</p>
              </div>
            ) : fleetBreakdown.length === 0 ? (
              <div className="admin-empty">
                <Icon name="fleet" />
                <p>Nenhum veículo cadastrado ainda.</p>
                <Link className="text-link" to="/gestor/frota/novo">
                  Cadastrar primeiro veículo
                </Link>
              </div>
            ) : (
              <div className="gestor-status-breakdown">
                {fleetBreakdown.map((item) => (
                  <div className="gestor-status-breakdown__row" key={item.key}>
                    <div className="gestor-status-breakdown__label">
                      <span>{item.label}</span>
                      <strong>{pad2(item.count)}</strong>
                    </div>
                    <div className="gestor-status-breakdown__track">
                      <span
                        className={`gestor-status-breakdown__bar gestor-status-breakdown__bar--${item.tone}`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <span className="gestor-status-breakdown__percent">{item.percent}%</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            subtitle="Solicitações aguardando aprovação ou reprovação do gestor."
            title="Reservas pendentes"
          >
            {loading ? (
              <div className="admin-dashboard__loading">
                <span className="admin-dashboard__spinner" aria-hidden="true" />
                <p>Carregando reservas...</p>
              </div>
            ) : pendingReservas.length === 0 ? (
              <div className="admin-empty">
                <Icon name="check" />
                <p>Nenhuma reserva aguardando decisão.</p>
              </div>
            ) : (
              <div className="gestor-reserva-list">
                {pendingReservas.map((reserva) => (
                  <article className="gestor-reserva-item" key={reserva.idReserva}>
                    <div className="gestor-reserva-item__main">
                      <span className="gestor-reserva-item__kicker">
                        RESERVA #{reserva.idReserva}
                      </span>
                      <h3>{reserva.destino}</h3>
                      <p>
                        {reserva.origem} → {reserva.destino}
                      </p>
                      <small>{reserva.nomeSolicitante}</small>
                    </div>
                    <div className="gestor-reserva-item__meta">
                      <StatusBadge label={formatStatusReserva(reserva.statusReserva)} />
                      <span>{formatDateTime(reserva.dataHoraInicioPrevista)}</span>
                      <Link
                        className="gestor-reserva-item__link"
                        to="/gestor/reservas"
                      >
                        Analisar
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            subtitle="Trajetos com status em uso no momento."
            title="Viagens em andamento"
          >
            {loading ? (
              <div className="admin-dashboard__loading">
                <span className="admin-dashboard__spinner" aria-hidden="true" />
                <p>Carregando viagens...</p>
              </div>
            ) : activeTrips.length === 0 ? (
              <div className="admin-empty">
                <Icon name="fleet" />
                <p>Nenhuma viagem em andamento no momento.</p>
              </div>
            ) : (
              <div className="gestor-reserva-list">
                {activeTrips.map((reserva) => (
                  <article className="gestor-reserva-item gestor-reserva-item--active" key={reserva.idReserva}>
                    <div className="gestor-reserva-item__main">
                      <span className="gestor-reserva-item__kicker">
                        RESERVA #{reserva.idReserva}
                      </span>
                      <h3>{reserva.destino}</h3>
                      <p>
                        {reserva.modeloVeiculo} · {reserva.placaVeiculo}
                      </p>
                    </div>
                    <div className="gestor-reserva-item__meta">
                      <StatusBadge label="Em uso" />
                      <span>{formatDateTime(reserva.dataHoraInicioPrevista)}</span>
                      <Link
                        className="gestor-reserva-item__link"
                        to={`/gestor/reservas/${reserva.idReserva}/historico`}
                      >
                        Ver uso
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="gestor-dashboard-side">
          <SectionCard subtitle="Atalhos para os fluxos mais usados." title="Ações rápidas">
            <div className="quick-links">
              <Link className="quick-link" to="/gestor/reservas">
                <strong>Gerenciar reservas</strong>
                <span>Aprovar, reprovar e acompanhar o ciclo completo.</span>
              </Link>
              <Link className="quick-link quick-link--with-meta" to="/gestor/reservas">
                <strong>Pendentes de análise</strong>
                <span>Solicitações aguardando sua decisão.</span>
                <small>{pad2(pendingReservas.length)} em aberto</small>
              </Link>
              <Link className="quick-link" to="/gestor/frota">
                <strong>Consultar frota</strong>
                <span>Status, documentos e detalhes dos veículos.</span>
              </Link>
              <Link className="quick-link" to="/gestor/manutencao">
                <strong>Manutenções</strong>
                <span>Solicitações e decisões de oficina.</span>
              </Link>
            </div>
          </SectionCard>

          <SectionCard subtitle="Veículos com impacto na disponibilidade." title="Alertas da frota">
            {loading ? (
              <div className="admin-dashboard__loading">
                <span className="admin-dashboard__spinner" aria-hidden="true" />
                <p>Carregando alertas...</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="admin-empty">
                <Icon name="check" />
                <p>Frota 100% operacional — sem alertas.</p>
              </div>
            ) : (
              <div className="alert-list">
                {alerts.map((alert) => (
                  <article className="alert-item" key={alert.id}>
                    <div>
                      <StatusBadge label={alert.status} />
                      <p>{alert.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>

          {reservaBreakdown.length > 0 ? (
            <SectionCard subtitle="Distribuição das reservas por status." title="Reservas por status">
              <div className="gestor-status-breakdown gestor-status-breakdown--compact">
                {reservaBreakdown.map((item) => (
                  <div className="gestor-status-breakdown__row" key={item.key}>
                    <div className="gestor-status-breakdown__label">
                      <span>{item.label}</span>
                      <strong>{pad2(item.count)}</strong>
                    </div>
                    <div className="gestor-status-breakdown__track">
                      <span
                        className={`gestor-status-breakdown__bar gestor-status-breakdown__bar--${item.tone}`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          <SectionCard subtitle="Últimas movimentações registradas." title="Atividade recente">
            {loading ? (
              <div className="admin-dashboard__loading">
                <span className="admin-dashboard__spinner" aria-hidden="true" />
                <p>Carregando atividade...</p>
              </div>
            ) : recentReservas.length === 0 ? (
              <div className="admin-empty">
                <Icon name="clipboard" />
                <p>Nenhuma reserva registrada ainda.</p>
              </div>
            ) : (
              <div className="gestor-activity-list">
                {recentReservas.map((reserva) => (
                  <article className="gestor-activity-item" key={`activity-${reserva.idReserva}`}>
                    <div>
                      <strong>
                        #{reserva.idReserva} · {reserva.destino}
                      </strong>
                      <span>{formatDateTime(reserva.dataHoraSolicitacao)}</span>
                    </div>
                    <StatusBadge label={formatStatusReserva(reserva.statusReserva)} />
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
