import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { Modal } from '../../../components/common/Modal';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { iniciarTrajeto } from '../../../services/motoristaApi';
import {
  canOpenChecklistSaida,
  formatDateTime,
  formatKm,
  getChecklistWindowMessage,
} from '../../../utils/motoristaReservaUtils';

export function MotoristaIniciarCorridaPage() {
  const { reservaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const motoristaId = getCurrentMotoristaId();
  const reserva = location.state?.reserva;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ loading: false, error: null });

  const canStart = canOpenChecklistSaida(reserva);
  const windowMessage = getChecklistWindowMessage(reserva);
  const checklistDone = Boolean(reserva?.checklistSaidaConcluido);

  async function confirmStartTrip() {
    setSubmitState({ loading: true, error: null });
    try {
      await iniciarTrajeto(reservaId, { idMotorista: motoristaId });
      setConfirmOpen(false);
      navigate(`/motorista/${motoristaId}`, {
        replace: true,
        state: { flashMessage: 'Corrida iniciada com sucesso.' },
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

      <SectionCard title={`Reserva #${reserva.idReserva}`}>
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
        subtitle="O veículo e a reserva passarão para o status em uso."
        title="Confirmar início da corrida"
      >
        <p className="admin-modal-detail">
          Checklist de saída já registrado. Confirme apenas se o motorista está saindo com o veículo agora.
        </p>
      </Modal>
    </div>
  );
}
