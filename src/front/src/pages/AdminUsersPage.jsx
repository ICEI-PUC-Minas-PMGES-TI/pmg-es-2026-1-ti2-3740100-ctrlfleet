import { useMemo, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StatCard } from '../components/common/StatCard';
import { UserFilters } from '../components/admin/UserFilters';
import { UserTable } from '../components/admin/UserTable';
import { adminUsers, userRoleOptions, userStatusTabs } from '../data/adminData';

function filterByStatus(user, status) {
  return status === 'Todos' || user.status === status;
}

function filterByRole(user, role) {
  return role === 'Perfil (Todos)' || user.role === role;
}

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('Perfil (Todos)');
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return adminUsers.filter((user) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.secretariat.toLowerCase().includes(normalizedSearch);

      return matchesSearch && filterByStatus(user, selectedStatus) && filterByRole(user, selectedRole);
    });
  }, [search, selectedRole, selectedStatus]);

  const summaryCards = useMemo(
    () => [
      {
        caption: 'Total cadastradas',
        icon: 'users',
        title: 'Contas',
        value: String(adminUsers.length).padStart(2, '0'),
      },
      {
        caption: 'Com acesso liberado',
        icon: 'check',
        title: 'Ativos',
        value: String(adminUsers.filter((user) => user.status === 'Ativo').length).padStart(2, '0'),
      },
      {
        caption: 'Aguardando aprovação',
        icon: 'alert',
        title: 'Pendentes',
        value: String(adminUsers.filter((user) => user.status === 'Pendente').length).padStart(2, '0'),
      },
      {
        caption: 'Com restrição de acesso',
        icon: 'shield',
        title: 'Bloqueados',
        value: String(adminUsers.filter((user) => user.status === 'Bloqueado').length).padStart(2, '0'),
      },
    ],
    [],
  );

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="plus"
        actionLabel="Novo usuário"
        actionTo="/admin/usuarios/novo"
        subtitle="Crie, edite, bloqueie e acompanhe usuários por perfil de acesso."
        title="Usuários"
      />

      <section className="stats-grid">
        {summaryCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <SectionCard>
        <UserFilters
          onRoleChange={setSelectedRole}
          onSearchChange={setSearch}
          onStatusChange={setSelectedStatus}
          role={selectedRole}
          roleOptions={userRoleOptions}
          search={search}
          selectedStatus={selectedStatus}
          statusTabs={userStatusTabs}
        />

        <div className="table-summary">
          <span>
            Mostrando {filteredUsers.length} de {adminUsers.length} usuários
          </span>
          <span>Permissões, status e dados cadastrais disponíveis em cada linha.</span>
        </div>

        <UserTable users={filteredUsers} />
      </SectionCard>
    </div>
  );
}
