import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatCard } from '../../../components/common/StatCard';
import { RequesterReservationCard } from '../../../components/solicitante/RequesterReservationCard';
import { getCurrentSolicitanteId } from '../../../services/currentSolicitante';
import { cancelarReserva, listarReservas } from '../../../services/reservaApi';
import { coordsFromReservation } from '../../../utils/resolveReservationCoords';

const STATUS_TABS = [
  { key: 'TODAS', label: 'Todas' },
  { key: 'SOLICITADA', label: 'Pendentes' },
  { key: 'APROVADA', label: 'Aprovadas' },
  { key: 'EM_USO', label: 'Em uso' },
  { key: 'CONCLUIDA', label: 'Concluídas' },
];

const STATUS_LABELS = {
  SOLICITADA: 'Solicitada',
  APROVADA: 'Aprovada',
  EM_USO: 'Em uso',
  CONCLUIDA: 'Concluída',
  REPROVADA: 'Reprovada',
  CANCELADA: 'Cancelada',
};

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function mapReservation(reservation) {
  const statusKey = reservation.statusReserva ?? 'SOLICITADA';
  const { origemCoords, destinoCoords } = coordsFromReservation(reservation);

  return {
    rawId: reservation.idReserva,
    dataHoraFimEstimada: formatDateTime(reservation.dataHoraFimEstimada),
    dataHoraInicioPrevista: formatDateTime(reservation.dataHoraInicioPrevista),
    dataHoraSolicitacao: formatDateTime(reservation.dataHoraSolicitacao),
    destino: reservation.destino,
    destinoLat: reservation.destinoLat,
    destinoLng: reservation.destinoLng,
    destinoCoords,
    idReserva: reservation.idReserva,
    origem: reservation.origem,
    origemLat: reservation.origemLat,
    origemLng: reservation.origemLng,
    origemCoords,
    statusKey,
    statusLabel: STATUS_LABELS[statusKey] ?? statusKey,
    veiculo: `${reservation.placaVeiculo} — ${reservation.modeloVeiculo}`,
  };
}

export function RequesterReservationsPage() {
  const location = useLocation();
  const solicitanteId = getCurrentSolicitanteId();
  const [statusFilter, setStatusFilter] = useState('TODAS');
  const [reservationsData, setReservationsData] = useState({ loading: true, error: null, items: [] });
  const [cancelingId, setCancelingId] = useState(null);

  const carregarReservas = useCallback(
    (signal) => {
      setReservationsData((current) => ({ ...current, loading: true, error: null }));
      return listarReservas(null, { signal, idUsuario: solicitanteId })
        .then((items) => {
          setReservationsData({
            loading: false,
            error: null,
            items: (items || []).map(mapReservation),
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
    carregarReservas(controller.signal);
    return () => controller.abort();
  }, [carregarReservas]);

  const filteredReservations = useMemo(() => {
    if (statusFilter === 'TODAS') return reservationsData.items;
    return reservationsData.items.filter((item) => item.statusKey === statusFilter);
  }, [reservationsData.items, statusFilter]);

  const summaryCards = useMemo(() => {
    const items = reservationsData.items;
    const count = (statusKey) => items.filter((reservation) => reservation.statusKey === statusKey).length;

    return [
      {
        caption: 'solicitações registradas',
        icon: 'reservations',
        title: 'Total',
        value: String(items.length).padStart(2, '0'),
      },
      {
        caption: 'aguardando análise',
        icon: 'calendar',
        title: 'Pendentes',
        value: String(count('SOLICITADA')).padStart(2, '0'),
      },
      {
        caption: 'liberadas para uso',
        icon: 'check',
        title: 'Aprovadas',
        value: String(count('APROVADA')).padStart(2, '0'),
      },
      {
        caption: 'viagens finalizadas',
        icon: 'clipboard',
        title: 'Concluídas',
        value: String(count('CONCLUIDA')).padStart(2, '0'),
      },
    ];
  }, [reservationsData.items]);

  async function handleCancel(reservaId) {
    if (!window.confirm('Deseja cancelar esta reserva?')) return;

    setCancelingId(reservaId);
    try {
      await cancelarReserva(reservaId);
      await carregarReservas();
    } catch (error) {
      window.alert(error.message || 'Não foi possível cancelar a reserva.');
    } finally {
      setCancelingId(null);
    }
  }

  return (
    <div className="page-stack requester-page">
      <PageHeader
        actionIcon="plus"
        actionLabel="Nova reserva"
        actionTo="/solicitante/reservas/nova"
        eyebrow="Área do solicitante"
        subtitle="Acompanhe suas solicitações com trajeto no mapa e status em tempo real."
        title="Minhas Reservas"
      />

      {location.state?.flashMessage ? <div className="flash-banner">{location.state.flashMessage}</div> : null}

      <section className="stats-grid requester-stats">
        {summaryCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <div className="requester-list-toolbar">
        <div className="requester-status-tabs" role="tablist" aria-label="Filtrar por status">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`requester-status-tabs__btn${statusFilter === tab.key ? ' is-active' : ''}`}
              onClick={() => setStatusFilter(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="requester-list-toolbar__count">
          {filteredReservations.length} reserva{filteredReservations.length === 1 ? '' : 's'}
        </span>
      </div>

      {reservationsData.loading ? (
        <div className="admin-dashboard__loading">
          <span className="admin-dashboard__spinner" aria-hidden="true" />
          <p>Carregando reservas...</p>
        </div>
      ) : reservationsData.error ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <div>
            <strong>Falha ao carregar reservas</strong>
            <p>{reservationsData.error}</p>
          </div>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="requester-empty">
          <Icon name="reservations" />
          <h2>Nenhuma reserva neste filtro</h2>
          <p>Crie uma nova solicitação com origem e destino marcados no mapa.</p>
          <ActionButton icon="plus" to="/solicitante/reservas/nova">
            Solicitar reserva
          </ActionButton>
        </div>
      ) : (
        <div className="requester-reservation-grid">
          {filteredReservations.map((reservation) => (
            <RequesterReservationCard
              key={reservation.idReserva}
              cancelingId={cancelingId}
              onCancel={handleCancel}
              reservation={reservation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
