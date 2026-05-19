import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { listarReservas } from '../../../services/reservaApi';

const PAGE_SIZE = 10;

const statusLabels = {
  APROVADA: 'Aprovada',
  CONCLUIDA: 'Concluída',
  SOLICITADA: 'Pendente',
};

function padId(prefix, value) {
  return `${prefix}-${String(value).padStart(3, '0')}`;
}

function formatDateTime(value) {
  if (!value) return 'Pendente';

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
  const statusReserva = statusLabels[reservation.statusReserva] ?? reservation.statusReserva ?? 'Pendente';

  return {
    datahoraFimEstimada: formatDateTime(reservation.datahoraFimEstimada),
    datahoraInicioPrevisto: formatDateTime(reservation.datahoraInicioPrevista),
    datahoraSolicitacao: formatDateTime(reservation.datahoraSolicitacao),
    destino: reservation.destino,
    idReserva: padId('RES', reservation.idReserva),
    idUsuario: padId('USR', reservation.idUsuario),
    idVeiculo: padId('VEI', reservation.idVeiculo),
    motorista: reservation.nomeMotorista || 'Motorista não vinculado',
    origem: reservation.origem,
    statusReserva,
    veiculo: `${reservation.placaVeiculo} - ${reservation.modeloVeiculo}`,
  };
}

function ReservationsPagination({ currentPage, onPageChange, totalPages }) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginação da lista de reservas" className="table-pagination">
      <button
        className="icon-button icon-button--label"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        <Icon name="chevronLeft" />
        Anterior
      </button>
      <span className="table-pagination__info">
        Página {currentPage} de {totalPages}
      </span>
      <button
        className="icon-button icon-button--label"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        Próxima
        <Icon name="chevronRight" />
      </button>
    </nav>
  );
}

export function RequesterReservationsPage() {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [reservationsData, setReservationsData] = useState({
    loading: true,
    error: null,
    items: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    listarReservas({ signal: controller.signal })
      .then((items) => {
        setReservationsData({
          loading: false,
          error: null,
          items: items.map(mapReservation),
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

    return () => controller.abort();
  }, []);

  const requesterReservations = reservationsData.items;

  const pagination = useMemo(() => {
    const total = requesterReservations.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(currentPage, totalPages);
    const startIndex = (page - 1) * PAGE_SIZE;

    return {
      currentPage: page,
      items: requesterReservations.slice(startIndex, startIndex + PAGE_SIZE),
      rangeEnd: Math.min(startIndex + PAGE_SIZE, total),
      rangeStart: total === 0 ? 0 : startIndex + 1,
      total,
      totalPages,
    };
  }, [currentPage, requesterReservations]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(requesterReservations.length / PAGE_SIZE));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, requesterReservations.length]);

  const summaryCards = useMemo(() => {
    const count = (status) => requesterReservations.filter((reservation) => reservation.statusReserva === status).length;

    return [
      {
        caption: 'solicitações registradas',
        icon: 'reservations',
        title: 'Total',
        value: String(requesterReservations.length).padStart(2, '0'),
      },
      {
        caption: 'aguardando análise',
        icon: 'calendar',
        title: 'Pendentes',
        value: String(count('Pendente')).padStart(2, '0'),
      },
      {
        caption: 'liberadas para uso',
        icon: 'check',
        title: 'Aprovadas',
        value: String(count('Aprovada')).padStart(2, '0'),
      },
      {
        caption: 'histórico do solicitante',
        icon: 'clipboard',
        title: 'Concluídas',
        value: String(count('Concluída')).padStart(2, '0'),
      },
    ];
  }, [requesterReservations]);

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="plus"
        actionLabel="Nova reserva"
        actionTo="/solicitante/reservas/nova"
        eyebrow="Área do solicitante"
        subtitle="Acompanhe o status das reservas solicitadas neste perfil."
        title="Minhas Reservas"
      />

      {location.state?.flashMessage ? <div className="flash-banner">{location.state.flashMessage}</div> : null}

      <section className="stats-grid">
        {summaryCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <SectionCard subtitle="Histórico e acompanhamento das solicitações feitas neste perfil." title="Reservas solicitadas">
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
        ) : requesterReservations.length === 0 ? (
          <div className="admin-empty">
            <Icon name="reservations" />
            <p>Nenhuma reserva cadastrada ainda.</p>
          </div>
        ) : (
          <>
            <div className="table-summary">
              <span>
                Mostrando {pagination.rangeStart}-{pagination.rangeEnd} de {pagination.total} reservas
              </span>
              <span>{PAGE_SIZE} por página</span>
            </div>

            <div className="table-wrapper">
              <table className="fleet-table">
                <thead>
                  <tr>
                    <th>Destino</th>
                    <th>Veículo</th>
                    <th>Motorista</th>
                    <th>Origem</th>
                    <th>Retirada</th>
                    <th>Devolução</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.items.map((reservation) => (
                    <tr key={reservation.idReserva}>
                      <td>
                        <strong>{reservation.destino}</strong>
                        <p className="reservation-table__purpose">Solicitada em {reservation.datahoraSolicitacao}</p>
                      </td>
                      <td>{reservation.veiculo}</td>
                      <td>{reservation.motorista}</td>
                      <td>{reservation.origem}</td>
                      <td>{reservation.datahoraInicioPrevisto}</td>
                      <td>{reservation.datahoraFimEstimada}</td>
                      <td>
                        <StatusBadge label={reservation.statusReserva} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="reservation-card-list">
              {pagination.items.map((reservation) => (
                <article className="reservation-card" key={reservation.idReserva}>
                  <div className="reservation-card__header">
                    <div>
                      <strong>{reservation.destino}</strong>
                      <span>{reservation.veiculo}</span>
                    </div>
                    <StatusBadge label={reservation.statusReserva} />
                  </div>
                  <dl className="reservation-card__meta">
                    <div>
                      <dt>Motorista</dt>
                      <dd>{reservation.motorista}</dd>
                    </div>
                    <div>
                      <dt>Origem</dt>
                      <dd>{reservation.origem}</dd>
                    </div>
                    <div>
                      <dt>Retirada</dt>
                      <dd>{reservation.datahoraInicioPrevisto}</dd>
                    </div>
                    <div>
                      <dt>Devolução</dt>
                      <dd>{reservation.datahoraFimEstimada}</dd>
                    </div>
                    <div className="reservation-card__purpose">
                      <dt>Solicitação</dt>
                      <dd>{reservation.datahoraSolicitacao}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <ReservationsPagination
              currentPage={pagination.currentPage}
              onPageChange={setCurrentPage}
              totalPages={pagination.totalPages}
            />
          </>
        )}
      </SectionCard>
    </div>
  );
}
