import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { permissionGroups } from '../../../data/adminData';

const roleStats = [
  { caption: 'Perfis configurados', icon: 'shield', title: 'Perfis', value: '04' },
  { caption: 'Modulos protegidos', icon: 'dashboard', title: 'Modulos', value: '06' },
  { caption: 'Usuarios vinculados', icon: 'users', title: 'Vinculos', value: '128' },
  { caption: 'Revisoes neste mes', icon: 'reports', title: 'Revisoes', value: '09' },
];

export function AdminRolesPage() {
  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="plus"
        actionLabel="Novo usuario"
        actionTo="/admin/usuarios/novo"
        subtitle="Defina quais perfis acessam cada area operacional do CtrlFleet."
        title="Perfis e permissoes"
      />

      <section className="stats-grid">
        {roleStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <SectionCard subtitle="Matriz de acesso por tipo de usuario." title="Perfis cadastrados">
        <div className="role-grid">
          {permissionGroups.map((group) => (
            <article className="role-card" key={group.name}>
              <div>
                <StatusBadge label="Ativo" />
                <h3>{group.name}</h3>
                <p>{group.description}</p>
              </div>
              <dl>
                <div>
                  <dt>Modulos</dt>
                  <dd>{group.modules}</dd>
                </div>
                <div>
                  <dt>Usuarios</dt>
                  <dd>{group.users}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
