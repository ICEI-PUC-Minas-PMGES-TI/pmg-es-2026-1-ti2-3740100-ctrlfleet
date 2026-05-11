import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { permissionGroups } from '../../../data/adminData';
import { listarUsuarios } from '../../../services/usuarioApi';
import { pad2, resolvePerfil } from '../../../services/usuarioMappers';

export function AdminRolesPage() {
  const [usersData, setUsersData] = useState({
    loading: true,
    error: null,
    items: [],
  });

  useEffect(() => {
    const controller = new AbortController();
    setUsersData({ loading: true, error: null, items: [] });

    listarUsuarios({ signal: controller.signal })
      .then((items) => {
        setUsersData({ loading: false, error: null, items });
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

  const usersPerRole = useMemo(() => {
    const counts = new Map();
    for (const user of usersData.items) {
      const perfil = resolvePerfil(user);
      if (!perfil) continue;
      counts.set(perfil, (counts.get(perfil) || 0) + 1);
    }
    return counts;
  }, [usersData.items]);

  const perfis = useMemo(
    () =>
      permissionGroups.map((group) => ({
        ...group,
        users: usersPerRole.get(group.name) || 0,
      })),
    [usersPerRole],
  );

  const roleStats = useMemo(() => {
    const totalVinculos = usersData.items.length;
    const perfisAtivos = perfis.filter((group) => group.users > 0).length;
    return [
      {
        caption: 'Perfis com usuários ativos',
        icon: 'shield',
        title: 'Perfis',
        value: pad2(perfisAtivos),
      },
      {
        caption: 'Módulos protegidos',
        icon: 'dashboard',
        title: 'Módulos',
        value: '06',
      },
      {
        caption: 'Usuários vinculados',
        icon: 'users',
        title: 'Vínculos',
        value: pad2(totalVinculos),
      },
      {
        caption: 'Revisões neste mês',
        icon: 'reports',
        title: 'Revisões',
        value: '09',
      },
    ];
  }, [usersData.items.length, perfis]);

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="plus"
        actionLabel="Novo usuário"
        actionTo="/admin/usuarios/novo"
        subtitle="Defina quais perfis acessam cada área operacional do CtrlFleet."
        title="Perfis e permissões"
      />

      <section className="stats-grid">
        {roleStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <SectionCard
        subtitle={
          usersData.loading
            ? 'Carregando contagem de vínculos do banco...'
            : usersData.error
              ? 'Não foi possível carregar a contagem de vínculos.'
              : 'Matriz de acesso por tipo de usuário.'
        }
        title="Perfis cadastrados"
      >
        {usersData.loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Calculando vínculos...</p>
          </div>
        ) : usersData.error ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Falha ao carregar vínculos</strong>
              <p>{usersData.error}</p>
            </div>
          </div>
        ) : (
          <div className="role-grid">
            {perfis.map((group) => (
              <article className="role-card" key={group.name}>
                <div>
                  <StatusBadge label={group.users > 0 ? 'Ativo' : 'Inativo'} />
                  <h3>{group.name}</h3>
                  <p>{group.description}</p>
                </div>
                <dl>
                  <div>
                    <dt>Módulos</dt>
                    <dd>{group.modules}</dd>
                  </div>
                  <div>
                    <dt>Usuários</dt>
                    <dd>{group.users}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
