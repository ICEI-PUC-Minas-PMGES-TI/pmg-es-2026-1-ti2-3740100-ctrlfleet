import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { ChecklistTipoCard } from '../../../components/motorista/ChecklistTipoCard';
import { obterStatusChecklistRetorno } from '../../../services/motoristaApi';

export function ChecklistRetornoPage() {
  const { reservaId } = useParams();
  const location = useLocation();
  const motoristaId = getCurrentMotoristaId();
  const reserva = location.state?.reserva;

  const [status, setStatus] = useState({ loading: true, error: null, data: null });
  const basePath = `/motorista/${motoristaId}/reservas/${reservaId}`;

  const loadStatus = useCallback(async () => {
    if (!motoristaId || !reservaId) return;
    setStatus({ loading: true, error: null });
    try {
      const data = await obterStatusChecklistRetorno(reservaId, motoristaId);
      setStatus({ loading: false, error: null, data });
    } catch (error) {
      setStatus({ loading: false, error: error.message, data: null });
    }
  }, [motoristaId, reservaId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus, location.key]);

  const tipos = status.data?.tipos || [];
  const checklistCompleto = Boolean(status.data?.checklistCompleto);

  return (
    <div className="page-stack motorista-page">
      <PageHeader
        eyebrow="Checklist de retorno"
        subtitle="Preencha cada tipo antes de encerrar a corrida."
        title="Tipos de checklist de retorno"
      />

      <Link className="motorista-viagem-detail__back" state={{ reserva }} to={basePath}>
        <Icon name="fleet" />
        <span>Voltar ao detalhe</span>
      </Link>

      {status.loading ? (
        <div className="admin-dashboard__loading">
          <span aria-hidden="true" className="admin-dashboard__spinner" />
        </div>
      ) : status.error ? (
        <div className="admin-dashboard__error">
          <p>{status.error}</p>
        </div>
      ) : (
        <>
          <SectionCard title="Tipos de inspeção">
            <div className="checklist-tipo-grid">
              {tipos.map((tipo) => (
                <ChecklistTipoCard
                  key={tipo.idTipoInspecao}
                  reserva={reserva}
                  showDescription={false}
                  tipo={tipo}
                  to={`${basePath}/checklist-retorno/tipos/${tipo.idTipoInspecao}`}
                />
              ))}
            </div>
          </SectionCard>

          {checklistCompleto ? (
            <div className="motorista-viagem-card__alert motorista-viagem-card__alert--ok">
              <Icon name="check" />
              <span>Checklists de retorno completos. Informe a quilometragem na tela de encerramento.</span>
            </div>
          ) : null}

          <div className="driver-checklist-actions">
            <Link className="action-button action-button--secondary" state={{ reserva }} to={basePath}>
              Voltar
            </Link>
            {checklistCompleto ? (
              <Link
                className="action-button action-button--primary"
                state={{ reserva }}
                to={`${basePath}/checklist-retorno/encerrar`}
              >
                Encerrar corrida
              </Link>
            ) : (
              <ActionButton disabled icon="check">
                Conclua todos os tipos
              </ActionButton>
            )}
          </div>
        </>
      )}
    </div>
  );
}
