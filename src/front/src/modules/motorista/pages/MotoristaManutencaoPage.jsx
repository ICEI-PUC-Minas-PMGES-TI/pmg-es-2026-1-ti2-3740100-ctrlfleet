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
import { mapPainelManutencaoToView } from '../../../utils/manutencaoMappers';
import { pad2 } from '../../../services/veiculoMappers';

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
          error: error.message || 'Falha ao carregar manutenções.',
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
        caption: 'Revisões chegando',
        icon: 'preventive',
        title: 'Preventivas',
        value: pad2(data.preventivasProximas.length + data.alertasPreventivos.length),
        variant: 'maintenance',
      },
      {
        caption: 'Aguardando análise da frota',
        icon: 'alert',
        title: 'Solicitações',
        value: pad2(data.solicitacoes.length),
        variant: 'blocked',
      },
      {
        caption: 'Veículos em oficina',
        icon: 'maintenance',
        title: 'Em andamento',
        value: pad2(data.emAndamento.length),
        variant: 'inactive',
      },
      {
        caption: 'Registros recentes',
        icon: 'reports',
        title: 'Histórico',
        value: pad2(data.historico.length),
        variant: 'total',
      },
    ];
  }, [painel.data]);

  if (!motoristaId) {
    return (
      <div className="page-stack motorista-page">
        <p className="motorista-dashboard__invalid">Sessão inválida para o perfil de motorista.</p>
      </div>
    );
  }

  return (
    <div className="page-stack motorista-page motorista-maintenance-page">
      <PageHeader
        subtitle="Acompanhe preventivas próximas, solicitações enviadas e manutenções em andamento."
        title="Manutenções"
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
          <p>Carregando manutenções...</p>
        </div>
      ) : painel.error ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <div>
            <strong>Falha ao carregar manutenções</strong>
            <p>{painel.error}</p>
          </div>
        </div>
      ) : (
        <>
          <section aria-label="Resumo de manutenções" className="stats-grid stats-grid--fleet">
            {summaryCards.map((stat) => (
              <StatCard key={stat.title} layout="vertical" {...stat} />
            ))}
          </section>

          <PreventiveMaintenanceList items={painel.data.preventivasProximas} />
          <PreventiveAlertList items={painel.data.alertasPreventivos} />

          <MaintenanceRequestList
            emptyMessage="Nenhuma solicitação pendente no momento."
            items={painel.data.solicitacoes}
            title="Solicitações pendentes"
            variant="pending"
          />

          <MaintenanceRequestList
            emptyMessage="Nenhum veículo em manutenção no momento."
            items={painel.data.emAndamento}
            title="Manutenções em andamento"
            variant="active"
          />

          <MaintenanceRequestList
            emptyMessage="Ainda não há histórico de manutenções para sua frota."
            items={painel.data.historico}
            title="Histórico recente"
            variant="history"
          />
        </>
      )}
    </div>
  );
}
