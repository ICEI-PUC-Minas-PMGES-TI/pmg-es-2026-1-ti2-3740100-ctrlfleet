import { useMemo, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StatCard } from '../components/common/StatCard';
import { UserFilters } from '../components/admin/UserFilters';
import { UserTable } from '../components/admin/UserTable';
import { adminSecretariats, adminUsers, userRoleOptions, userStatusTabs } from '../data/adminData';

function filterByStatus(user, status) {
  return status === 'Todos' || user.status === status;
}

function filterByRole(user, role) {
  return role === 'Perfil (Todos)' || user.role === role;
}

function onlyDigits(value) {
  return value.replace(/\D/g, '');
}

export function AdminUsersPage() {
  const [nameSearch, setNameSearch] = useState('');
  const [cpfSearch, setCpfSearch] = useState('');
  const [selectedSecretariat, setSelectedSecretariat] = useState('Secretaria (Todas)');
  const [selectedRole, setSelectedRole] = useState('Perfil (Todos)');
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  const filteredUsers = useMemo(() => {
    const normalizedNameSearch = nameSearch.trim().toLowerCase();
    const cpfSearchDigits = onlyDigits(cpfSearch);

    return adminUsers.filter((user) => {
      const matchesName =
        normalizedNameSearch.length === 0 || user.name.toLowerCase().includes(normalizedNameSearch);
      const matchesCpf = cpfSearchDigits.length === 0 || onlyDigits(user.cpf).includes(cpfSearchDigits);
      const matchesSecretariat =
        selectedSecretariat === 'Secretaria (Todas)' || user.secretariat === selectedSecretariat;

      return (
        matchesName &&
        matchesCpf &&
        matchesSecretariat &&
        filterByStatus(user, selectedStatus) &&
        filterByRole(user, selectedRole)
      );
    });
  }, [cpfSearch, nameSearch, selectedRole, selectedSecretariat, selectedStatus]);

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
          cpfSearch={cpfSearch}
          nameSearch={nameSearch}
          onCpfSearchChange={setCpfSearch}
          onNameSearchChange={setNameSearch}
          onRoleChange={setSelectedRole}
          onSecretariatChange={setSelectedSecretariat}
          onStatusChange={setSelectedStatus}
          role={selectedRole}
          roleOptions={userRoleOptions}
          secretariat={selectedSecretariat}
          secretariats={['Secretaria (Todas)', ...adminSecretariats]}
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
