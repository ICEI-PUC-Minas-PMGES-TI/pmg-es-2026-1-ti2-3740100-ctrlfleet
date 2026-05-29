import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FleetFilters } from '../../../components/gestor/FleetFilters';
import { Icon } from '../../../components/common/Icon';
import { MotoristaReservationCardGrid } from '../../../components/motorista/MotoristaReservationCardGrid';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import {
  listarReservasAprovadas,
  listarReservasConcluidas,
  listarReservasEmUso,
} from '../../../services/motoristaApi';
import { formatStatusReserva, sortReservasNewestFirst } from '../../../utils/motoristaReservaUtils';

const STATUS_TABS = ['Todas', 'Aprovadas', 'Em uso', 'Finalizadas'];

function normalizeReserva(reserva) {
  return {
    ...reserva,
    statusReserva: reserva.statusReserva || reserva.status,
  };
}

export function MotoristaDashboardPage() {
  const location = useLocation();
  const motoristaId = getCurrentMotoristaId();

  const [state, setState] = useState({
    aprovadas: [],
    emUso: [],
    concluidas: [],
    loading: true,
    error: null,
  });
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todas');

  const loadReservas = useCallback(async () => {
    if (!motoristaId) return;

    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const [aprovadas, emUso, concluidas] = await Promise.all([
        listarReservasAprovadas(motoristaId),
        listarReservasEmUso(motoristaId),
        listarReservasConcluidas(motoristaId),
      ]);

      setState({
        aprovadas: (aprovadas || []).map(normalizeReserva),
        emUso: (emUso || []).map(normalizeReserva),
        concluidas: (concluidas || []).map(normalizeReserva),
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error.message || 'Não foi possível carregar as viagens.',
      }));
    }
  }, [motoristaId]);

  useEffect(() => {
    loadReservas();
  }, [loadReservas, location.key]);

  const allReservas = useMemo(() => {
    const byId = new Map();
    [...state.emUso, ...state.aprovadas, ...state.concluidas].forEach((reserva) => {
      byId.set(reserva.idReserva, reserva);
    });
    return sortReservasNewestFirst(Array.from(byId.values()));
  }, [state.aprovadas, state.concluidas, state.emUso]);

  const filteredReservas = useMemo(() => {
    const term = search.trim().toLowerCase();

    return allReservas.filter((reserva) => {
      const statusLabel = formatStatusReserva(reserva.statusReserva);
      const matchesStatus =
        selectedStatus === 'Todas' ||
        (selectedStatus === 'Aprovadas' && reserva.statusReserva === 'APROVADA') ||
        (selectedStatus === 'Em uso' && reserva.statusReserva === 'EM_USO') ||
        (selectedStatus === 'Finalizadas' && reserva.statusReserva === 'CONCLUIDA');

      if (!matchesStatus) return false;
      if (!term) return true;

      const haystack = [
        reserva.idReserva,
        reserva.destino,
        reserva.origem,
        reserva.placaVeiculo,
        reserva.modeloVeiculo,
        reserva.nomeSolicitante,
        statusLabel,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [allReservas, search, selectedStatus]);

  if (!motoristaId) {
    return (
      <div className="page-stack motorista-page">
        <p className="motorista-dashboard__invalid">Sessão inválida para o perfil de motorista.</p>
      </div>
    );
  }

  return (
    <div className="page-stack motorista-page motorista-dashboard">
      <FleetFilters
        onSearchChange={setSearch}
        onStatusChange={setSelectedStatus}
        search={search}
        searchPlaceholder="Buscar por viagem, destino, placa ou solicitante..."
        selectedStatus={selectedStatus}
        statusTabs={STATUS_TABS}
      />

      {state.loading ? (
        <div className="admin-dashboard__loading">
          <span aria-hidden="true" className="admin-dashboard__spinner" />
          <p>Carregando viagens...</p>
        </div>
      ) : state.error ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <div>
            <strong>Falha ao carregar viagens</strong>
            <p>{state.error}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="motorista-dashboard__summary">
            <span>
              Mostrando {filteredReservas.length} de {allReservas.length} viagens
            </span>
            <span>Ordenadas da mais recente para a mais antiga (Viagem 1, 2, 3…)</span>
          </div>

          <MotoristaReservationCardGrid motoristaId={motoristaId} reservas={filteredReservas} />
        </>
      )}
    </div>
  );
}
