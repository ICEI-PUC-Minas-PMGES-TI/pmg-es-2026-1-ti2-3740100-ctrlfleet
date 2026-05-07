import { useEffect, useMemo, useState } from 'react';
import { UserFilters } from '../../../components/admin/UserFilters';
import { UserTable } from '../../../components/admin/UserTable';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { adminSecretariats, userRoleOptions, userStatusTabs } from '../../../data/adminData';
import { listarUsuarios } from '../../../services/usuarioApi';

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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [cpfSearch, setCpfSearch] = useState('');
  const [selectedSecretariat, setSelectedSecretariat] = useState('Secretaria (Todas)');
  const [selectedRole, setSelectedRole] = useState('Perfil (Todos)');
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        const data = await listarUsuarios();
        if (active) {
          setUsers(data);
          setLoadError('');
        }
      } catch (err) {
        if (active) setLoadError(err instanceof Error ? err.message : 'Erro ao carregar usuarios.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedNameSearch = nameSearch.trim().toLowerCase();
    const cpfSearchDigits = onlyDigits(cpfSearch);

    return users.filter((user) => {
      const matchesName = normalizedNameSearch.length === 0 || user.name.toLowerCase().includes(normalizedNameSearch);
      const matchesCpf = cpfSearchDigits.length === 0 || onlyDigits(user.cpf).includes(cpfSearchDigits);
      const matchesSecretariat = selectedSecretariat === 'Secretaria (Todas)' || user.secretariat === selectedSecretariat;

      return matchesName && matchesCpf && matchesSecretariat && filterByStatus(user, selectedStatus) && filterByRole(user, selectedRole);
    });
  }, [cpfSearch, nameSearch, selectedRole, selectedSecretariat, selectedStatus, users]);

  const summaryCards = useMemo(
    () => [
      { caption: 'Total cadastradas', icon: 'users', title: 'Contas', value: String(users.length).padStart(2, '0') },
      {
        caption: 'Com acesso liberado',
        icon: 'check',
        title: 'Ativos',
        value: String(users.filter((user) => user.status === 'Ativo').length).padStart(2, '0'),
      },
      {
        caption: 'Aguardando aprovacao',
        icon: 'alert',
        title: 'Pendentes',
        value: String(users.filter((user) => user.status === 'Pendente').length).padStart(2, '0'),
      },
      {
        caption: 'Com restricao de acesso',
        icon: 'shield',
        title: 'Bloqueados',
        value: String(users.filter((user) => user.status === 'Bloqueado').length).padStart(2, '0'),
      },
    ],
    [users],
  );

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="plus"
        actionLabel="Novo usuario"
        actionTo="/admin/usuarios/novo"
        subtitle="Crie, edite, bloqueie e acompanhe usuarios por perfil de acesso."
        title="Usuarios"
      />

      <section className="stats-grid">
        {summaryCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>
      {loadError ? <div className="flash-banner">{loadError}</div> : null}

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
          <span>{loading ? 'Carregando usuarios...' : `Mostrando ${filteredUsers.length} de ${users.length} usuarios`}</span>
          <span>Permissoes, status e dados cadastrais disponiveis em cada linha.</span>
        </div>

        <UserTable users={filteredUsers} />
      </SectionCard>
    </div>
  );
}
