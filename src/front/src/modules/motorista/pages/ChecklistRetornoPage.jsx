import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import {
  concluirViagemChecklistRetorno,
  obterStatusChecklistRetorno,
} from '../../../services/motoristaApi';
import { ChecklistTipoCard } from '../../../components/motorista/ChecklistTipoCard';
import { formatKm } from '../../../utils/motoristaReservaUtils';
import { loadTripSummary } from '../../../utils/tripSummaryStorage';
import { calculateReturnMileage } from '../../../utils/routeSimulationUtils';

export function ChecklistRetornoPage() {
  const { reservaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const motoristaId = getCurrentMotoristaId();
  const reserva = location.state?.reserva;
  const tripSummary = location.state?.tripSummary ?? loadTripSummary(reservaId);

  const [status, setStatus] = useState({ loading: true, error: null, data: null });
  const [observacoesVeiculo, setObservacoesVeiculo] = useState('');
  const [submitState, setSubmitState] = useState({ loading: false, error: null });

  const basePath = `/motorista/${motoristaId}/reservas/${reservaId}`;
  const historicoPath = `${basePath}/historico`;
  const corridaPath = `${basePath}/corrida`;
  const pageState = { reserva, tripSummary };

  const loadStatus = useCallback(async () => {
    if (!motoristaId || !reservaId) return;
    setStatus((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await obterStatusChecklistRetorno(reservaId, motoristaId);
      setStatus({ loading: false, error: null, data });
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || 'Não foi possível carregar os tipos de checklist.',
        data: null,
      });
    }
  }, [motoristaId, reservaId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus, location.key]);

  const tipos = status.data?.tipos || [];
  const preenchimentoCompleto = Boolean(status.data?.preenchimentoCompleto);
  const kmSaida = status.data?.quilometragemSaida;
  const kmRetornoRegistrada = status.data?.quilometragemRetorno;
  const kmRetornoEstimada =
    kmRetornoRegistrada != null && kmRetornoRegistrada > 0
      ? kmRetornoRegistrada
      : calculateReturnMileage(kmSaida, tripSummary?.distanceKm);

  async function concluirViagem() {
    if (!preenchimentoCompleto) return;
    setSubmitState({ loading: true, error: null });
    try {
      await concluirViagemChecklistRetorno(reservaId, {
        idMotorista: motoristaId,
        distanciaPercorridaKm: tripSummary?.distanceKm ?? 0,
        observacoesVeiculo: observacoesVeiculo.trim() || undefined,
      });
      navigate(historicoPath, {
        replace: true,
        state: {
          reserva: reserva ? { ...reserva, statusReserva: 'CONCLUIDA' } : null,
          tripSummary,
          flashMessage: 'Viagem encerrada com sucesso.',
        },
      });
    } catch (error) {
      setSubmitState({
        loading: false,
        error: error.message || 'Não foi possível encerrar a viagem.',
      });
    }
  }

  return (
    <div className="page-stack motorista-page">
      <PageHeader
        eyebrow="Checklist de retorno"
        subtitle="Preencha todos os tipos de inspeção. Ao concluir, a viagem será encerrada e o histórico será exibido."
        title="Checklist de retorno"
      />

      <Link className="motorista-viagem-detail__back" state={pageState} to={basePath}>
        <Icon name="fleet" />
        <span>Voltar ao detalhe da viagem</span>
      </Link>

      {!tripSummary ? (
        <div className="motorista-viagem-card__alert">
          <Icon name="alert" />
          <span>
            Finalize a corrida no mapa antes de preencher o checklist de retorno.
          </span>
          <Link className="action-button action-button--secondary" state={{ reserva }} to={corridaPath}>
            Ir para a corrida
          </Link>
        </div>
      ) : null}

      {status.loading ? (
        <div className="admin-dashboard__loading">
          <span aria-hidden="true" className="admin-dashboard__spinner" />
          <p>Carregando tipos de checklist...</p>
        </div>
      ) : status.error ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <p>{status.error}</p>
        </div>
      ) : (
        <>
          <SectionCard title="Quilometragem (automática)">
            <div className="checklist-km-panel">
              <div className="checklist-km-panel__vehicle">
                <div>
                  <span className="checklist-km-panel__label">Saída (checklist de início)</span>
                </div>
                <strong className="checklist-km-panel__value">{formatKm(kmSaida)}</strong>
              </div>
              <div className="checklist-km-panel__vehicle">
                <div>
                  <span className="checklist-km-panel__label">Retorno estimado</span>
                  <p className="checklist-km-panel__hint">
                    Saída + {formatKm(tripSummary?.distanceKm ?? 0)} percorridos na rota
                  </p>
                </div>
                <strong className="checklist-km-panel__value">{formatKm(kmRetornoEstimada)}</strong>
              </div>
              <p className="checklist-km-panel__saved">
                <Icon name="check" />
                <span>O hodômetro será atualizado automaticamente ao concluir o checklist.</span>
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Escolha o tipo para preencher">
            {tipos.length === 0 ? (
              <div className="admin-dashboard__error">
                <Icon name="alert" />
                <p>Nenhum tipo de checklist de retorno disponível. Reinicie o backend e confira o banco.</p>
              </div>
            ) : null}
            <div className="checklist-tipo-grid">
              {tipos.map((tipo) => (
                <ChecklistTipoCard
                  key={tipo.idTipoInspecao}
                  linkState={pageState}
                  reserva={reserva}
                  tipo={tipo}
                  to={`${basePath}/checklist-retorno/tipos/${tipo.idTipoInspecao}`}
                />
              ))}
            </div>
          </SectionCard>

          {preenchimentoCompleto ? (
            <div className="motorista-viagem-card__alert motorista-viagem-card__alert--ok">
              <Icon name="check" />
              <span>Todos os tipos foram preenchidos. Conclua a viagem para ver o histórico.</span>
            </div>
          ) : null}

          {submitState.error ? (
            <div className="admin-dashboard__error">
              <p>{submitState.error}</p>
            </div>
          ) : null}

          {preenchimentoCompleto ? (
            <SectionCard title="Observações (opcional)">
              <label className="admin-form-field admin-form-field--full">
                <span className="admin-form-field__label">Observações do veículo</span>
                <textarea
                  className="admin-form-field__textarea"
                  onChange={(e) => setObservacoesVeiculo(e.target.value)}
                  rows={3}
                  value={observacoesVeiculo}
                />
              </label>
            </SectionCard>
          ) : null}

          <div className="driver-checklist-actions">
            <Link className="action-button action-button--secondary" state={pageState} to={basePath}>
              Voltar ao detalhe
            </Link>
            {preenchimentoCompleto ? (
              <ActionButton disabled={submitState.loading || !tripSummary} icon="check" onClick={concluirViagem}>
                {submitState.loading ? 'Encerrando viagem...' : 'Concluir viagem e ver histórico'}
              </ActionButton>
            ) : (
              <ActionButton disabled icon="check">
                Conclua todos os tipos de checklist
              </ActionButton>
            )}
          </div>
        </>
      )}
    </div>
  );
}
