import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { Modal } from '../../../components/common/Modal';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { getAuthSession } from '../../../services/authSession';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { iniciarTrajeto } from '../../../services/motoristaApi';
import { useMotoristaViagemNumber } from '../../../hooks/useMotoristaViagemNumbers';
import {
  DEFAULT_FLEET_SIMULATION_MS,
  FLEET_SIMULATION_DURATION_OPTIONS,
  writeSimulationDurationMs,
} from '../../../utils/fleetActiveTripsStorage';
import {
  canStartTrip,
  formatDateTime,
  formatKm,
  getChecklistWindowMessage,
} from '../../../utils/motoristaReservaUtils';
import { formatViagemLabel } from '../../../utils/userReservaNumbers';

export function MotoristaIniciarCorridaPage() {
  const { reservaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const motoristaId = getCurrentMotoristaId();
  const reserva = location.state?.reserva;
  const viagemNumber = useMotoristaViagemNumber(motoristaId, reserva?.idReserva ?? reservaId);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ loading: false, error: null });
  const [simulationDurationMs, setSimulationDurationMs] = useState(DEFAULT_FLEET_SIMULATION_MS);

  const session = getAuthSession();

  const canStart = canStartTrip(reserva);
  const windowMessage = getChecklistWindowMessage(reserva);
  const checklistDone = Boolean(reserva?.checklistSaidaConcluido);

  async function confirmStartTrip() {
    setSubmitState({ loading: true, error: null });
    try {
      await iniciarTrajeto(reservaId, { idMotorista: motoristaId });
      writeSimulationDurationMs(reservaId, simulationDurationMs);
      setConfirmOpen(false);
      const updatedReserva = { ...reserva, statusReserva: 'EM_USO', checklistSaidaConcluido: true };
      navigate(`/motorista/${motoristaId}/reservas/${reservaId}/corrida`, {
        replace: true,
        state: {
          reserva: updatedReserva,
          tripStartedAt: Date.now(),
          simulationDurationMs,
        },
      });
    } catch (error) {
      setSubmitState({
        loading: false,
        error: error.message || 'Não foi possível iniciar a corrida.',
      });
      setConfirmOpen(false);
    }
  }

  if (!reserva) {
    return (
      <div className="page-stack">
        <PageHeader
          actions={
            <Link className="action-button action-button--secondary" to={`/motorista/${motoristaId}`}>
              Voltar
            </Link>
          }
          subtitle="Abra esta página a partir da reserva."
          title="Iniciar corrida"
        />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Após checklist registrado"
        subtitle="Confirme a saída do veículo para marcar a reserva como em uso."
        title="Iniciar corrida"
      />

      <SectionCard title={formatViagemLabel(viagemNumber)}>
        <div className="driver-trip-summary">
          <div>
            <strong>{reserva.placaVeiculo}</strong>
            <span>{reserva.destino}</span>
          </div>
          <div>
            <strong>KM no checklist</strong>
            <span>{formatKm(reserva.quilometragemSaidaTrajeto)}</span>
          </div>
          <div>
            <strong>Saída prevista</strong>
            <span>{formatDateTime(reserva.dataHoraInicioPrevista)}</span>
          </div>
        </div>

        {!checklistDone ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Checklist pendente</strong>
              <p>Registre o checklist de saída antes de iniciar a corrida.</p>
            </div>
            <Link
              className="action-button action-button--secondary"
              state={{ reserva }}
              to={`/motorista/${motoristaId}/reservas/${reservaId}/checklist-saida`}
            >
              Ir para checklist
            </Link>
          </div>
        ) : null}

        {windowMessage ? (
          <p className="driver-reserva-detail-v2__hint">
            <Icon name="alert" />
            <span>{windowMessage}</span>
          </p>
        ) : null}

        <div className="trip-simulation-duration">
          <div className="trip-simulation-duration__head">
            <strong>Tempo da simulação no mapa</strong>
            <span>Escolha a duração para visualizar o deslocamento no mapa da frota.</span>
          </div>
          <div aria-label="Duração da simulação" className="trip-simulation-duration__menu" role="group">
            {FLEET_SIMULATION_DURATION_OPTIONS.map((option) => (
              <button
                aria-pressed={simulationDurationMs === option.ms}
                className={`trip-simulation-duration__option${
                  simulationDurationMs === option.ms ? ' is-active' : ''
                }`}
                key={option.id}
                onClick={() => setSimulationDurationMs(option.ms)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {submitState.error ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Não foi possível iniciar</strong>
              <p>{submitState.error}</p>
            </div>
          </div>
        ) : null}

        <div className="driver-checklist-actions">
          <Link
            className="action-button action-button--secondary"
            to={`/motorista/${motoristaId}/reservas/${reservaId}`}
            state={{ reserva }}
          >
            Voltar ao detalhe
          </Link>
          <ActionButton
            disabled={!checklistDone || !canStart || submitState.loading}
            icon="fleet"
            onClick={() => setConfirmOpen(true)}
          >
            Iniciar corrida agora
          </ActionButton>
        </div>
      </SectionCard>

      <Modal
        footer={
          <>
            <ActionButton disabled={submitState.loading} onClick={() => setConfirmOpen(false)} variant="secondary">
              Cancelar
            </ActionButton>
            <ActionButton disabled={submitState.loading} icon="fleet" onClick={confirmStartTrip}>
              {submitState.loading ? 'Iniciando...' : 'Confirmar saída'}
            </ActionButton>
          </>
        }
        onClose={() => {
          if (!submitState.loading) setConfirmOpen(false);
        }}
        open={confirmOpen}
        subtitle="O veículo e a reserva passarão para o status em uso. A simulação no mapa da frota usará a duração selecionada."
        title="Confirmar início da corrida"
      >
        <p className="admin-modal-detail">
          Checklist de saída já registrado. Confirme apenas se o motorista está saindo com o veículo agora.
        </p>
        <p className="trip-simulation-duration__modal-note">
          Simulação configurada para{' '}
          <strong>
            {FLEET_SIMULATION_DURATION_OPTIONS.find((option) => option.ms === simulationDurationMs)?.label ||
              '1 min'}
          </strong>
          {session?.nome ? ` · motorista ${session.nome}` : ''}.
        </p>
      </Modal>
    </div>
  );
}
