import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatCard } from '../../../components/common/StatCard';
import {
  MaintenanceQuickActions,
  MaintenanceRequestList,
  PreventiveAlertList,
  PreventiveMaintenanceList,
} from '../../../components/motorista/MaintenancePanels';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { listarPainelManutencaoMotorista } from '../../../services/motoristaManutencaoApi';
import { pad2 } from '../../../services/veiculoMappers';
import { mapPainelManutencaoToView } from '../../../utils/manutencaoMappers';

export function MotoristaManutencaoPage() {
  const location = useLocation();
  const motoristaId = getCurrentMotoristaId();
  const flashMessage = location.state?.flashMessage;
  const [painel, setPainel] = useState({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!motoristaId) return undefined;

    const controller = new AbortController();
    setPainel((current) => ({ ...current, loading: true, error: null }));

    listarPainelManutencaoMotorista(motoristaId, { signal: controller.signal })
      .then((data) => {
        setPainel({
          loading: false,
          error: null,
          data: mapPainelManutencaoToView(data),
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setPainel({
          loading: false,
          error: error.message || 'Falha ao carregar manutencoes.',
          data: null,
        });
      });

    return () => controller.abort();
  }, [motoristaId]);

  const summaryCards = useMemo(() => {
    const data = painel.data;
    if (!data) return [];

    return [
      {
        caption: 'Revisoes chegando',
        icon: 'preventive',
        title: 'Preventivas',
        value: pad2(data.preventivasProximas.length + data.alertasPreventivos.length),
        variant: 'maintenance',
      },
      {
        caption: 'Aguardando analise da frota',
        icon: 'alert',
        title: 'Solicitacoes',
        value: pad2(data.solicitacoes.length),
        variant: 'blocked',
      },
      {
        caption: 'Veiculos em oficina',
        icon: 'maintenance',
        title: 'Em andamento',
        value: pad2(data.emAndamento.length),
        variant: 'inactive',
      },
      {
        caption: 'Registros recentes',
        icon: 'reports',
        title: 'Historico',
        value: pad2(data.historico.length),
        variant: 'total',
      },
    ];
  }, [painel.data]);

  if (!motoristaId) {
    return (
      <div className="page-stack motorista-page">
        <p className="motorista-dashboard__invalid">Sessao invalida para o perfil de motorista.</p>
      </div>
    );
  }

  const vehiclePathBase = `/motorista/${motoristaId}/veiculos`;

  return (
    <div className="page-stack motorista-page motorista-maintenance-page">
      <PageHeader
        subtitle="Acompanhe preventivas proximas, solicitacoes enviadas e manutencoes em andamento."
        title="Manutencoes"
      />

      <MaintenanceQuickActions motoristaId={motoristaId} />

      {flashMessage ? (
        <div className="admin-dashboard__flash admin-dashboard__flash--success">
          <Icon name="check" />
          <span>{flashMessage}</span>
        </div>
      ) : null}

      {painel.loading ? (
        <div className="admin-dashboard__loading">
          <span aria-hidden="true" className="admin-dashboard__spinner" />
          <p>Carregando manutencoes...</p>
        </div>
      ) : painel.error ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <div>
            <strong>Falha ao carregar manutencoes</strong>
            <p>{painel.error}</p>
          </div>
        </div>
      ) : (
        <>
          <section aria-label="Resumo de manutencoes" className="stats-grid stats-grid--fleet">
            {summaryCards.map((stat) => (
              <StatCard key={stat.title} layout="vertical" {...stat} />
            ))}
          </section>

          <PreventiveMaintenanceList items={painel.data.preventivasProximas} vehiclePathBase={vehiclePathBase} />
          <PreventiveAlertList items={painel.data.alertasPreventivos} />

          <MaintenanceRequestList
            emptyMessage="Nenhuma solicitacao pendente no momento."
            items={painel.data.solicitacoes}
            title="Solicitacoes pendentes"
            vehiclePathBase={vehiclePathBase}
            variant="pending"
          />

          <MaintenanceRequestList
            emptyMessage="Nenhum veiculo em manutencao no momento."
            items={painel.data.emAndamento}
            title="Manutencoes em andamento"
            vehiclePathBase={vehiclePathBase}
            variant="active"
          />

          <MaintenanceRequestList
            emptyMessage="Ainda nao ha historico de manutencoes para sua frota."
            items={painel.data.historico}
            title="Historico recente"
            vehiclePathBase={vehiclePathBase}
            variant="history"
          />
        </>
      )}
    </div>
  );
}
