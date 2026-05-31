import { useEffect, useMemo, useState } from 'react';
import { FleetFilters } from '../../../components/gestor/FleetFilters';
import { VehicleCardGrid } from '../../../components/gestor/VehicleCardGrid';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { listarVeiculosDoMotorista } from '../../../services/motoristaFrotaApi';
import { mapBackendVehicleToView, pad2 } from '../../../services/veiculoMappers';
import {
  buildFleetStatusTabs,
  buildFleetTypeTabs,
  filterFleetVehicles,
  hasActiveFleetFilters,
  resolveFleetFilterSelection,
} from '../../../utils/fleetVehicleFilters';

export function MotoristaVeiculosPage() {
  const motoristaId = getCurrentMotoristaId();
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');
  const [vehiclesData, setVehiclesData] = useState({
    loading: true,
    error: null,
    items: [],
  });

  useEffect(() => {
    if (!motoristaId) return undefined;

    const controller = new AbortController();
    setVehiclesData((current) => ({ ...current, loading: true, error: null }));
    setSearch('');
    setSelectedStatus('Todos');
    setSelectedType('Todos');

    listarVeiculosDoMotorista(motoristaId, { apenasDisponiveis: false, signal: controller.signal })
      .then((items) => {
        setVehiclesData({
          loading: false,
          error: null,
          items: (items || []).map(mapBackendVehicleToView),
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

    return () => controller.abort();
  }, [motoristaId]);

  const statusTabOptions = useMemo(
    () => buildFleetStatusTabs(vehiclesData.items),
    [vehiclesData.items],
  );

  const typeTabOptions = useMemo(
    () => buildFleetTypeTabs(vehiclesData.items),
    [vehiclesData.items],
  );

  const activeFilters = useMemo(
    () =>
      resolveFleetFilterSelection({
        status: selectedStatus,
        type: selectedType,
        statusTabs: statusTabOptions,
        typeTabs: typeTabOptions,
      }),
    [selectedStatus, selectedType, statusTabOptions, typeTabOptions],
  );

  useEffect(() => {
    setSelectedStatus((current) => (current === activeFilters.status ? current : activeFilters.status));
    setSelectedType((current) => (current === activeFilters.type ? current : activeFilters.type));
  }, [activeFilters.status, activeFilters.type]);

  const filteredVehicles = useMemo(
    () =>
      filterFleetVehicles(vehiclesData.items, {
        search,
        status: activeFilters.status,
        type: activeFilters.type,
      }),
    [search, activeFilters.status, activeFilters.type, vehiclesData.items],
  );

  const summaryCards = useMemo(() => {
    const items = vehiclesData.items;
    const count = (predicate) => items.filter(predicate).length;
    return [
      {
        caption: 'Vinculados a você',
        icon: 'fleet',
        title: 'Total',
        value: pad2(items.length),
        variant: 'total',
      },
      {
        caption: 'Sem pendência documental',
        icon: 'check',
        title: 'Ativos',
        value: pad2(count((item) => item.status === 'Ativo')),
        variant: 'active',
      },
      {
        caption: 'Em oficina ou revisão',
        icon: 'maintenance',
        title: 'Manutenção',
        value: pad2(count((item) => item.status === 'Manutenção')),
        variant: 'maintenance',
      },
      {
        caption: 'Com documento vencido',
        icon: 'alert',
        title: 'Bloqueados',
        value: pad2(count((item) => item.status === 'Bloqueado')),
        variant: 'blocked',
      },
    ];
  }, [vehiclesData.items]);

  const showStatusFilter = statusTabOptions.length > 1;
  const showTypeFilter = typeTabOptions.length > 1;
  const filtersReady = !vehiclesData.loading && !vehiclesData.error && vehiclesData.items.length > 0;

  if (!motoristaId) {
    return (
      <div className="page-stack motorista-page">
        <p className="motorista-dashboard__invalid">Sessão inválida para o perfil de motorista.</p>
      </div>
    );
  }

  return (
    <div className="page-stack motorista-page">
      <PageHeader
        subtitle="Consulte os veículos vinculados ao seu perfil e a situação da documentação."
        title="Meus veículos"
      />

      <section aria-label="Resumo dos veículos" className="stats-grid stats-grid--fleet">
        {summaryCards.map((stat) => (
          <StatCard key={stat.title} layout="vertical" {...stat} />
        ))}
      </section>

      {filtersReady ? (
        <FleetFilters
          className="fleet-filters--motorista"
          controlIdPrefix="motorista-veiculos"
          onSearchChange={setSearch}
          onStatusChange={setSelectedStatus}
          onTypeChange={setSelectedType}
          search={search}
          searchPlaceholder="Buscar por placa, modelo ou tipo..."
          selectedStatus={activeFilters.status}
          selectedType={activeFilters.type}
          statusSelectMode
          statusTabs={showStatusFilter ? statusTabOptions : null}
          vehicleTypeTabs={showTypeFilter ? typeTabOptions : null}
        />
      ) : null}

      <SectionCard>
        {vehiclesData.loading ? (
          <div className="admin-dashboard__loading">
            <span aria-hidden="true" className="admin-dashboard__spinner" />
            <p>Carregando veículos...</p>
          </div>
        ) : vehiclesData.error ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Falha ao carregar veículos</strong>
              <p>{vehiclesData.error}</p>
            </div>
          </div>
        ) : vehiclesData.items.length === 0 ? (
          <div className="admin-empty">
            <Icon name="fleet" />
            <p>Nenhum veículo vinculado ao seu perfil.</p>
          </div>
        ) : (
          <>
            <div className="table-summary">
              <span>
                Mostrando {filteredVehicles.length} de {vehiclesData.items.length} veículos
                {hasActiveFleetFilters({
                  search,
                  status: activeFilters.status,
                  type: activeFilters.type,
                })
                  ? ` · Status: ${activeFilters.status} · Tipo: ${activeFilters.type}`
                  : ''}
              </span>
              <span>Visualização somente leitura — dados gerenciados pela frota.</span>
            </div>

            <VehicleCardGrid
              readOnly
              vehicles={filteredVehicles}
              viewTo={`/motorista/${motoristaId}/veiculos/:vehicleId`}
            />
          </>
        )}
      </SectionCard>
    </div>
  );
}
