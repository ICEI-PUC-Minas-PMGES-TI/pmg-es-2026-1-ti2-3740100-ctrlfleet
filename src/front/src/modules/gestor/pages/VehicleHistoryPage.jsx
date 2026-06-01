import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { listarRegistrosPorVeiculo } from '../../../services/registroUsoApi';
import { buscarVeiculo, listarManutencoesPorVeiculo } from '../../../services/veiculoApi';
import { mapBackendVehicleToView } from '../../../services/veiculoMappers';
import { mapManutencaoToView, resolveManutencaoStatusVariant } from '../../../utils/manutencaoMappers';
import { formatDateTime, formatKm } from '../../../utils/registroUsoFormatters';

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  }).format(Number(value || 0));
}

export function VehicleHistoryPage() {
  const { vehicleId } = useParams();
  const [state, setState] = useState({
    loading: true,
    error: null,
    vehicle: null,
    registros: [],
    manutencoes: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      buscarVeiculo(vehicleId, { signal: controller.signal }),
      listarRegistrosPorVeiculo(vehicleId),
      listarManutencoesPorVeiculo(vehicleId, { signal: controller.signal }),
    ])
      .then(([veiculo, registros, manutencoes]) => {
        setState({
          loading: false,
          error: null,
          vehicle: mapBackendVehicleToView(veiculo),
          registros,
          manutencoes: (manutencoes || []).map(mapManutencaoToView),
        });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setState({
            loading: false,
            error: error.message,
            vehicle: null,
            registros: [],
            manutencoes: [],
          });
        }
      });

    return () => controller.abort();
  }, [vehicleId]);

  const resumo = useMemo(() => {
    const totalKm = state.registros.reduce(
      (total, registro) => total + Number(registro.quilometragemPercorrida || 0),
      0,
    );
    const ultimaUtilizacao = state.registros[0]?.dataRetorno || state.registros[0]?.dataSaida || null;
    const manutencoesAtivas = state.manutencoes.filter((item) => item.status === 'EM_ANDAMENTO').length;
    const custoTotal = state.manutencoes.reduce((total, item) => total + Number(item.custoTotal || 0), 0);
    return { custoTotal, manutencoesAtivas, totalKm, ultimaUtilizacao };
  }, [state.manutencoes, state.registros]);

  if (state.loading) {
    return (
      <div className="page-stack">
        <PageHeader subtitle="Carregando historico operacional." title="Historico do veiculo" />
      </div>
    );
  }

  if (state.error || !state.vehicle) {
    return (
      <div className="page-stack">
        <PageHeader subtitle={state.error || 'Nao encontramos o veiculo solicitado.'} title="Historico indisponivel" />
        <ActionButton to="/gestor/frota" variant="secondary">
          Voltar para a frota
        </ActionButton>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="fleet"
        actionLabel="Voltar ao veiculo"
        actionTo={`/gestor/frota/${vehicleId}`}
        subtitle="Uso, manutencoes, quilometragem e retornos registrados para este veiculo."
        title={`Historico de ${state.vehicle.model}`}
      />

      <div className="detail-hero">
        <div>
          <span className="plate-chip">{state.vehicle.plate}</span>
          <h2>{state.vehicle.model}</h2>
          <p>{state.vehicle.marca} - {state.vehicle.year}</p>
        </div>
        <StatusBadge label={state.vehicle.status} />
      </div>

      <div className="history-metrics">
        <SectionCard subtitle="Registros concluidos" title={String(state.registros.length)} />
        <SectionCard subtitle="Quilometragem registrada" title={formatKm(resumo.totalKm)} />
        <SectionCard subtitle="Manutencoes no prontuario" title={String(state.manutencoes.length)} />
        <SectionCard subtitle="Custo acumulado" title={formatCurrency(resumo.custoTotal)} />
      </div>

      <SectionCard
        subtitle={`${resumo.manutencoesAtivas} em andamento, ${state.manutencoes.filter((item) => item.status === 'CONCLUIDA').length} concluidas.`}
        title="Historico de manutencoes"
      >
        {state.manutencoes.length === 0 ? (
          <div className="registro-uso-vazio">
            <p>Nenhuma manutencao registrada para este veiculo.</p>
          </div>
        ) : (
          <ol className="maintenance-history-list">
            {state.manutencoes.map((manutencao) => (
              <li
                className={`maintenance-history-item maintenance-history-item--${resolveManutencaoStatusVariant(manutencao.status)}`}
                key={manutencao.id}
              >
                <div className="maintenance-history-item__head">
                  <div>
                    <span className="maintenance-history-item__type">{manutencao.tipoLabel}</span>
                    <strong>{manutencao.descricao || 'Manutencao sem descricao'}</strong>
                  </div>
                  <StatusBadge label={manutencao.statusLabel} />
                </div>
                <dl className="maintenance-history-item__meta">
                  <div>
                    <dt>Data</dt>
                    <dd>{manutencao.dataReferenciaLabel}</dd>
                  </div>
                  <div>
                    <dt>Quilometragem</dt>
                    <dd>{manutencao.quilometragemRegistroLabel}</dd>
                  </div>
                  <div>
                    <dt>Oficina</dt>
                    <dd>{manutencao.oficinaExecutorLabel}</dd>
                  </div>
                  <div>
                    <dt>Custo</dt>
                    <dd>{manutencao.custoTotalLabel}</dd>
                  </div>
                </dl>
                {manutencao.servicosRealizados ? <p>{manutencao.servicosRealizados}</p> : null}
              </li>
            ))}
          </ol>
        )}
      </SectionCard>

      <SectionCard subtitle="Eventos mais recentes aparecem primeiro." title="Timeline operacional">
        {state.registros.length === 0 ? (
          <div className="registro-uso-vazio">
            <p>Nenhum uso finalizado para este veiculo.</p>
          </div>
        ) : (
          <ol className="operational-timeline">
            {state.registros.map((registro) => (
              <li className="operational-timeline__item" key={registro.id}>
                <span className="operational-timeline__dot" />
                <div className="operational-timeline__body">
                  <div className="operational-timeline__head">
                    <strong>{registro.nomeMotorista || 'Motorista nao informado'}</strong>
                    <span>{formatKm(registro.quilometragemPercorrida || 0)}</span>
                  </div>
                  <p>
                    Saida em {formatDateTime(registro.dataSaida)} - retorno em {formatDateTime(registro.dataRetorno)}
                  </p>
                  <small>
                    KM {formatKm(registro.quilometragemSaida)} - {formatKm(registro.quilometragemRetorno)}
                    {registro.idReserva ? ` - reserva #${registro.idReserva}` : ''}
                  </small>
                  {registro.observacoesVeiculo ? <em>{registro.observacoesVeiculo}</em> : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </SectionCard>
    </div>
  );
}
