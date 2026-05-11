import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { listarVeiculos } from '../../../services/veiculoApi';
import { mapBackendVehicleToView, pad2 } from '../../../services/veiculoMappers';

/**
 * Deriva os alertas exibidos no dashboard a partir da lista de veículos
 * carregada do backend. Bloqueados aparecem primeiro (impacto maior na
 * disponibilidade), seguidos pelos em manutenção. Limita a 4 itens para
 * não dominar a coluna lateral.
 */
function buildAlertsFromVehicles(vehicles) {
  const blocked = vehicles
    .filter((v) => v.status === 'Bloqueado')
    .map((v) => ({
      id: `alert-bloq-${v.id}`,
      status: 'Bloqueado',
      text: `${v.plate} está indisponível para uso.`,
    }));

  const maintenance = vehicles
    .filter((v) => v.status === 'Manutenção')
    .map((v) => ({
      id: `alert-manu-${v.id}`,
      status: 'Manutenção',
      text: `${v.plate} (${v.model}) segue em oficina.`,
    }));

  return [...blocked, ...maintenance].slice(0, 4);
}

export function FleetDashboardPage() {
  const [vehiclesData, setVehiclesData] = useState({
    loading: true,
    error: null,
    items: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    setVehiclesData((current) => ({ ...current, loading: true, error: null }));
    listarVeiculos({ signal: controller.signal })
      .then((items) => {
        setVehiclesData({
          loading: false,
          error: null,
          items: items.map(mapBackendVehicleToView),
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setVehiclesData({
          loading: false,
          error: error.message || 'Falha ao carregar veículos.',
          items: [],
        });
      });

    return () => controller.abort();
  }, []);

  const stats = useMemo(() => {
    const items = vehiclesData.items;
    const count = (predicate) => items.filter(predicate).length;
    return [
      {
        caption: 'prontos para uso',
        icon: 'fleet',
        title: 'Disponíveis',
        value: pad2(count((v) => v.status === 'Ativo')),
      },
      {
        caption: 'precisam de atenção',
        icon: 'alert',
        title: 'Bloqueados',
        value: pad2(count((v) => v.status === 'Bloqueado')),
      },
      {
        caption: 'em oficina ou revisão',
        icon: 'maintenance',
        title: 'Manutenções',
        value: pad2(count((v) => v.status === 'Manutenção')),
      },
      {
        caption: 'cadastros monitorados',
        icon: 'reports',
        title: 'Total',
        value: pad2(items.length),
      },
    ];
  }, [vehiclesData.items]);

  const alerts = useMemo(() => buildAlertsFromVehicles(vehiclesData.items), [vehiclesData.items]);

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="plus"
        actionLabel="Cadastrar veículo"
        actionTo="/gestor/frota/novo"
        subtitle="Acompanhe a saúde da operação e avance rápido para os fluxos principais."
        title="Dashboard"
      />

      {vehiclesData.error ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <div>
            <strong>Falha ao carregar dados da frota</strong>
            <p>{vehiclesData.error}</p>
          </div>
        </div>
      ) : null}

      <section className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="content-grid">
        <SectionCard subtitle="Itens com impacto direto na disponibilidade." title="Alertas recentes">
          {vehiclesData.loading ? (
            <div className="admin-dashboard__loading">
              <span className="admin-dashboard__spinner" aria-hidden="true" />
              <p>Carregando alertas...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="admin-empty">
              <Icon name="check" />
              <p>Nenhum alerta no momento — frota 100% operacional.</p>
            </div>
          ) : (
            <div className="alert-list">
              {alerts.map((alert) => (
                <article className="alert-item" key={alert.id}>
                  <div>
                    <StatusBadge label={alert.status} />
                    <p>{alert.text}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard subtitle="Atalhos para seguir operando." title="Ações rápidas">
          <div className="quick-links">
            <Link className="quick-link" to="/gestor/frota">
              <strong>Consultar frota</strong>
              <span>Ver status, documentos e detalhes dos veículos.</span>
            </Link>
            <Link className="quick-link" to="/gestor/frota/novo">
              <strong>Novo cadastro</strong>
              <span>Preencher dados do veículo e documentação em uma única tela.</span>
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
