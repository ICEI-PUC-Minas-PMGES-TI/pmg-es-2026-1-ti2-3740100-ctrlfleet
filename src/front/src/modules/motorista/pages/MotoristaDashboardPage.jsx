import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FleetFilters } from '../../../components/gestor/FleetFilters';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { MotoristaReservationCardGrid } from '../../../components/motorista/MotoristaReservationCardGrid';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { listarReservasAprovadas, listarReservasConcluidas, listarReservasEmUso } from '../../../services/motoristaApi';
import {
  DATE_RANGE_FILTERS,
  MOTORISTA_RESERVA_SORT_KEY,
  RESERVA_SORT_FILTERS,
  filterReservasByDateRange,
  getSortOrderLabel,
  readStoredSortOrder,
  sortReservasByOrder,
  writeStoredSortOrder,
} from '../../../utils/motoristaReservaUtils';
import {
  buildMotoristaViagemNumbers,
  getUserReservaNumber,
} from '../../../utils/userReservaNumbers';

function normalizeReserva(reserva) {
  return {
    ...reserva,
    statusReserva: reserva.statusReserva || reserva.status,
  };
}

function mergeMotoristaReservas({ aprovadas = [], concluidas = [], emUso = [] }) {
  const byId = new Map();

  concluidas.forEach((reserva) => {
    byId.set(reserva.idReserva, normalizeReserva(reserva));
  });
  aprovadas.forEach((reserva) => {
    byId.set(reserva.idReserva, normalizeReserva(reserva));
  });
  emUso.forEach((reserva) => {
    byId.set(reserva.idReserva, normalizeReserva(reserva));
  });

  return [...byId.values()];
}

export function MotoristaDashboardPage() {
  const location = useLocation();
  const motoristaId = getCurrentMotoristaId();

  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('90d');
  const [sortOrder, setSortOrder] = useState(() =>
    readStoredSortOrder(MOTORISTA_RESERVA_SORT_KEY, RESERVA_SORT_FILTERS, 'newest'),
  );

  const handleSortOrderChange = useCallback((order) => {
    setSortOrder(order);
    writeStoredSortOrder(MOTORISTA_RESERVA_SORT_KEY, order);
  }, []);

  const loadReservas = useCallback(async () => {
    if (!motoristaId) return;

    setLoading(true);
    setError(null);

    try {
      const [aprovadas, emUso, concluidas] = await Promise.all([
        listarReservasAprovadas(motoristaId),
        listarReservasEmUso(motoristaId),
        listarReservasConcluidas(motoristaId),
      ]);
      setReservas(mergeMotoristaReservas({ aprovadas, emUso, concluidas }));
    } catch (err) {
      setError(err.message || 'Não foi possível carregar as viagens.');
    } finally {
      setLoading(false);
    }
  }, [motoristaId]);

  useEffect(() => {
    loadReservas();
  }, [loadReservas, location.key]);

  const viagemNumbers = useMemo(
    () => buildMotoristaViagemNumbers(reservas),
    [reservas],
  );

  const reservaCounts = useMemo(() => {
    const count = (status) => reservas.filter((item) => item.statusReserva === status).length;
    return {
      aprovadas: count('APROVADA'),
      emUso: count('EM_USO'),
      concluidas: count('CONCLUIDA'),
    };
  }, [reservas]);

  const filteredReservas = useMemo(() => {
    const term = search.trim().toLowerCase();
    const byDate = filterReservasByDateRange(reservas, selectedDateRange);

    const filtered = !term
      ? byDate
      : byDate.filter((reserva) => {
          const viagemNumber = getUserReservaNumber(viagemNumbers, reserva.idReserva);
          const haystack = [
            viagemNumber,
            reserva.destino,
            reserva.origem,
            reserva.placaVeiculo,
            reserva.modeloVeiculo,
            reserva.nomeSolicitante,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return haystack.includes(term);
        });

    return sortReservasByOrder(filtered, sortOrder).map((reserva) => ({
      ...reserva,
      viagemNumber: getUserReservaNumber(viagemNumbers, reserva.idReserva),
    }));
  }, [reservas, search, selectedDateRange, sortOrder, viagemNumbers]);

  if (!motoristaId) {
    return (
      <div className="page-stack motorista-page">
        <p className="motorista-dashboard__invalid">Sessão inválida para o perfil de motorista.</p>
      </div>
    );
  }

  return (
    <div className="page-stack motorista-page motorista-dashboard">
      <PageHeader
        subtitle="Reservas aprovadas, viagens em andamento e histórico concluído."
        title="Minhas viagens"
      />

      <FleetFilters
        className="fleet-filters--motorista"
        dateRangeTabs={DATE_RANGE_FILTERS}
        onDateRangeChange={setSelectedDateRange}
        onSearchChange={setSearch}
        onSortOrderChange={handleSortOrderChange}
        search={search}
        searchPlaceholder="Buscar por viagem, destino, placa ou solicitante..."
        selectedDateRange={selectedDateRange}
        selectedSortOrder={sortOrder}
        sortOrderTabs={RESERVA_SORT_FILTERS}
      />

      {loading ? (
        <div className="admin-dashboard__loading">
          <span aria-hidden="true" className="admin-dashboard__spinner" />
          <p>Carregando viagens...</p>
        </div>
      ) : error ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <div>
            <strong>Falha ao carregar viagens</strong>
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="motorista-dashboard__summary">
            <span>
              Mostrando {filteredReservas.length} de {reservas.length} viagens
              {reservaCounts.aprovadas + reservaCounts.emUso > 0
                ? ` · ${reservaCounts.aprovadas} aprovada(s) · ${reservaCounts.emUso} em uso`
                : ''}
            </span>
            <span>Ordenado por: {getSortOrderLabel(sortOrder, RESERVA_SORT_FILTERS)}</span>
          </div>

          <MotoristaReservationCardGrid motoristaId={motoristaId} reservas={filteredReservas} />
        </>
      )}
    </div>
  );
}
