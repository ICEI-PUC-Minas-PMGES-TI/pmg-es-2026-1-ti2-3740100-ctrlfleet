import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { adminAlerts, adminStats, permissionGroups } from '../../../data/adminData';

export function AdminDashboardPage() {
  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="plus"
        actionLabel="Novo usuario"
        actionTo="/admin/usuarios/novo"
        subtitle="Controle acessos, permissoes e atividades do sistema."
        title="Dashboard administrativo"
      />

      <section className="stats-grid">
        {adminStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="content-grid">
        <SectionCard subtitle="Itens que precisam de validacao administrativa." title="Alertas recentes">
          <div className="alert-list">
            {adminAlerts.map((alert) => (
              <article className="alert-item" key={alert.id}>
                <StatusBadge label={alert.status} />
                <p>{alert.text}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard subtitle="Permissoes em uso no CtrlFleet." title="Perfis ativos">
          <div className="quick-links">
            {permissionGroups.map((group) => (
              <Link
                className="quick-link quick-link--with-meta flex flex-col gap-1"
                key={group.name}
                to="/admin/perfis"
              >
                <strong>{group.name}</strong>
                <span className="text-sm text-gray-500">{group.description}</span>
                <small className="text-xs text-gray-400">{group.users} usuarios</small>
              </Link>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
