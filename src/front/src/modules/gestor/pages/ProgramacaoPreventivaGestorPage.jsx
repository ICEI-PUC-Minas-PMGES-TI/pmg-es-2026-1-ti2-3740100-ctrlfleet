import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import {
  InProgressMaintenanceSection,
  PreventiveAlertsSection,
  PreventiveGestorUpcomingSection,
  ScheduledPreventiveSection,
  StoppedVehiclesSection,
} from '../../../components/gestor/PreventiveGestorPanels';
import { getAuthSession } from '../../../services/authSession';
import {
  concluirManutencao,
  iniciarManutencao,
  listarPainelPreventivaGestor,
} from '../../../services/gestorManutencaoApi';
import { pad2 } from '../../../services/veiculoMappers';
import { mapPainelPreventivaGestorToView } from '../../../utils/manutencaoMappers';

function getGestorId() {
  const session = getAuthSession();
  return session?.id ?? 2;
}

export function ProgramacaoPreventivaGestorPage() {
  const [state, setState] = useState({ loading: true, error: null, painel: null });
  const [submittingId, setSubmittingId] = useState(null);

  const carregarPainel = useCallback((signal) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    return listarPainelPreventivaGestor({ signal })
      .then((painel) =>
        setState({
          loading: false,
          error: null,
          painel: mapPainelPreventivaGestorToView(painel),
        }),
      )
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({
          loading: false,
          error: error.message || 'Falha ao carregar programação preventiva.',
          painel: null,
        });
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) carregarPainel(controller.signal);
    });
    return () => controller.abort();
  }, [carregarPainel]);

  const resumo = state.painel?.resumo;

  const summaryCards = useMemo(() => {
    if (!resumo) return [];
    return [
      {
        caption: 'Dentro da janela de 45 dias',
        icon: 'preventive',
        title: 'Próximas',
        value: pad2(resumo.preventivasProximas),
        variant: 'maintenance',
      },
      {
        caption: 'Data ou km já ultrapassados',
        icon: 'alert',
        title: 'Atrasadas',
        value: pad2(resumo.preventivasAtrasadas),
        variant: 'blocked',
      },
      {
        caption: 'Programação total da frota',
        icon: 'history',
        title: 'Agendadas',
        value: pad2(resumo.preventivasAgendadas),
        variant: 'inactive',
      },
      {
        caption: 'Indisponíveis para operação',
        icon: 'fleet',
        title: 'Parados',
        value: pad2(resumo.veiculosParados),
        variant: 'total',
      },
      {
        caption: 'Serviços já iniciados',
        icon: 'maintenance',
        title: 'Em andamento',
        value: pad2(resumo.emAndamento),
        variant: 'warning',
      },
      {
        caption: 'Avisos automáticos pendentes',
        icon: 'alert',
        title: 'Alertas',
        value: pad2(resumo.alertasPreventivos),
        variant: 'maintenance',
      },
    ];
  }, [resumo]);

  async function handleIniciar(item) {
    setSubmittingId(item.id);
    setState((current) => ({ ...current, error: null }));
    try {
      await iniciarManutencao(item.id, { idGestor: getGestorId() });
      await carregarPainel();
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error.message || 'Não foi possível iniciar a manutenção.',
      }));
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleConcluir(item) {
    setSubmittingId(item.id);
    setState((current) => ({ ...current, error: null }));
    try {
      await concluirManutencao(item.id, { idGestor: getGestorId() });
      await carregarPainel();
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error.message || 'Não foi possível concluir a manutenção.',
      }));
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="page-stack gestor-preventiva-page">
      <PageHeader
        actionIcon="maintenance"
        actionLabel="Triagem corretiva"
        actionTo="/gestor/manutencao"
        subtitle="Acompanhe prazos por data e quilometragem, veículos parados e manutenções em execução."
        title="Prog. Preventiva"
      />

      {state.loading ? (
        <SectionCard>
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Carregando programação preventiva...</p>
          </div>
        </SectionCard>
      ) : state.error && !state.painel ? (
        <SectionCard>
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Falha ao carregar preventivas</strong>
              <p>{state.error}</p>
            </div>
          </div>
        </SectionCard>
      ) : (
        <>
          <section aria-label="Resumo preventivo" className="stats-grid stats-grid--fleet stats-grid--preventiva">
            {summaryCards.map((stat) => (
              <StatCard key={stat.title} layout="vertical" {...stat} />
            ))}
          </section>

          {state.error ? (
            <div className="admin-dashboard__error admin-dashboard__error--inline">
              <p>{state.error}</p>
            </div>
          ) : null}

          <SectionCard>
            <PreventiveGestorUpcomingSection items={state.painel?.preventivasProximas || []} />
          </SectionCard>

          <SectionCard>
            <StoppedVehiclesSection items={state.painel?.veiculosParadosRevisao || []} />
          </SectionCard>

          <SectionCard>
            <InProgressMaintenanceSection
              items={state.painel?.emAndamento || []}
              onFinish={handleConcluir}
              submittingId={submittingId}
            />
          </SectionCard>

          <SectionCard>
            <ScheduledPreventiveSection
              items={state.painel?.preventivasAgendadas || []}
              onStart={handleIniciar}
              submittingId={submittingId}
            />
          </SectionCard>

          <SectionCard>
            <PreventiveAlertsSection items={state.painel?.alertasPreventivos || []} />
          </SectionCard>
        </>
      )}
    </div>
  );
}
