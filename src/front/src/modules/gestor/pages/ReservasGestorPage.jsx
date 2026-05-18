import { useEffect, useState } from 'react';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { aprovarReserva, listarReservas, reprovarReserva } from '../../../services/reservaApi';

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

export function ReservasGestorPage() {
  const [state, setState] = useState({ loading: true, error: null, items: [] });

  function carregarReservas(signal) {
    setState((current) => ({ ...current, loading: true, error: null }));
    return listarReservas(null, { signal })
      .then((items) => setState({ loading: false, error: null, items: items || [] }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ loading: false, error: error.message || 'Falha ao carregar reservas.', items: [] });
      });
  }

  useEffect(() => {
    const controller = new AbortController();
    carregarReservas(controller.signal);
    return () => controller.abort();
  }, []);

  async function decidir(reserva, action) {
    const motivo = window.prompt(action === 'aprovar' ? 'Observacao da aprovacao:' : 'Motivo da reprovacao:') || '';
    try {
      if (action === 'aprovar') {
        await aprovarReserva(reserva.idReserva, { idGestor: 2, motivo });
      } else {
        await reprovarReserva(reserva.idReserva, { idGestor: 2, motivo });
      }
      await carregarReservas();
    } catch (error) {
      setState((current) => ({ ...current, error: error.message || 'Nao foi possivel decidir a reserva.' }));
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="plus"
        actionLabel="Nova reserva"
        actionTo="/solicitante/reservas"
        subtitle="Aprovacao, reprovacao e acompanhamento do ciclo das reservas."
        title="Reservas"
      />

      <SectionCard title="Fila de reservas">
        {state.loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Carregando reservas...</p>
          </div>
        ) : state.error ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Falha nas reservas</strong>
              <p>{state.error}</p>
            </div>
          </div>
        ) : (
          <div className="driver-reservation-list">
            {state.items.map((reserva) => (
              <article className="driver-reservation-card" key={reserva.idReserva}>
                <div className="driver-reservation-card__main">
                  <div>
                    <span className="driver-reservation-card__kicker">Reserva #{reserva.idReserva}</span>
                    <h2>{reserva.destino}</h2>
                    <p>
                      {reserva.placaVeiculo} - {reserva.modeloVeiculo}
                    </p>
                  </div>
                  <StatusBadge label={reserva.statusReserva} />
                </div>

                <dl className="driver-reservation-card__meta">
                  <div>
                    <dt>Solicitante</dt>
                    <dd>{reserva.nomeSolicitante}</dd>
                  </div>
                  <div>
                    <dt>Origem</dt>
                    <dd>{reserva.origem}</dd>
                  </div>
                  <div>
                    <dt>Inicio</dt>
                    <dd>{formatDateTime(reserva.dataHoraInicioPrevista)}</dd>
                  </div>
                  <div>
                    <dt>Fim previsto</dt>
                    <dd>{formatDateTime(reserva.dataHoraFimEstimada)}</dd>
                  </div>
                </dl>

                {reserva.statusReserva === 'SOLICITADA' ? (
                  <div className="driver-checklist-actions">
                    <ActionButton icon="check" onClick={() => decidir(reserva, 'aprovar')}>
                      Aprovar
                    </ActionButton>
                    <ActionButton icon="close" onClick={() => decidir(reserva, 'reprovar')} variant="secondary">
                      Reprovar
                    </ActionButton>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
