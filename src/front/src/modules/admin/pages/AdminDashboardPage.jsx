import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { permissionGroups } from '../../../data/adminData';
import { listarUsuarios } from '../../../services/usuarioApi';

export function AdminDashboardPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let active = true;
    listarUsuarios()
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch(() => {
        if (active) setUsers([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const adminStats = useMemo(
    () => [
      { caption: 'Usuarios cadastrados', icon: 'users', title: 'Contas', value: String(users.length).padStart(2, '0') },
      {
        caption: 'Motoristas cadastrados',
        icon: 'alert',
        title: 'Motoristas',
        value: String(users.filter((user) => user.role === 'Motorista').length).padStart(2, '0'),
      },
      {
        caption: 'Perfis de acesso ativos',
        icon: 'shield',
        title: 'Perfis',
        value: String(new Set(users.map((user) => user.role)).size).padStart(2, '0'),
      },
      { caption: 'Fonte PostgreSQL', icon: 'reports', title: 'Banco', value: 'ON' },
    ],
    [users],
  );

  const adminAlerts = useMemo(
    () => [
      { id: 'users', status: 'Ativo', text: `${users.length} usuarios carregados do banco de dados.` },
      {
        id: 'drivers',
        status: 'Ativo',
        text: `${users.filter((user) => user.role === 'Motorista').length} motoristas disponiveis para vinculo com veiculos.`,
      },
    ],
    [users],
  );

  const roleCounts = useMemo(
    () =>
      permissionGroups.map((group) => ({
        ...group,
        users: users.filter((user) => user.role === group.name).length,
      })),
    [users],
  );

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
            {roleCounts.map((group) => (
              <Link className="quick-link quick-link--with-meta flex flex-col gap-1" key={group.name} to="/admin/perfis">
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
