import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { finalizarTrajeto } from '../../../services/motoristaApi';

function formatKm(value) {
  if (value == null) return '—';
  return `${Number(value).toLocaleString('pt-BR')} km`;
}

export function ChecklistRetornoFinalizarPage() {
  const { reservaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const motoristaId = getCurrentMotoristaId();
  const reserva = location.state?.reserva;
  const kmSaida = reserva?.quilometragemSaidaTrajeto;

  const [quilometragemRetorno, setQuilometragemRetorno] = useState('');
  const [observacoesVeiculo, setObservacoesVeiculo] = useState('');
  const [submitState, setSubmitState] = useState({ loading: false, error: null });
  const hubPath = `/motorista/${motoristaId}/reservas/${reservaId}/checklist-retorno`;

  const kmNum = Number(String(quilometragemRetorno).replace(',', '.'));
  const canSubmit =
    Number.isFinite(kmNum) &&
    kmNum >= 0 &&
    (kmSaida == null || kmNum >= Number(kmSaida)) &&
    !submitState.loading;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitState({ loading: true, error: null });
    try {
      await finalizarTrajeto(reservaId, {
        idMotorista: motoristaId,
        quilometragemRetorno: kmNum,
        observacoesVeiculo: observacoesVeiculo.trim() || undefined,
        itensChecklist: [],
      });
      navigate(`/motorista/${motoristaId}`, {
        replace: true,
        state: { flashMessage: 'Trajeto finalizado com sucesso.' },
      });
    } catch (error) {
      setSubmitState({ loading: false, error: error.message });
    }
  }

  return (
    <div className="page-stack motorista-page">
      <PageHeader title="Encerrar corrida" subtitle="Informe a quilometragem de retorno." />
      <Link className="motorista-viagem-detail__back" state={{ reserva }} to={hubPath}>
        <Icon name="fleet" />
        <span>Voltar aos tipos de checklist</span>
      </Link>
      <SectionCard>
        <form className="driver-checklist-form" onSubmit={handleSubmit}>
          <div className="driver-trip-summary">
            <div>
              <strong>KM na saída</strong>
              <span>{formatKm(kmSaida)}</span>
            </div>
          </div>
          <label className="driver-mileage-field">
            <span>Quilometragem de retorno</span>
            <input
              onChange={(e) => setQuilometragemRetorno(e.target.value)}
              required
              type="number"
              min="0"
              step="0.1"
              value={quilometragemRetorno}
            />
          </label>
          <label className="admin-form-field admin-form-field--full">
            <span className="admin-form-field__label">Observações do veículo</span>
            <textarea
              className="admin-form-field__textarea"
              onChange={(e) => setObservacoesVeiculo(e.target.value)}
              rows={3}
              value={observacoesVeiculo}
            />
          </label>
          {submitState.error ? (
            <div className="admin-dashboard__error">
              <p>{submitState.error}</p>
            </div>
          ) : null}
          <div className="driver-checklist-actions">
            <Link className="action-button action-button--secondary" to={hubPath} state={{ reserva }}>
              Voltar
            </Link>
            <ActionButton disabled={!canSubmit} icon="check" type="submit">
              {submitState.loading ? 'Finalizando...' : 'Encerrar corrida'}
            </ActionButton>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
