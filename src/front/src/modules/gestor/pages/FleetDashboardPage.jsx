import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { listarVeiculos } from '../../../services/veiculoApi';

export function FleetDashboardPage() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    let active = true;
    listarVeiculos()
      .then((data) => {
        if (active) setVehicles(data);
      })
      .catch(() => {
        if (active) setVehicles([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const dashboardStats = useMemo(
    () => [
      {
        caption: 'veiculos ativos hoje',
        icon: 'fleet',
        title: 'Disponiveis',
        value: String(vehicles.filter((item) => item.status === 'Ativo').length).padStart(2, '0'),
      },
      {
        caption: 'precisam de atencao',
        icon: 'alert',
        title: 'Alertas',
        value: String(vehicles.filter((item) => item.status === 'Bloqueado').length).padStart(2, '0'),
      },
      {
        caption: 'programadas na semana',
        icon: 'maintenance',
        title: 'Manutencoes',
        value: String(vehicles.filter((item) => item.status === 'Manutencao').length).padStart(2, '0'),
      },
      { caption: 'total persistido', icon: 'reservations', title: 'Frota', value: String(vehicles.length).padStart(2, '0') },
    ],
    [vehicles],
  );

  const dashboardAlerts = useMemo(
    () =>
      vehicles
        .filter((vehicle) => vehicle.status === 'Bloqueado' || vehicle.status === 'Manutencao')
        .slice(0, 3)
        .map((vehicle) => ({
          id: vehicle.id,
          status: vehicle.status,
          text: `${vehicle.plate} - ${vehicle.model} requer acompanhamento.`,
        })),
    [vehicles],
  );

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="plus"
        actionLabel="Cadastrar veiculo"
        actionTo="/gestor/frota/novo"
        subtitle="Acompanhe a saude da operacao e avance rapido para os fluxos principais."
        title="Dashboard"
      />

      <section className="stats-grid">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="content-grid">
        <SectionCard subtitle="Itens com impacto direto na disponibilidade." title="Alertas recentes">
          <div className="alert-list">
            {(dashboardAlerts.length > 0 ? dashboardAlerts : [{ id: 'ok', status: 'Ativo', text: 'Nenhum alerta vindo do banco.' }]).map((alert) => (
              <article className="alert-item" key={alert.id}>
                <div>
                  <StatusBadge label={alert.status} />
                  <p>{alert.text}</p>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard subtitle="Atalhos para seguir operando." title="Acoes rapidas">
          <div className="quick-links">
            <Link className="quick-link" to="/gestor/frota">
              <strong>Consultar frota</strong>
              <span>Ver status, documentos e detalhes dos veiculos.</span>
            </Link>
            <Link className="quick-link" to="/gestor/frota/novo">
              <strong>Novo cadastro</strong>
              <span>Preencher dados do veiculo e documentacao em uma unica tela.</span>
            </Link>
            <Link className="quick-link" to="/gestor/programacao-preventiva">
              <strong>Agenda preventiva</strong>
              <span>Preparar o proximo modulo de manutencao.</span>
            </Link>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
