import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { Modal } from '../../../components/common/Modal';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { FleetFilters } from '../../../components/gestor/FleetFilters';
import { ReservationCardGrid } from '../../../components/gestor/ReservationCardGrid';
import { listarRegistrosPorReserva } from '../../../services/registroUsoApi';
import { aprovarReserva, listarReservas, reprovarReserva } from '../../../services/reservaApi';
import { pad2 } from '../../../services/veiculoMappers';
import {
  buildReservaStatusTabs,
  filterReservas,
  hasActiveReservaFilters,
  resolveReservaFilterSelection,
} from '../../../utils/reservaFilters';

const STATUS_TABS = ['Todas', 'Solicitada', 'Aprovada', 'Em uso', 'Concluída', 'Reprovada', 'Cancelada'];

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
  const [registrosPorReserva, setRegistrosPorReserva] = useState({});
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todas');
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
    setSearch('');
    setSelectedStatus('Todas');
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) carregarReservas(controller.signal);
    });
    return () => controller.abort();
  }, [carregarReservas]);

  const statusTabOptions = useMemo(
    () => buildReservaStatusTabs(state.items, STATUS_TABS),
    [state.items],
  );

  const activeFilters = useMemo(
    () =>
      resolveReservaFilterSelection({
        status: selectedStatus,
        statusTabs: statusTabOptions,
      }),
    [selectedStatus, statusTabOptions],
  );

  useEffect(() => {
    setSelectedStatus((current) => (current === activeFilters.status ? current : activeFilters.status));
  }, [activeFilters.status]);

  const filteredReservas = useMemo(
    () =>
      filterReservas(state.items, {
        search,
        status: activeFilters.status,
      }),
    [search, activeFilters.status, state.items],
  );

  const showStatusFilter = statusTabOptions.length > 1;
  const filtersReady = !state.loading && !state.error && state.items.length > 0;

  useEffect(() => {
    const concluidas = state.items.filter((item) => item.statusReserva === 'CONCLUIDA');
    if (concluidas.length === 0) {
      setRegistrosPorReserva({});
      return undefined;
    }

    let ignore = false;

    Promise.all(
      concluidas.map((reserva) =>
        listarRegistrosPorReserva(reserva.idReserva, reserva).then((registros) => [reserva.idReserva, registros]),
      ),
    )
      .then((entries) => {
        if (ignore) return;
        setRegistrosPorReserva(Object.fromEntries(entries));
      })
      .catch(() => {
        if (!ignore) setRegistrosPorReserva({});
      });

    return () => {
      ignore = true;
    };
  }, [state.items]);

  const summaryCards = useMemo(() => {
    const items = state.items;
    const count = (predicate) => items.filter(predicate).length;

    return [
      {
        caption: 'Solicitações monitoradas',
        icon: 'reservations',
        title: 'Total',
        value: pad2(items.length),
        variant: 'total',
      },
      {
        caption: 'Aguardando decisão',
        icon: 'alert',
        title: 'Pendentes',
        value: pad2(count((item) => item.statusReserva === 'SOLICITADA')),
        variant: 'maintenance',
      },
      {
        caption: 'Liberadas para uso',
        icon: 'check',
        title: 'Aprovadas',
        value: pad2(count((item) => item.statusReserva === 'APROVADA')),
        variant: 'active',
      },
      {
        caption: 'Trajetos em andamento',
        icon: 'fleet',
        title: 'Em uso',
        value: pad2(count((item) => item.statusReserva === 'EM_USO')),
        variant: 'inactive',
      },
      {
        caption: 'Viagens encerradas',
        icon: 'history',
        title: 'Concluídas',
        value: pad2(count((item) => item.statusReserva === 'CONCLUIDA')),
        variant: 'blocked',
      },
    ];
  }, [state.items]);

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
        subtitle="Aprovação, reprovação e acompanhamento do ciclo das reservas."
        title="Reservas"
      />

      <section aria-label="Resumo das reservas" className="stats-grid stats-grid--fleet">
        {summaryCards.map((stat) => (
          <StatCard key={stat.title} layout="vertical" {...stat} />
        ))}
      </section>

      <SectionCard>
        {filtersReady ? (
          <FleetFilters
            className="fleet-filters--gestor"
            controlIdPrefix="gestor-reservas"
            onSearchChange={setSearch}
            onStatusChange={setSelectedStatus}
            search={search}
            searchPlaceholder="Buscar por destino, placa, solicitante ou nº..."
            selectedStatus={activeFilters.status}
            statusSelectMode
            statusTabs={showStatusFilter ? statusTabOptions : null}
          />
        ) : null}

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
          <>
            <div className="table-summary">
              <span>
                Mostrando {filteredReservas.length} de {state.items.length} reservas
                {hasActiveReservaFilters({ search, status: activeFilters.status })
                  ? ` · Status: ${activeFilters.status}`
                  : ''}
              </span>
              <span>Cards com rota, veículo e ações rápidas de aprovação.</span>
            </div>

            <ReservationCardGrid
              onApprove={(reserva) => openDecisionModal(reserva, 'aprovar')}
              onReject={(reserva) => openDecisionModal(reserva, 'reprovar')}
              registrosPorReserva={registrosPorReserva}
              reservas={filteredReservas}
            />
          </>
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
