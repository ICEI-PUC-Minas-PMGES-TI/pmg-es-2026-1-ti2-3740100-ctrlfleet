import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { getAuthSession } from '../../../services/authSession';
import { getCurrentSolicitanteId, getCurrentSolicitanteMatricula } from '../../../services/currentSolicitante';
import { listarReservas } from '../../../services/reservaApi';
import {
  mapRequesterReservation,
  parseReservationDate,
} from '../../../services/requesterReservationUtils';
import { buscarUsuario } from '../../../services/usuarioApi';
import { attachSolicitanteReservaNumbers, formatReservaUsuarioLabel } from '../../../utils/userReservaNumbers';

function pad2(value) {
  return String(value).padStart(2, '0');
}

function isUpcoming(reservation) {
  const start = parseReservationDate(reservation.inicioPrevistoRaw);
  if (!start) return reservation.statusKey === 'APROVADA';
  return start.getTime() >= Date.now() - 60 * 60 * 1000;
}

export function RequesterDashboardPage() {
  const location = useLocation();
  const session = getAuthSession();
  const solicitanteId = getCurrentSolicitanteId();
  const matriculaFallback = getCurrentSolicitanteMatricula();

  const [profile, setProfile] = useState({
    loading: true,
    name: session?.nome ?? null,
    matricula: session?.matricula ?? matriculaFallback,
  });
  const [reservationsData, setReservationsData] = useState({ loading: true, error: null, items: [] });

  const carregarReservas = useCallback(
    (signal) => {
      setReservationsData((current) => ({ ...current, loading: true, error: null }));
      return listarReservas(null, { signal, idUsuario: solicitanteId })
        .then((items) => {
          setReservationsData({
            loading: false,
            error: null,
            items: (items || []).map(mapRequesterReservation),
          });
        })
        .catch((error) => {
          if (error.name === 'AbortError') return;
          setReservationsData({
            loading: false,
            error: error.message || 'Falha ao carregar reservas.',
            items: [],
          });
        });
    },
    [solicitanteId],
  );

  useEffect(() => {
    const controller = new AbortController();

    buscarUsuario(solicitanteId, { signal: controller.signal })
      .then((user) => {
        setProfile({
          loading: false,
          name: user?.nome ?? null,
          matricula: user?.matricula ?? matriculaFallback,
        });
      })
      .catch(() => {
        setProfile({ loading: false, name: null, matricula: matriculaFallback });
      });

    carregarReservas(controller.signal);
    return () => controller.abort();
  }, [carregarReservas, matriculaFallback, solicitanteId]);

  const reservations = useMemo(
    () => attachSolicitanteReservaNumbers(reservationsData.items),
    [reservationsData.items],
  );

  const stats = useMemo(() => {
    const items = reservations;
    const count = (statusKey) => items.filter((item) => item.statusKey === statusKey).length;

    return [
      {
        caption: 'solicitações registradas',
        icon: 'reservations',
        title: 'Total',
        value: pad2(items.length),
      },
      {
        caption: 'aguardando análise',
        icon: 'calendar',
        title: 'Pendentes',
        value: pad2(count('SOLICITADA')),
      },
      {
        caption: 'liberadas para uso',
        icon: 'check',
        title: 'Aprovadas',
        value: pad2(count('APROVADA')),
      },
      {
        caption: 'viagem em andamento',
        icon: 'fleet',
        title: 'Em uso',
        value: pad2(count('EM_USO')),
      },
    ];
  }, [reservations]);

  const upcomingTrips = useMemo(() => {
    return reservations
      .filter((item) => ['APROVADA', 'EM_USO'].includes(item.statusKey) && isUpcoming(item))
      .sort((a, b) => {
        const dateA = parseReservationDate(a.inicioPrevistoRaw)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const dateB = parseReservationDate(b.inicioPrevistoRaw)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [reservations]);

  const attentionItems = useMemo(() => {
    return reservations
      .filter((item) => ['SOLICITADA', 'REPROVADA'].includes(item.statusKey))
      .sort((a, b) => {
        const dateA = parseReservationDate(a.solicitacaoRaw)?.getTime() ?? 0;
        const dateB = parseReservationDate(b.solicitacaoRaw)?.getTime() ?? 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [reservations]);

  const recentActivity = useMemo(() => {
    return [...reservations]
      .sort((a, b) => {
        const dateA = parseReservationDate(a.solicitacaoRaw)?.getTime() ?? 0;
        const dateB = parseReservationDate(b.solicitacaoRaw)?.getTime() ?? 0;
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [reservations]);

  const statusBreakdown = useMemo(() => {
    const items = reservations;
    if (items.length === 0) return [];

    const groups = [
      { key: 'SOLICITADA', label: 'Pendentes', tone: 'pending' },
      { key: 'APROVADA', label: 'Aprovadas', tone: 'approved' },
      { key: 'EM_USO', label: 'Em uso', tone: 'active' },
      { key: 'CONCLUIDA', label: 'Concluídas', tone: 'done' },
      { key: 'REPROVADA', label: 'Reprovadas', tone: 'rejected' },
      { key: 'CANCELADA', label: 'Canceladas', tone: 'muted' },
    ];

    return groups
      .map((group) => {
        const count = items.filter((item) => item.statusKey === group.key).length;
        return { ...group, count, percent: Math.round((count / items.length) * 100) };
      })
      .filter((group) => group.count > 0);
  }, [reservations]);

  const greetingName = profile.name?.split(' ')[0] ?? 'Solicitante';

  return (
    <div className="page-stack requester-page">
      <PageHeader
        actionIcon="plus"
        actionLabel="Nova reserva"
        actionTo="/solicitante/reservas/nova"
        eyebrow="Área do solicitante"
        subtitle="Visão geral das suas solicitações, próximas viagens e pendências."
        title="Dashboard"
      />

      {location.state?.flashMessage ? <div className="flash-banner">{location.state.flashMessage}</div> : null}

      <section className="requester-dashboard-hero">
        <div className="requester-dashboard-hero__copy">
          <span className="requester-dashboard-hero__eyebrow">Bem-vindo(a)</span>
          <h2>Olá, {greetingName}</h2>
          <p>
            Matrícula <strong>{profile.matricula}</strong> · acompanhe o andamento das reservas da frota
            institucional em um só lugar.
          </p>
        </div>
        <div className="requester-dashboard-hero__badge" aria-hidden="true">
          <Icon name="reservations" />
        </div>
      </section>

      {reservationsData.error ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <div>
            <strong>Falha ao carregar dados</strong>
            <p>{reservationsData.error}</p>
          </div>
        </div>
      ) : null}

      <section className="stats-grid requester-stats">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="content-grid">
        <div className="requester-dashboard-main">
          <SectionCard
            subtitle="Reservas aprovadas ou em uso com início previsto à frente."
            title="Próximas viagens"
          >
            {reservationsData.loading ? (
              <div className="admin-dashboard__loading">
                <span className="admin-dashboard__spinner" aria-hidden="true" />
                <p>Carregando viagens...</p>
              </div>
            ) : upcomingTrips.length === 0 ? (
              <div className="requester-empty requester-empty--compact">
                <Icon name="calendar" />
                <p>Nenhuma viagem programada no momento.</p>
                <Link className="text-link" to="/solicitante/reservas/nova">
                  Solicitar nova reserva
                </Link>
              </div>
            ) : (
              <div className="requester-trip-list">
                {upcomingTrips.map((trip) => (
                  <article className="requester-trip-item" key={trip.idReserva}>
                    <div className="requester-trip-item__main">
                      <span className="requester-trip-item__kicker">
                        {formatReservaUsuarioLabel(trip.reservaNumber)}
                      </span>
                      <h3>{trip.destino}</h3>
                      <p>
                        {trip.origem} → {trip.destino}
                      </p>
                    </div>
                    <div className="requester-trip-item__meta">
                      <StatusBadge label={trip.statusLabel} />
                      <span>{trip.dataHoraInicioPrevista}</span>
                      <small>{trip.veiculo}</small>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            subtitle="Últimas movimentações das suas solicitações."
            title="Atividade recente"
          >
            {reservationsData.loading ? (
              <div className="admin-dashboard__loading">
                <span className="admin-dashboard__spinner" aria-hidden="true" />
                <p>Carregando atividade...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="requester-empty requester-empty--compact">
                <Icon name="clipboard" />
                <p>Você ainda não possui solicitações registradas.</p>
              </div>
            ) : (
              <div className="requester-activity-list">
                {recentActivity.map((item) => (
                  <article className="requester-activity-item" key={`activity-${item.idReserva}`}>
                    <div>
                      <strong>{formatReservaUsuarioLabel(item.reservaNumber)} · {item.destino}</strong>
                      <span>{item.dataHoraSolicitacao}</span>
                    </div>
                    <StatusBadge label={item.statusLabel} />
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="requester-dashboard-side">
          <SectionCard subtitle="Atalhos para os fluxos mais usados." title="Ações rápidas">
            <div className="quick-links">
              <Link className="quick-link" to="/solicitante/reservas/nova">
                <strong>Nova reserva</strong>
                <span>Escolha motorista, veículo e defina o trajeto no mapa.</span>
              </Link>
              <Link className="quick-link" to="/solicitante/reservas">
                <strong>Minhas reservas</strong>
                <span>Ver histórico completo, filtrar por status e cancelar pendentes.</span>
              </Link>
              <Link className="quick-link quick-link--with-meta" to="/solicitante/reservas">
                <strong>Pendentes de análise</strong>
                <span>Solicitações aguardando decisão do gestor.</span>
                <small>{pad2(attentionItems.filter((i) => i.statusKey === 'SOLICITADA').length)} em aberto</small>
              </Link>
            </div>
          </SectionCard>

          <SectionCard subtitle="Itens que exigem sua atenção imediata." title="Pendências">
            {reservationsData.loading ? (
              <div className="admin-dashboard__loading">
                <span className="admin-dashboard__spinner" aria-hidden="true" />
                <p>Carregando pendências...</p>
              </div>
            ) : attentionItems.length === 0 ? (
              <div className="admin-empty">
                <Icon name="check" />
                <p>Nenhuma pendência no momento.</p>
              </div>
            ) : (
              <div className="alert-list">
                {attentionItems.map((item) => (
                  <article className="alert-item" key={`attention-${item.idReserva}`}>
                    <div>
                      <StatusBadge label={item.statusLabel} />
                      <p>
                        <strong>{formatReservaUsuarioLabel(item.reservaNumber)}</strong> — {item.destino}
                        {item.statusKey === 'REPROVADA' ? ' (reprovada pelo gestor)' : ' (aguardando análise)'}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>

          {statusBreakdown.length > 0 ? (
            <SectionCard subtitle="Distribuição das suas solicitações por status." title="Resumo">
              <div className="requester-status-breakdown">
                {statusBreakdown.map((group) => (
                  <div className="requester-status-breakdown__row" key={group.key}>
                    <div className="requester-status-breakdown__label">
                      <span>{group.label}</span>
                      <strong>{pad2(group.count)}</strong>
                    </div>
                    <div className="requester-status-breakdown__track">
                      <span
                        className={`requester-status-breakdown__bar requester-status-breakdown__bar--${group.tone}`}
                        style={{ width: `${Math.max(group.percent, 6)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}
        </div>
      </section>
    </div>
  );
}
