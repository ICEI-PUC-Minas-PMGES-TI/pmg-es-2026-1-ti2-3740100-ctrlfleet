import { useEffect, useMemo, useState } from 'react';
import { UserFilters } from '../../../components/admin/UserFilters';
import { UserTable } from '../../../components/admin/UserTable';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { userRoleOptions, userStatusTabs } from '../../../data/adminData';
import { listarUsuarios } from '../../../services/usuarioApi';
import { mapBackendUserToView, pad2 } from '../../../services/usuarioMappers';

function filterByStatus(user, status) {
  return status === 'Todos' || user.status === status;
}

function filterByRole(user, role) {
  return role === 'Perfil (Todos)' || user.role === role;
}

export function AdminUsersPage() {
  const [nameSearch, setNameSearch] = useState('');
  const [matriculaSearch, setMatriculaSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('Perfil (Todos)');
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  const [usersData, setUsersData] = useState({
    loading: true,
    error: null,
    items: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    setUsersData((current) => ({ ...current, loading: true, error: null }));
    listarUsuarios({ signal: controller.signal })
      .then((items) => {
        setUsersData({
          loading: false,
          error: null,
          items: items.map(mapBackendUserToView),
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setUsersData({
          loading: false,
          error: error.message || 'Falha ao carregar usuários.',
          items: [],
        });
      });

    return () => controller.abort();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedName = nameSearch.trim().toLowerCase();
    const normalizedMatricula = matriculaSearch.trim().toLowerCase();

    return usersData.items.filter((user) => {
      const matchesName =
        normalizedName.length === 0 || user.name.toLowerCase().includes(normalizedName);
      const matchesMatricula =
        normalizedMatricula.length === 0 ||
        (user.matricula || '').toLowerCase().includes(normalizedMatricula);

      return (
        matchesName &&
        matchesMatricula &&
        filterByStatus(user, selectedStatus) &&
        filterByRole(user, selectedRole)
      );
    });
  }, [matriculaSearch, nameSearch, selectedRole, selectedStatus, usersData.items]);

  const summaryCards = useMemo(() => {
    const items = usersData.items;
    const count = (predicate) => items.filter(predicate).length;
    return [
      {
        caption: 'Total cadastradas',
        icon: 'users',
        title: 'Contas',
        value: pad2(items.length),
      },
      {
        caption: 'Com acesso liberado',
        icon: 'check',
        title: 'Ativos',
        value: pad2(count((user) => user.status === 'Ativo')),
      },
      {
        caption: 'Aguardando aprovação',
        icon: 'alert',
        title: 'Pendentes',
        value: pad2(count((user) => user.status === 'Pendente')),
      },
      {
        caption: 'Com restrição de acesso',
        icon: 'shield',
        title: 'Bloqueados',
        value: pad2(count((user) => user.status === 'Bloqueado')),
      },
    ];
  }, [usersData.items]);

  return (
    <div className="page-stack admin-dashboard">
      <PageHeader
        actionIcon="plus"
        actionLabel="Novo usuario"
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
          matriculaSearch={matriculaSearch}
          nameSearch={nameSearch}
          onMatriculaSearchChange={setMatriculaSearch}
          onNameSearchChange={setNameSearch}
          onRoleChange={setSelectedRole}
          onStatusChange={setSelectedStatus}
          role={selectedRole}
          roleOptions={userRoleOptions}
          selectedStatus={selectedStatus}
          statusTabs={userStatusTabs}
        />

        {usersData.loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Carregando usuários...</p>
          </div>
        ) : usersData.error ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Falha ao carregar usuários</strong>
              <p>{usersData.error}</p>
            </div>
          </div>
        ) : usersData.items.length === 0 ? (
          <div className="admin-empty">
            <Icon name="users" />
            <p>Nenhum usuário cadastrado ainda.</p>
          </div>
        ) : (
          <>
            <div className="table-summary">
              <span>
                Mostrando {filteredUsers.length} de {usersData.items.length} usuários
              </span>
              <span>Permissões, status e dados cadastrais disponíveis em cada linha.</span>
            </div>

            <UserTable users={filteredUsers} />
          </>
        )}
      </SectionCard>
    </div>
  );
}
