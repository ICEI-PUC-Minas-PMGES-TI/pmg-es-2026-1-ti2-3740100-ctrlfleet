import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { dashboardAlerts, dashboardStats } from '../../../data/fleetData';

export function FleetDashboardPage() {
  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="plus"
        actionLabel="Cadastrar veículo"
        actionTo="/gestor/frota/novo"
        subtitle="Acompanhe a saúde da operação e avance rápido para os fluxos principais."
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
            {dashboardAlerts.map((alert) => (
              <article className="alert-item" key={alert.id}>
                <div>
                  <StatusBadge label={alert.status} />
                  <p>{alert.text}</p>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard subtitle="Atalhos para seguir operando." title="Ações rápidas">
          <div className="quick-links">
            <Link className="quick-link" to="/gestor/frota">
              <strong>Consultar frota</strong>
              <span>Ver status, documentos e detalhes dos veículos.</span>
            </Link>
            <Link className="quick-link" to="/gestor/frota/novo">
              <strong>Novo cadastro</strong>
              <span>Iniciar o fluxo de cadastro em duas etapas.</span>
            </Link>
            <Link className="quick-link" to="/gestor/programacao-preventiva">
              <strong>Agenda preventiva</strong>
              <span>Preparar o próximo módulo de manutenção.</span>
            </Link>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
