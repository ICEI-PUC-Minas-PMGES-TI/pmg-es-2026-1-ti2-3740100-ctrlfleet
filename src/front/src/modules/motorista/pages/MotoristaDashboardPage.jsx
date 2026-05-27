import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FleetFilters } from '../../../components/gestor/FleetFilters';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
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
        error: error.message || 'Não foi possível carregar as reservas.',
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

  const summaryCards = useMemo(
    () => [
      {
        title: 'Aprovadas',
        value: String(state.aprovadas.length),
        icon: 'reservations',
        caption: 'Prontas para checklist de saída',
      },
      {
        title: 'Em uso',
        value: String(state.emUso.length),
        icon: 'fleet',
        caption: 'Trajetos em andamento',
      },
      {
        title: 'Finalizadas',
        value: String(state.concluidas.length),
        icon: 'history',
        caption: 'Corridas encerradas',
      },
    ],
    [state.aprovadas.length, state.concluidas.length, state.emUso.length],
  );

  if (!motoristaId) {
    return (
      <div className="page-stack">
        <PageHeader subtitle="Sessão inválida para o perfil de motorista." title="Minhas reservas" />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        actions={
          <Link className="action-button action-button--secondary" to={`/motorista/${motoristaId}/historico`}>
            <Icon name="history" />
            <span>Histórico de corridas</span>
          </Link>
        }
        subtitle="Reservas aprovadas e em uso — mesmo padrão visual do gestor de frota."
        title="Minhas reservas"
      />

      <section aria-label="Resumo das reservas" className="stats-grid stats-grid--fleet">
        {summaryCards.map((stat) => (
          <StatCard key={stat.title} layout="vertical" {...stat} />
        ))}
      </section>

      <SectionCard>
        <FleetFilters
          onSearchChange={setSearch}
          onStatusChange={setSelectedStatus}
          search={search}
          searchPlaceholder="Buscar por destino, placa, solicitante ou nº..."
          selectedStatus={selectedStatus}
          statusTabs={STATUS_TABS}
        />

        {state.loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Carregando reservas...</p>
          </div>
        ) : state.error ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Falha nas reservas</strong>
              <p>{state.error}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="table-summary">
              <span>
                Mostrando {filteredReservas.length} de {allReservas.length} reservas
              </span>
              <span>Cards com trajeto, veículo e ações de checklist.</span>
            </div>

            <MotoristaReservationCardGrid motoristaId={motoristaId} reservas={filteredReservas} />
          </>
        )}
      </SectionCard>
    </div>
  );
}
