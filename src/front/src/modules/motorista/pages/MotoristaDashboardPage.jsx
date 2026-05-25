import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { Modal } from '../../../components/common/Modal';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import {
  finalizarTrajeto,
  listarReservasAprovadasMotorista,
  listarReservasEmUsoMotorista,
} from '../../../services/motoristaApi';

const STATUS_RESERVA_LABELS = {
  APROVADA: 'Aprovada',
  CANCELADA: 'Cancelada',
  CONCLUIDA: 'Concluída',
  EM_USO: 'Em uso',
  REPROVADA: 'Reprovada',
  SOLICITADA: 'Solicitada',
};

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

function formatKm(value) {
  if (value == null) return 'Sem registro';
  return `${Number(value).toLocaleString('pt-BR')} km`;
}

function formatStatusReserva(status) {
  return STATUS_RESERVA_LABELS[status] || status || '-';
}

function getReservationStartBlock(reserva) {
  if (!reserva?.dataHoraInicioPrevista) return null;

  const now = new Date();
  const startsAt = new Date(reserva.dataHoraInicioPrevista);
  const endsAt = reserva.dataHoraFimEstimada ? new Date(reserva.dataHoraFimEstimada) : null;

  if (now < startsAt) {
    return `Disponível a partir de ${formatDateTime(reserva.dataHoraInicioPrevista)}`;
  }
  if (endsAt && now > endsAt) {
    return 'Horário previsto encerrado';
  }
  return null;
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

export function MotoristaDashboardPage() {
  const location = useLocation();
  const motoristaId = getCurrentMotoristaId();
  const [reservasData, setReservasData] = useState({
    loading: true,
    error: null,
    items: [],
    emUso: [],
  });

  const [finishModal, setFinishModal] = useState({
    error: '',
    observacoes: '',
    open: false,
    quilometragemRetorno: '',
    reserva: null,
    submitting: false,
  });

  const carregarReservas = useCallback((signal) => {
    const controller = new AbortController();
    const requestSignal = signal || controller.signal;
    setReservasData((current) => ({ ...current, loading: true, error: null }));

    Promise.all([
      listarReservasAprovadasMotorista(motoristaId, { signal: requestSignal }),
      listarReservasEmUsoMotorista(motoristaId, { signal: requestSignal }),
    ])
      .then(([items, emUso]) => {
        setReservasData({ loading: false, error: null, items: items || [], emUso: emUso || [] });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setReservasData({
          loading: false,
          error: error.message || 'Não foi possível carregar as reservas.',
          items: [],
          emUso: [],
        });
      });

    return controller;
  }, [motoristaId]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) carregarReservas(controller.signal);
    });
    return () => controller.abort();
  }, [carregarReservas]);

  function openFinishModal(reserva) {
    setFinishModal({
      error: '',
      observacoes: '',
      open: true,
      quilometragemRetorno: '',
      reserva,
      submitting: false,
    });
  }

  function closeFinishModal() {
    setFinishModal((current) =>
      current.submitting
        ? current
        : {
            error: '',
            observacoes: '',
            open: false,
            quilometragemRetorno: '',
            reserva: null,
            submitting: false,
          },
    );
  }

  async function confirmFinalizarTrajeto() {
    const reserva = finishModal.reserva;
    if (!reserva) return;

    const quilometragemRetorno = Number(finishModal.quilometragemRetorno.replace(',', '.'));
    if (!Number.isFinite(quilometragemRetorno) || quilometragemRetorno < 0) {
      setFinishModal((current) => ({ ...current, error: 'Informe uma quilometragem de retorno válida.' }));
      return;
    }

    try {
      setFinishModal((current) => ({ ...current, error: '', submitting: true }));
      await finalizarTrajeto(reserva.idReserva, {
        idMotorista: motoristaId,
        observacoesVeiculo: finishModal.observacoes,
        quilometragemRetorno,
      });
      setFinishModal({
        error: '',
        observacoes: '',
        open: false,
        quilometragemRetorno: '',
        reserva: null,
        submitting: false,
      });
      await carregarReservas();
    } catch (error) {
      setFinishModal((current) => ({
        ...current,
        error: error.message || 'Não foi possível finalizar o trajeto.',
        submitting: false,
      }));
    }
  }

  const stats = useMemo(
    () => [
      {
        caption: 'Liberadas para iniciar',
        icon: 'reservations',
        title: 'Aprovadas',
        value: pad2(reservasData.items.length),
      },
      {
        caption: 'Trajetos abertos',
        icon: 'fleet',
        title: 'Em uso',
        value: pad2(reservasData.emUso.length),
      },
      {
        caption: 'Antes da retirada',
        icon: 'check',
        title: 'Checklist',
        value: 'Obrig.',
      },
      {
        caption: 'Motorista selecionado',
        icon: 'users',
        title: 'Perfil',
        value: `#${motoristaId}`,
      },
    ],
    [motoristaId, reservasData.emUso.length, reservasData.items.length],
  );

  return (
    <div className="page-stack motorista-page">
      <PageHeader
        eyebrow="Jornada do Motorista"
        subtitle="Tela individual com viagens aprovadas, trajetos em uso e pendências obrigatórias."
        title={`Motorista #${motoristaId}`}
      />

      {location.state?.flashMessage ? <div className="flash-banner">{location.state.flashMessage}</div> : null}

      <section className="stats-grid stats-grid--compact">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <SectionCard title="Pendências obrigatórias">
        <div className="driver-required-grid">
          <div className="driver-required-item">
            <Icon name="check" />
            <div>
              <strong>Checklist de saída</strong>
              <span>Todos os itens devem ser marcados antes de iniciar o trajeto.</span>
            </div>
          </div>
          <div className="driver-required-item">
            <Icon name="reports" />
            <div>
              <strong>Quilometragem</strong>
              <span>A quilometragem de saída e de retorno é obrigatória no registro de uso.</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {reservasData.emUso.length > 0 ? (
        <SectionCard title="Trajetos em uso">
          <div className="driver-reservation-list">
            {reservasData.emUso.map((reserva) => (
              <article className="driver-reservation-card" key={reserva.idReserva}>
                <div className="driver-reservation-card__main">
                  <div>
                    <span className="driver-reservation-card__kicker">Reserva #{reserva.idReserva}</span>
                    <h2>{reserva.destino}</h2>
                    <p>
                      {reserva.placaVeiculo} - {reserva.modeloVeiculo}
                    </p>
                  </div>
                  <StatusBadge label={formatStatusReserva(reserva.statusReserva)} />
                </div>
                <ActionButton icon="check" onClick={() => openFinishModal(reserva)}>
                  Finalizar trajeto
                </ActionButton>
              </article>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="Reservas aprovadas">
        {reservasData.loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Carregando reservas...</p>
          </div>
        ) : reservasData.error ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Falha ao carregar reservas</strong>
              <p>{reservasData.error}</p>
            </div>
          </div>
        ) : reservasData.items.length === 0 ? (
          <div className="admin-empty">
            <Icon name="reservations" />
            <p>Nenhuma reserva aprovada para este motorista.</p>
          </div>
        ) : (
          <div className="driver-reservation-list">
            {reservasData.items.map((reserva) => (
              (() => {
                const startBlock = getReservationStartBlock(reserva);
                return (
                  <article className="driver-reservation-card" key={reserva.idReserva}>
                    <div className="driver-reservation-card__main">
                      <div>
                        <span className="driver-reservation-card__kicker">Reserva #{reserva.idReserva}</span>
                        <h2>{reserva.destino}</h2>
                        <p>
                          {reserva.origem} -&gt; {reserva.destino}
                        </p>
                      </div>
                      <StatusBadge label={formatStatusReserva(reserva.statusReserva)} />
                    </div>

                    <dl className="driver-reservation-card__meta">
                      <div>
                        <dt>Veículo</dt>
                        <dd>
                          {reserva.placaVeiculo} - {reserva.modeloVeiculo}
                        </dd>
                      </div>
                      <div>
                        <dt>Última KM</dt>
                        <dd>{formatKm(reserva.ultimaQuilometragemVeiculo)}</dd>
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

                    {startBlock ? (
                      <div className="driver-required-banner driver-required-banner--warning">
                        <Icon name="alert" />
                        <div>
                          <strong>Checklist bloqueado</strong>
                          <span>{startBlock}</span>
                        </div>
                      </div>
                    ) : (
                      <Link
                        className="action-button action-button--primary action-button--with-icon"
                        state={{ motoristaId, reserva }}
                        to={`/motorista/${motoristaId}/reservas/${reserva.idReserva}/checklist-saida`}
                      >
                        <Icon className="action-button__icon" name="check" />
                        <span>Fazer checklist</span>
                      </Link>
                    )}
                  </article>
                );
              })()
            ))}
          </div>
        )}
      </SectionCard>

      <Modal
        footer={
          <>
            <ActionButton disabled={finishModal.submitting} onClick={closeFinishModal} variant="secondary">
              Cancelar
            </ActionButton>
            <ActionButton
              disabled={finishModal.submitting || finishModal.quilometragemRetorno.trim().length === 0}
              icon="check"
              onClick={confirmFinalizarTrajeto}
            >
              {finishModal.submitting ? 'Finalizando...' : 'Confirmar retorno'}
            </ActionButton>
          </>
        }
        onClose={closeFinishModal}
        open={finishModal.open}
        subtitle="Informe os dados de retorno para encerrar o registro de uso."
        title="Finalizar trajeto"
      >
        {finishModal.reserva ? (
          <div className="reservation-decision-modal">
            <dl className="admin-modal-list">
              <div>
                <dt>Reserva</dt>
                <dd>#{finishModal.reserva.idReserva}</dd>
              </div>
              <div>
                <dt>Veículo</dt>
                <dd>{finishModal.reserva.placaVeiculo}</dd>
              </div>
              <div>
                <dt>Destino</dt>
                <dd>{finishModal.reserva.destino}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{formatStatusReserva(finishModal.reserva.statusReserva)}</dd>
              </div>
            </dl>

            {finishModal.error ? (
              <div className="admin-dashboard__error">
                <Icon name="alert" />
                <div>
                  <strong>Retorno não registrado</strong>
                  <p>{finishModal.error}</p>
                </div>
              </div>
            ) : null}

            <label className="admin-form-field admin-form-field--full">
              <span className="admin-form-field__label">
                Quilometragem de retorno
                <span className="admin-form-field__req">*</span>
              </span>
              <input
                className="admin-form-field__input"
                inputMode="decimal"
                onChange={(event) =>
                  setFinishModal((current) => ({ ...current, quilometragemRetorno: event.target.value }))
                }
                placeholder="Ex.: 28450"
                value={finishModal.quilometragemRetorno}
              />
            </label>

            <label className="admin-form-field admin-form-field--full">
              <span className="admin-form-field__label">Observações do veículo</span>
              <textarea
                className="admin-form-field__textarea"
                maxLength={240}
                onChange={(event) =>
                  setFinishModal((current) => ({ ...current, observacoes: event.target.value }))
                }
                placeholder="Ex.: veículo entregue limpo e sem ocorrências."
                rows={4}
                value={finishModal.observacoes}
              />
            </label>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
