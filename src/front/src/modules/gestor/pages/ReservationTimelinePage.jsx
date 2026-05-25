import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { listarRegistrosPorReserva } from '../../../services/registroUsoApi';
import { listarReservas } from '../../../services/reservaApi';
import { formatDateTime, formatKm } from '../../../utils/registroUsoFormatters';

export function ReservationTimelinePage() {
  const { reservaId } = useParams();
  const [state, setState] = useState({ loading: true, error: null, registros: [], reserva: null });

  useEffect(() => {
    let ignore = false;

    listarReservas()
      .then(async (reservas) => {
        if (ignore) return;
        const reserva =
          (reservas || []).find((item) => String(item.idReserva) === String(reservaId)) || null;
        const registros = await listarRegistrosPorReserva(reservaId, reserva);
        if (ignore) return;
        setState({ loading: false, error: null, registros, reserva });
      })
      .catch((error) => {
        if (ignore) return;
        setState({
          loading: false,
          error: error.message || 'Não foi possível carregar a reserva.',
          registros: [],
          reserva: null,
        });
      });

    return () => {
      ignore = true;
    };
  }, [reservaId]);

  const registroPrincipal = state.registros[0] || null;
  const totalKm = useMemo(
    () => state.registros.reduce((total, registro) => total + Number(registro.quilometragemPercorrida || 0), 0),
    [state.registros],
  );

  if (state.loading) {
    return (
      <div className="page-stack">
        <PageHeader subtitle={`Carregando reserva #${reservaId}.`} title="Timeline da reserva" />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="reservations"
        actionLabel="Buscar outra reserva"
        actionTo="/gestor/reservas"
        subtitle="Linha do tempo criada a partir do encerramento de uso."
        title={`Reserva #${reservaId}`}
      />

      {state.error ? (
        <div className="flash-banner flash-banner--error">{state.error}</div>
      ) : null}

      {!state.error && state.registros.length === 0 ? (
        <SectionCard subtitle="Nenhum encerramento foi vinculado a esta reserva." title="Sem histórico">
          <ActionButton to="/gestor/reservas" variant="secondary">
            Voltar para reservas
          </ActionButton>
        </SectionCard>
      ) : null}

      {registroPrincipal ? (
        <>
          <div className="detail-hero">
            <div>
              <span className="plate-chip">{registroPrincipal.placaVeiculo}</span>
              <h2>{registroPrincipal.nomeMotorista || 'Motorista não informado'}</h2>
              <p>
                {formatDateTime(registroPrincipal.dataSaida)} até {formatDateTime(registroPrincipal.dataRetorno)}
              </p>
            </div>
            <StatusBadge label={registroPrincipal.statusReserva === 'CONCLUIDA' ? 'Concluída' : 'Registrada'} />
          </div>

          <div className="history-metrics">
            <SectionCard subtitle="Registros de uso" title={String(state.registros.length)} />
            <SectionCard subtitle="KM percorridos" title={formatKm(totalKm)} />
            <SectionCard subtitle="Retorno em" title={formatDateTime(registroPrincipal.dataRetorno)} />
          </div>

          <SectionCard subtitle="Da saída ao retorno finalizado." title="Detalhes do uso">
            <ol className="operational-timeline">
              {state.registros.map((registro, index) => (
                <li className="operational-timeline__item" key={registro.idUso ?? index}>
                  <span className="operational-timeline__dot" />
                  <div className="operational-timeline__body">
                    <div className="operational-timeline__head">
                      <strong>{registro.placaVeiculo || 'Veículo'}</strong>
                      <span>{registro.statusReserva === 'CONCLUIDA' ? 'Concluída' : 'Registrada'}</span>
                    </div>
                    <p>
                      {registro.nomeMotorista || 'Motorista'} · {formatKm(registro.quilometragemPercorrida || 0)}{' '}
                      percorridos
                    </p>
                    <small>
                      Saída: {formatDateTime(registro.dataSaida)} · Retorno:{' '}
                      {formatDateTime(registro.dataRetorno)}
                    </small>
                    <small>
                      KM {formatKm(registro.quilometragemSaida)} → {formatKm(registro.quilometragemRetorno)}
                    </small>
                    {registro.observacoesVeiculo ? <em>{registro.observacoesVeiculo}</em> : null}
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
