import { useCallback, useEffect, useState } from 'react';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { Modal } from '../../../components/common/Modal';
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
  const [decisionModal, setDecisionModal] = useState({
    action: null,
    motivo: '',
    open: false,
    reserva: null,
    submitting: false,
  });

  const carregarReservas = useCallback((signal) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    return listarReservas(null, { signal })
      .then((items) => setState({ loading: false, error: null, items: items || [] }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ loading: false, error: error.message || 'Falha ao carregar reservas.', items: [] });
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) carregarReservas(controller.signal);
    });
    return () => controller.abort();
  }, [carregarReservas]);

  function openDecisionModal(reserva, action) {
    setDecisionModal({
      action,
      motivo: '',
      open: true,
      reserva,
      submitting: false,
    });
  }

  function closeDecisionModal() {
    setDecisionModal((current) =>
      current.submitting
        ? current
        : {
            action: null,
            motivo: '',
            open: false,
            reserva: null,
            submitting: false,
          },
    );
  }

  function updateDecisionReason(value) {
    setDecisionModal((current) => ({ ...current, motivo: value }));
  }

  async function confirmarDecisao() {
    const { action, motivo, reserva } = decisionModal;
    if (!action || !reserva) return;
    if (action === 'reprovar' && motivo.trim().length === 0) return;

    setDecisionModal((current) => ({ ...current, submitting: true }));
    try {
      if (action === 'aprovar') {
        await aprovarReserva(reserva.idReserva, { idGestor: 2, motivo });
      } else {
        await reprovarReserva(reserva.idReserva, { idGestor: 2, motivo });
      }
      await carregarReservas();
      setDecisionModal({
        action: null,
        motivo: '',
        open: false,
        reserva: null,
        submitting: false,
      });
    } catch (error) {
      setState((current) => ({ ...current, error: error.message || 'Não foi possível decidir a reserva.' }));
      setDecisionModal((current) => ({ ...current, submitting: false }));
    }
  }

  const isRejection = decisionModal.action === 'reprovar';
  const decisionTitle = isRejection ? 'Reprovar reserva' : 'Aprovar reserva';
  const decisionSubtitle = isRejection
    ? 'Informe o motivo para registrar a reprovação na auditoria.'
    : 'Revise a solicitação antes de liberar a reserva.';
  const canConfirmDecision =
    Boolean(decisionModal.action && decisionModal.reserva) &&
    !decisionModal.submitting &&
    (!isRejection || decisionModal.motivo.trim().length > 0);

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="plus"
        actionLabel="Nova reserva"
        actionTo="/solicitante/reservas"
        subtitle="Aprovação, reprovação e acompanhamento do ciclo das reservas."
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
                    <dt>Início</dt>
                    <dd>{formatDateTime(reserva.dataHoraInicioPrevista)}</dd>
                  </div>
                  <div>
                    <dt>Fim previsto</dt>
                    <dd>{formatDateTime(reserva.dataHoraFimEstimada)}</dd>
                  </div>
                </dl>

                {reserva.statusReserva === 'SOLICITADA' ? (
                  <div className="driver-checklist-actions">
                    <ActionButton icon="check" onClick={() => openDecisionModal(reserva, 'aprovar')}>
                      Aprovar
                    </ActionButton>
                    <ActionButton icon="close" onClick={() => openDecisionModal(reserva, 'reprovar')} variant="secondary">
                      Reprovar
                    </ActionButton>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      <Modal
        footer={
          <>
            <ActionButton disabled={decisionModal.submitting} onClick={closeDecisionModal} variant="secondary">
              Cancelar
            </ActionButton>
            <ActionButton
              disabled={!canConfirmDecision}
              icon={isRejection ? 'close' : 'check'}
              onClick={confirmarDecisao}
              variant={isRejection ? 'danger' : 'primary'}
            >
              {decisionModal.submitting
                ? 'Salvando...'
                : isRejection
                  ? 'Confirmar reprovação'
                  : 'Confirmar aprovação'}
            </ActionButton>
          </>
        }
        onClose={closeDecisionModal}
        open={decisionModal.open}
        size="md"
        subtitle={decisionSubtitle}
        title={decisionTitle}
      >
        {decisionModal.reserva ? (
          <div className="reservation-decision-modal">
            <dl className="admin-modal-list">
              <div>
                <dt>Reserva</dt>
                <dd>#{decisionModal.reserva.idReserva}</dd>
              </div>
              <div>
                <dt>Solicitante</dt>
                <dd>{decisionModal.reserva.nomeSolicitante}</dd>
              </div>
              <div>
                <dt>Destino</dt>
                <dd>{decisionModal.reserva.destino}</dd>
              </div>
              <div>
                <dt>Início</dt>
                <dd>{formatDateTime(decisionModal.reserva.dataHoraInicioPrevista)}</dd>
              </div>
            </dl>

            <label className="admin-form-field admin-form-field--full">
              <span className="admin-form-field__label">
                {isRejection ? 'Motivo da reprovação' : 'Observação da aprovação'}
                {isRejection ? <span className="admin-form-field__req">*</span> : null}
              </span>
              <textarea
                className="admin-form-field__textarea"
                maxLength={240}
                onChange={(event) => updateDecisionReason(event.target.value)}
                placeholder={
                  isRejection
                    ? 'Ex.: veículo indisponível no horário solicitado.'
                    : 'Observação opcional para auditoria.'
                }
                required={isRejection}
                rows={4}
                value={decisionModal.motivo}
              />
              <span className="reservation-decision-modal__hint">
                {decisionModal.motivo.length}/240 caracteres
              </span>
            </label>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
