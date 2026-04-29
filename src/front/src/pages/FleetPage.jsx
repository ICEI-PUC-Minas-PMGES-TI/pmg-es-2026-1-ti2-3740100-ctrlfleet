import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FleetFilters } from '../components/fleet/FleetFilters';
import { VehicleTable } from '../components/fleet/VehicleTable';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StatCard } from '../components/common/StatCard';
import { fleetVehicles, secretariats, statusTabs } from '../data/fleetData';

function filterByStatus(vehicle, status) {
  if (status === 'Todos') {
    return true;
  }

  if (status === 'Manutenção') {
    return vehicle.status === 'Manutenção';
  }

  return vehicle.status === status;
}

function filterBySecretariat(vehicle, secretariat) {
  if (secretariat === 'Secretaria (Todas)') {
    return true;
  }

  return vehicle.secretariat === secretariat;
}

export function FleetPage() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedSecretariat, setSelectedSecretariat] = useState('Secretaria (Todas)');

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return fleetVehicles.filter((vehicle) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        vehicle.plate.toLowerCase().includes(normalizedSearch) ||
        vehicle.model.toLowerCase().includes(normalizedSearch);

      return (
        matchesSearch &&
        filterByStatus(vehicle, selectedStatus) &&
        filterBySecretariat(vehicle, selectedSecretariat)
      );
    });
  }, [search, selectedSecretariat, selectedStatus]);

  const summaryCards = useMemo(
    () => [
      {
        caption: 'cadastros monitorados',
        icon: 'fleet',
        title: 'Total',
        value: String(fleetVehicles.length).padStart(2, '0'),
      },
      {
        caption: 'prontos para uso',
        icon: 'check',
        title: 'Ativos',
        value: String(fleetVehicles.filter((item) => item.status === 'Ativo').length).padStart(2, '0'),
      },
      {
        caption: 'em oficina ou revisão',
        icon: 'maintenance',
        title: 'Manutenção',
        value: String(fleetVehicles.filter((item) => item.status === 'Manutenção').length).padStart(2, '0'),
      },
      {
        caption: 'com restrição documental',
        icon: 'alert',
        title: 'Bloqueados',
        value: String(fleetVehicles.filter((item) => item.status === 'Bloqueado').length).padStart(2, '0'),
      },
    ],
    [],
  );

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="plus"
        actionLabel="Cadastrar veículo"
        actionTo="/frota/novo"
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
          onSecretariatChange={setSelectedSecretariat}
          onStatusChange={setSelectedStatus}
          search={search}
          secretariat={selectedSecretariat}
          secretariats={secretariats}
          selectedStatus={selectedStatus}
          statusTabs={statusTabs}
        />

        <div className="table-summary">
          <span>
            Mostrando {filteredVehicles.length} de {fleetVehicles.length} veículos
          </span>
          <span>Atualização documental e visualização detalhada disponíveis em cada linha.</span>
        </div>

        <VehicleTable vehicles={filteredVehicles} />
      </SectionCard>
    </div>
  );
}
