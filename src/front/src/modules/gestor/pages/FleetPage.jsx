import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FleetFilters } from '../../../components/gestor/FleetFilters';
import { FleetMapModal } from '../../../components/gestor/FleetMapModal';
import { VehicleCardGrid } from '../../../components/gestor/VehicleCardGrid';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { desativarVeiculo, listarVeiculos } from '../../../services/veiculoApi';
import { mapBackendVehicleToView, pad2 } from '../../../services/veiculoMappers';
import {
  buildFleetStatusTabs,
  buildFleetTypeTabs,
  filterFleetVehicles,
  hasActiveFleetFilters,
  resolveFleetFilterSelection,
} from '../../../utils/fleetVehicleFilters';

export function FleetPage() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');

  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [vehiclesData, setVehiclesData] = useState({
    loading: true,
    error: null,
    items: [],
  });

  function carregarVeiculos(signal) {
    setVehiclesData((current) => ({ ...current, loading: true, error: null }));
    return listarVeiculos({ signal })
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
  }

  useEffect(() => {
    const controller = new AbortController();

    setSearch('');
    setSelectedStatus('Todos');
    setSelectedType('Todos');
    carregarVeiculos(controller.signal);

    return () => controller.abort();
  }, []);

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

  const showStatusFilter = statusTabOptions.length > 1;
  const showTypeFilter = typeTabOptions.length > 1;
  const filtersReady = !vehiclesData.loading && !vehiclesData.error && vehiclesData.items.length > 0;

  async function handleDeactivateVehicle(vehicle) {
    const confirmed = window.confirm(`Desativar o veiculo ${vehicle.plate}?`);
    if (!confirmed) return;

    try {
      await desativarVeiculo(vehicle.id);
      await carregarVeiculos();
    } catch (error) {
      setVehiclesData((current) => ({
        ...current,
        error: error.message || 'Nao foi possivel desativar o veiculo.',
      }));
    }
  }

  const summaryCards = useMemo(() => {
    const items = vehiclesData.items;
    const count = (predicate) => items.filter(predicate).length;
    return [
      {
        caption: 'Cadastros monitorados',
        icon: 'fleet',
        title: 'Total',
        value: pad2(items.length),
        variant: 'total',
      },
      {
        caption: 'Prontos para uso',
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
        caption: 'Fora de operação',
        icon: 'close',
        title: 'Inativos',
        value: pad2(count((item) => item.status === 'Inativo')),
        variant: 'inactive',
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

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="plus"
        actionLabel="Cadastrar veículo"
        actionTo="/gestor/frota/novo"
        onSecondaryAction={() => setMapModalOpen(true)}
        secondaryActionIcon="map"
        secondaryActionLabel="Mapa da frota"
        subtitle="Gerenciamento de veículos cadastrados"
        title="Frota"
      />

      {location.state?.flashMessage ? <div className="flash-banner">{location.state.flashMessage}</div> : null}

      <section aria-label="Resumo da frota" className="stats-grid stats-grid--fleet">
        {summaryCards.map((stat) => (
          <StatCard key={stat.title} layout="vertical" {...stat} />
        ))}
      </section>

      <SectionCard>
        {filtersReady ? (
          <FleetFilters
            className="fleet-filters--gestor"
            controlIdPrefix="gestor-frota"
            onSearchChange={setSearch}
            onStatusChange={setSelectedStatus}
            onTypeChange={setSelectedType}
            search={search}
            selectedStatus={activeFilters.status}
            selectedType={activeFilters.type}
            statusSelectMode
            statusTabs={showStatusFilter ? statusTabOptions : null}
            vehicleTypeTabs={showTypeFilter ? typeTabOptions : null}
          />
        ) : null}

        {vehiclesData.loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
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
            <p>Nenhum veículo cadastrado ainda.</p>
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
              <span>Clique em um card para visualizar, editar ou desativar o veículo.</span>
            </div>

            <VehicleCardGrid onDeactivate={handleDeactivateVehicle} vehicles={filteredVehicles} />
          </>
        )}
      </SectionCard>

      <FleetMapModal
        onClose={() => setMapModalOpen(false)}
        open={mapModalOpen}
        vehicles={vehiclesData.items}
      />
    </div>
  );
}
