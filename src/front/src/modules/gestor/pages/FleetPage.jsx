import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FleetFilters } from '../../../components/gestor/FleetFilters';
import { VehicleTable } from '../../../components/gestor/VehicleTable';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { statusTabs } from '../../../data/fleetData';
import { listarVeiculos } from '../../../services/veiculoApi';
import { mapBackendVehicleToView, pad2 } from '../../../services/veiculoMappers';

function filterByStatus(vehicle, status) {
  if (status === 'Todos') {
    return true;
  }
  return vehicle.status === status;
}

export function FleetPage() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  const [vehiclesData, setVehiclesData] = useState({
    loading: true,
    error: null,
    items: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    setVehiclesData((current) => ({ ...current, loading: true, error: null }));
    listarVeiculos({ signal: controller.signal })
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

    return () => controller.abort();
  }, []);

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return vehiclesData.items.filter((vehicle) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        (vehicle.plate || '').toLowerCase().includes(normalizedSearch) ||
        (vehicle.model || '').toLowerCase().includes(normalizedSearch);

      return matchesSearch && filterByStatus(vehicle, selectedStatus);
    });
  }, [search, selectedStatus, vehiclesData.items]);

  const summaryCards = useMemo(() => {
    const items = vehiclesData.items;
    const count = (predicate) => items.filter(predicate).length;
    return [
      {
        caption: 'cadastros monitorados',
        icon: 'fleet',
        title: 'Total',
        value: pad2(items.length),
      },
      {
        caption: 'prontos para uso',
        icon: 'check',
        title: 'Ativos',
        value: pad2(count((item) => item.status === 'Ativo')),
      },
      {
        caption: 'em oficina ou revisão',
        icon: 'maintenance',
        title: 'Manutenção',
        value: pad2(count((item) => item.status === 'Manutenção')),
      },
      {
        caption: 'com restrição documental',
        icon: 'alert',
        title: 'Bloqueados',
        value: pad2(count((item) => item.status === 'Bloqueado')),
      },
    ];
  }, [vehiclesData.items]);

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="plus"
        actionLabel="Cadastrar veículo"
        actionTo="/gestor/frota/novo"
        subtitle="Gerenciamento de veículos cadastrados"
        title="Frota"
      />

      {location.state?.flashMessage ? <div className="flash-banner">{location.state.flashMessage}</div> : null}

      <section className="stats-grid">
        {summaryCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <SectionCard>
        <FleetFilters
          onSearchChange={setSearch}
          onStatusChange={setSelectedStatus}
          search={search}
          selectedStatus={selectedStatus}
          statusTabs={statusTabs}
        />

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
              </span>
              <span>Atualização documental e visualização detalhada disponíveis em cada linha.</span>
            </div>

            <VehicleTable vehicles={filteredVehicles} />
          </>
        )}
      </SectionCard>
    </div>
  );
}
