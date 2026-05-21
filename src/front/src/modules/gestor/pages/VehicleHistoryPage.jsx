import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
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
    return { totalKm, ultimaUtilizacao };
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
    <div className="page-stack">
      <PageHeader
        actionIcon="fleet"
        actionLabel="Voltar ao veículo"
        actionTo={`/gestor/frota/${vehicleId}`}
        subtitle="Uso, quilometragem e retornos registrados para este veículo."
        title={`Histórico de ${state.vehicle.model}`}
      />

      <div className="detail-hero">
        <div>
          <span className="plate-chip">{state.vehicle.plate}</span>
          <h2>{state.vehicle.model}</h2>
          <p>{state.vehicle.marca} · {state.vehicle.year}</p>
        </div>
        <StatusBadge label={state.vehicle.status} />
      </div>

      <div className="history-metrics">
        <SectionCard subtitle="Registros concluídos" title={String(state.registros.length)} />
        <SectionCard subtitle="Quilometragem registrada" title={formatKm(resumo.totalKm)} />
        <SectionCard subtitle="Última movimentação" title={formatDateTime(resumo.ultimaUtilizacao)} />
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
                  <p>
                    Saída em {formatDateTime(registro.dataSaida)} · retorno em {formatDateTime(registro.dataRetorno)}
                  </p>
                  <small>
                    KM {formatKm(registro.quilometragemSaida)} → {formatKm(registro.quilometragemRetorno)}
                    {registro.idReserva ? ` · reserva #${registro.idReserva}` : ''}
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
