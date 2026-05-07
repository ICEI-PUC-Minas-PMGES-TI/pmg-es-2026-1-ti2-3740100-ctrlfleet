import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FleetFilters } from '../../../components/gestor/FleetFilters';
import { VehicleTable } from '../../../components/gestor/VehicleTable';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { secretariats, statusTabs } from '../../../data/fleetData';
import { listarVeiculos } from '../../../services/veiculoApi';

function filterByStatus(vehicle, status) {
  if (status === 'Todos') return true;
  if (status === 'Manutencao' || status === 'Manutenção') return vehicle.status === 'Manutencao';
  return vehicle.status === status;
}

function filterBySecretariat(vehicle, secretariat) {
  return secretariat === 'Secretaria (Todas)' || vehicle.secretariat === secretariat;
}

export function FleetPage() {
  const location = useLocation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedSecretariat, setSelectedSecretariat] = useState('Secretaria (Todas)');

  useEffect(() => {
    let active = true;

    async function loadVehicles() {
      try {
        const data = await listarVeiculos();
        if (active) {
          setVehicles(data);
          setLoadError('');
        }
      } catch (err) {
        if (active) setLoadError(err instanceof Error ? err.message : 'Erro ao carregar veiculos.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadVehicles();
    return () => {
      active = false;
    };
  }, []);

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        vehicle.plate.toLowerCase().includes(normalizedSearch) ||
        vehicle.model.toLowerCase().includes(normalizedSearch);

      return matchesSearch && filterByStatus(vehicle, selectedStatus) && filterBySecretariat(vehicle, selectedSecretariat);
    });
  }, [search, selectedSecretariat, selectedStatus, vehicles]);

  const summaryCards = useMemo(
    () => [
      { caption: 'cadastros monitorados', icon: 'fleet', title: 'Total', value: String(vehicles.length).padStart(2, '0') },
      {
        caption: 'prontos para uso',
        icon: 'check',
        title: 'Ativos',
        value: String(vehicles.filter((item) => item.status === 'Ativo').length).padStart(2, '0'),
      },
      {
        caption: 'em oficina ou revisao',
        icon: 'maintenance',
        title: 'Manutencao',
        value: String(vehicles.filter((item) => item.status === 'Manutencao').length).padStart(2, '0'),
      },
      {
        caption: 'com restricao documental',
        icon: 'alert',
        title: 'Bloqueados',
        value: String(vehicles.filter((item) => item.status === 'Bloqueado').length).padStart(2, '0'),
      },
    ],
    [vehicles],
  );

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="plus"
        actionLabel="Cadastrar veiculo"
        actionTo="/gestor/frota/novo"
        subtitle="Gerenciamento de veiculos cadastrados"
        title="Frota"
      />

      {location.state?.flashMessage ? <div className="flash-banner">{location.state.flashMessage}</div> : null}
      {loadError ? <div className="flash-banner">{loadError}</div> : null}

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
          <span>{loading ? 'Carregando veiculos...' : `Mostrando ${filteredVehicles.length} de ${vehicles.length} veiculos`}</span>
          <span>Atualizacao documental e visualizacao detalhada disponiveis em cada linha.</span>
        </div>

        <VehicleTable vehicles={filteredVehicles} />
      </SectionCard>
    </div>
  );
}
