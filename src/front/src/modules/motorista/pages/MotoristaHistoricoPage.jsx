import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { getCurrentMotoristaId, setCurrentMotoristaId } from '../../../services/currentMotorista';
import { listarHistoricoMotorista } from '../../../services/motoristaApi';

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatKm(value) {
  if (value == null) return '-';
  return `${Number(value).toLocaleString('pt-BR')} km`;
}

function formatRoute(registro) {
  if (!registro.origem && !registro.destino) return 'Reserva sem rota informada';
  if (!registro.origem) return registro.destino;
  if (!registro.destino) return registro.origem;
  return `${registro.origem} -> ${registro.destino}`;
}

export function MotoristaHistoricoPage() {
  const params = useParams();
  const motoristaId = Number(params.motoristaId || getCurrentMotoristaId());
  const [state, setState] = useState({ loading: true, error: null, items: [] });

  useEffect(() => {
    setCurrentMotoristaId(motoristaId);
  }, [motoristaId]);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      setState((current) => ({ ...current, loading: true, error: null }));

      listarHistoricoMotorista(motoristaId, { signal: controller.signal })
        .then((items) => setState({ loading: false, error: null, items: items || [] }))
        .catch((error) => {
          if (error.name === 'AbortError') return;
          setState({
            loading: false,
            error: error.message || 'Não foi possível carregar o histórico.',
            items: [],
          });
        });
    });

    return () => controller.abort();
  }, [motoristaId]);

  const stats = useMemo(() => {
    const finalizadas = state.items.filter((item) => item.dataRetorno).length;
    const abertas = state.items.length - finalizadas;
    const kmTotal = state.items.reduce((total, item) => {
      if (item.quilometragemRetorno == null || item.quilometragemSaida == null) return total;
      return total + Math.max(0, item.quilometragemRetorno - item.quilometragemSaida);
    }, 0);

    return [
      { caption: 'Registros de uso', icon: 'reports', title: 'Total', value: String(state.items.length).padStart(2, '0') },
      { caption: 'Com retorno registrado', icon: 'check', title: 'Concluídas', value: String(finalizadas).padStart(2, '0') },
      { caption: 'Ainda em uso', icon: 'fleet', title: 'Abertas', value: String(abertas).padStart(2, '0') },
      { caption: 'Quilometragem percorrida', icon: 'dashboard', title: 'KM', value: Math.round(kmTotal).toLocaleString('pt-BR') },
    ];
  }, [state.items]);

  return (
    <div className="page-stack motorista-page">
      <PageHeader
        eyebrow="Histórico do motorista"
        subtitle="Registros de uso, quilometragem informada e situação de cada trajeto."
        title={`Histórico #${motoristaId}`}
      />

      <section className="stats-grid stats-grid--compact">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <SectionCard title="Registros de uso">
        {state.loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Carregando histórico...</p>
          </div>
        ) : state.error ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Falha ao carregar histórico</strong>
              <p>{state.error}</p>
            </div>
          </div>
        ) : state.items.length === 0 ? (
          <div className="admin-empty">
            <Icon name="reports" />
            <p>Nenhum registro de uso encontrado para este motorista.</p>
          </div>
        ) : (
          <div className="driver-reservation-list">
            {state.items.map((registro) => (
              <article className="driver-reservation-card" key={registro.id}>
                <div className="driver-reservation-card__main">
                  <div>
                    <span className="driver-reservation-card__kicker">Registro #{registro.id}</span>
                    <h2>{registro.destino || registro.placaVeiculo}</h2>
                    <p>
                      Reserva #{registro.idReserva || '-'} · {registro.placaVeiculo}
                      {registro.modeloVeiculo ? ` - ${registro.modeloVeiculo}` : ''}
                    </p>
                  </div>
                  <StatusBadge label={registro.dataRetorno ? 'Concluída' : 'Em uso'} />
                </div>

                <dl className="driver-reservation-card__meta">
                  <div>
                    <dt>Trajeto</dt>
                    <dd>{formatRoute(registro)}</dd>
                  </div>
                  <div>
                    <dt>Saída</dt>
                    <dd>{formatDateTime(registro.dataSaida)}</dd>
                  </div>
                  <div>
                    <dt>KM saída</dt>
                    <dd>{formatKm(registro.quilometragemSaida)}</dd>
                  </div>
                  <div>
                    <dt>Retorno</dt>
                    <dd>{formatDateTime(registro.dataRetorno)}</dd>
                  </div>
                  <div>
                    <dt>KM retorno</dt>
                    <dd>{formatKm(registro.quilometragemRetorno)}</dd>
                  </div>
                </dl>

                {registro.observacoesVeiculo ? <p>{registro.observacoesVeiculo}</p> : null}
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
