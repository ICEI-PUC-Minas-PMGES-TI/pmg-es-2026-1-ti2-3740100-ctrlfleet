import { ActionButton } from '../common/ActionButton';
import { Modal } from '../common/Modal';

function formatKm(value) {
  if (value == null) return '—';
  return `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
}

export function TripSummaryModal({ open, onClose, summary, onContinue }) {
  if (!summary) return null;

  return (
    <Modal
      footer={
        <>
          <ActionButton onClick={onClose} variant="secondary">
            Fechar
          </ActionButton>
          {onContinue ? (
            <ActionButton onClick={onContinue}>
              Preencher checklist de retorno
            </ActionButton>
          ) : null}
        </>
      }
      onClose={onClose}
      open={open}
      size="md"
      subtitle="Resumo da corrida simulada"
      title="Corrida finalizada"
    >
      <dl className="trip-summary-modal">
        <div className="trip-summary-modal__route">
          <dt>Rota</dt>
          <dd>
            <span className="trip-summary-modal__point trip-summary-modal__point--a">A</span>
            {summary.origem}
            <span className="trip-summary-modal__arrow">→</span>
            <span className="trip-summary-modal__point trip-summary-modal__point--b">B</span>
            {summary.destino}
          </dd>
        </div>
        <div>
          <dt>Veículo</dt>
          <dd>
            {summary.veiculo} · {summary.placa}
          </dd>
        </div>
        <div>
          <dt>Distância (rota)</dt>
          <dd>{formatKm(summary.distanceKm)}</dd>
          <small>A quilometragem de retorno será calculada automaticamente ao concluir o checklist.</small>
        </div>
        <div className="trip-summary-modal__times">
          <div>
            <dt>Tempo estimado</dt>
            <dd>{summary.tempoEstimadoLabel}</dd>
            {summary.osrmLabel ? <small>{summary.osrmLabel}</small> : null}
            {summary.plannedWindowLabel ? <small>{summary.plannedWindowLabel}</small> : null}
          </div>
          <div>
            <dt>Tempo real (simulação)</dt>
            <dd>{summary.tempoRealLabel}</dd>
          </div>
          <div>
            <dt>Comparativo</dt>
            <dd className="trip-summary-modal__delta">{summary.deltaLabel}</dd>
          </div>
        </div>
      </dl>
    </Modal>
  );
}
