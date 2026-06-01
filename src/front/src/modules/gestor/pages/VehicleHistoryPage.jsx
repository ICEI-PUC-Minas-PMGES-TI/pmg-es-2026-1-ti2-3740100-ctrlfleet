import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { listarRegistrosPorVeiculo } from '../../../services/registroUsoApi';
import { buscarVeiculo } from '../../../services/veiculoApi';
import { mapBackendVehicleToView } from '../../../services/veiculoMappers';
import { formatDateTime, formatKm } from '../../../utils/registroUsoFormatters';

export function VehicleHistoryPage() {
  const { vehicleId } = useParams();
  const [state, setState] = useState({ loading: true, error: null, vehicle: null, registros: [] });

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      buscarVeiculo(vehicleId, { signal: controller.signal }),
      listarRegistrosPorVeiculo(vehicleId),
    ])
      .then(([veiculo, registros]) => {
        setState({
          loading: false,
          error: null,
          vehicle: mapBackendVehicleToView(veiculo),
          registros,
        });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setState({ loading: false, error: error.message, vehicle: null, registros: [] });
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
    const mediaKm = state.registros.length > 0 ? totalKm / state.registros.length : 0;
    return { totalKm, ultimaUtilizacao, mediaKm };
  }, [state.registros]);

  if (state.loading) {
    return (
      <div className="page-stack">
        <PageHeader subtitle="Carregando histórico operacional." title="Histórico do veículo" />
      </div>
    );
  }

  if (state.error || !state.vehicle) {
    return (
      <div className="page-stack">
        <PageHeader subtitle={state.error || 'Não encontramos o veículo solicitado.'} title="Histórico indisponível" />
        <ActionButton to="/gestor/frota" variant="secondary">
          Voltar para a frota
        </ActionButton>
      </div>
    );
  }

  return (
    <div className="page-stack vehicle-history-page">
      <PageHeader
        actionIcon="fleet"
        actionLabel="Voltar ao veículo"
        actionTo={`/gestor/frota/${vehicleId}`}
        subtitle="Uso, quilometragem e retornos registrados para este veículo."
        title={`Histórico de ${state.vehicle.model}`}
      />

      <div className="detail-hero vehicle-history-hero">
        <div>
          <span className="plate-chip">{state.vehicle.plate}</span>
          <h2>{state.vehicle.model}</h2>
          <p>{state.vehicle.marca} · {state.vehicle.year} · {state.vehicle.secretaria}</p>
        </div>
        <StatusBadge label={state.vehicle.status} />
      </div>

      <div className="history-metrics">
        <article className="history-metric-card">
          <span className="history-metric-card__icon"><Icon name="history" /></span>
          <div>
            <p>Registros concluídos</p>
            <strong>{String(state.registros.length)}</strong>
          </div>
        </article>
        <article className="history-metric-card">
          <span className="history-metric-card__icon"><Icon name="dashboard" /></span>
          <div>
            <p>Quilometragem registrada</p>
            <strong>{formatKm(resumo.totalKm)}</strong>
          </div>
        </article>
        <article className="history-metric-card">
          <span className="history-metric-card__icon"><Icon name="calendar" /></span>
          <div>
            <p>Última movimentação</p>
            <strong>{formatDateTime(resumo.ultimaUtilizacao)}</strong>
          </div>
        </article>
        <article className="history-metric-card">
          <span className="history-metric-card__icon"><Icon name="fleet" /></span>
          <div>
            <p>Média por uso</p>
            <strong>{formatKm(resumo.mediaKm)}</strong>
          </div>
        </article>
      </div>

      <SectionCard subtitle="Eventos mais recentes aparecem primeiro." title="Timeline operacional">
        {state.registros.length === 0 ? (
          <div className="registro-uso-vazio">
            <p>Nenhum uso finalizado para este veículo.</p>
          </div>
        ) : (
          <ol className="operational-timeline">
            {state.registros.map((registro) => (
              <li className="operational-timeline__item" key={registro.id}>
                <span className="operational-timeline__dot" />
                <div className="operational-timeline__body">
                  <div className="operational-timeline__head">
                    <strong>{registro.nomeMotorista || 'Motorista não informado'}</strong>
                    <span>{formatKm(registro.quilometragemPercorrida || 0)}</span>
                  </div>
                  <div className="operational-timeline__chips">
                    <span>{registro.idReserva ? `Reserva #${registro.idReserva}` : 'Sem reserva vinculada'}</span>
                    <span>{formatDateTime(registro.dataSaida)}</span>
                  </div>
                  <p>
                    Saída em {formatDateTime(registro.dataSaida)} · retorno em {formatDateTime(registro.dataRetorno)}
                  </p>
                  <small>
                    KM {formatKm(registro.quilometragemSaida)} → {formatKm(registro.quilometragemRetorno)}
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
