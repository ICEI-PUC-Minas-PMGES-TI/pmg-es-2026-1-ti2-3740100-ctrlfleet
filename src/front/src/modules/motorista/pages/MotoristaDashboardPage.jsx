import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FleetFilters } from '../../../components/gestor/FleetFilters';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { MotoristaReservationCardGrid } from '../../../components/motorista/MotoristaReservationCardGrid';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { listarReservasConcluidas } from '../../../services/motoristaApi';
import {
  DATE_RANGE_FILTERS,
  filterReservasByDateRange,
  sortReservasNewestFirst,
} from '../../../utils/motoristaReservaUtils';

function normalizeReserva(reserva) {
  return {
    ...reserva,
    statusReserva: reserva.statusReserva || reserva.status,
  };
}

export function MotoristaDashboardPage() {
  const location = useLocation();
  const motoristaId = getCurrentMotoristaId();

  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('90d');

  const loadReservas = useCallback(async () => {
    if (!motoristaId) return;

    setLoading(true);
    setError(null);

    try {
      const concluidas = await listarReservasConcluidas(motoristaId);
      setReservas(sortReservasNewestFirst((concluidas || []).map(normalizeReserva)));
    } catch (err) {
      setError(err.message || 'Não foi possível carregar as viagens.');
    } finally {
      setLoading(false);
    }
  }, [motoristaId]);

  useEffect(() => {
    loadReservas();
  }, [loadReservas, location.key]);

  const filteredReservas = useMemo(() => {
    const term = search.trim().toLowerCase();
    const byDate = filterReservasByDateRange(reservas, selectedDateRange);

    if (!term) return byDate;

    return byDate.filter((reserva) => {
      const haystack = [
        reserva.idReserva,
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
  }, [reservas, search, selectedDateRange]);

  if (!motoristaId) {
    return (
      <div className="page-stack motorista-page">
        <p className="motorista-dashboard__invalid">Sessão inválida para o perfil de motorista.</p>
      </div>
    );
  }

  return (
    <div className="page-stack motorista-page motorista-dashboard">
      <PageHeader title="Minhas viagens" />

      <FleetFilters
        dateRangeTabs={DATE_RANGE_FILTERS}
        onDateRangeChange={setSelectedDateRange}
        onSearchChange={setSearch}
        search={search}
        searchPlaceholder="Buscar por viagem, destino, placa ou solicitante..."
        selectedDateRange={selectedDateRange}
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
              Mostrando {filteredReservas.length} de {reservas.length} viagens concluídas
            </span>
            <span>Ordenadas da mais recente para a mais antiga (Viagem 1, 2, 3…)</span>
          </div>

          <MotoristaReservationCardGrid motoristaId={motoristaId} reservas={filteredReservas} />
        </>
      )}
    </div>
  );
}
