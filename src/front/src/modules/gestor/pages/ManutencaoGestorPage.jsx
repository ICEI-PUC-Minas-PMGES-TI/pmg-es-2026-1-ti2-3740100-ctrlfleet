import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { Modal } from '../../../components/common/Modal';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { FleetFilters } from '../../../components/gestor/FleetFilters';
import { MaintenanceRequestCardGrid } from '../../../components/gestor/MaintenanceRequestCardGrid';
import { getAuthSession } from '../../../services/authSession';
import {
  aprovarManutencao,
  listarPainelManutencaoGestor,
  reprovarManutencao,
} from '../../../services/gestorManutencaoApi';
import { pad2 } from '../../../services/veiculoMappers';
import { mapPainelGestorManutencaoToView } from '../../../utils/manutencaoMappers';
import {
  buildManutencaoStatusTabs,
  filterManutencoes,
  flattenPainelGestor,
  hasActiveManutencaoFilters,
  resolveManutencaoFilterSelection,
} from '../../../utils/manutencaoGestorFilters';

const STATUS_TABS = ['Todas', 'Pendente', 'Agendada', 'Em andamento', 'Concluída', 'Reprovada', 'Cancelada'];

const PRIORIDADE_OPTIONS = [
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'CRITICA', label: 'Crítica' },
];

function getGestorId() {
  const session = getAuthSession();
  return session?.id ?? 2;
}

export function ManutencaoGestorPage() {
  const [state, setState] = useState({ loading: true, error: null, painel: null });
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Pendente');
  const [decisionModal, setDecisionModal] = useState({
    action: null,
    item: null,
    motivo: '',
    prioridade: 'MEDIA',
    open: false,
    submitting: false,
  });

  const carregarPainel = useCallback((signal) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    return listarPainelManutencaoGestor({ signal })
      .then((painel) =>
        setState({
          loading: false,
          error: null,
          painel: mapPainelGestorManutencaoToView(painel),
        }),
      )
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({
          loading: false,
          error: error.message || 'Falha ao carregar solicitações.',
          painel: null,
        });
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) carregarPainel(controller.signal);
    });
    return () => controller.abort();
  }, [carregarPainel]);

  const allItems = useMemo(() => flattenPainelGestor(state.painel), [state.painel]);

  const statusTabOptions = useMemo(
    () => buildManutencaoStatusTabs(allItems, STATUS_TABS),
    [allItems],
  );

  const activeFilters = useMemo(
    () =>
      resolveManutencaoFilterSelection({
        status: selectedStatus,
        statusTabs: statusTabOptions,
      }),
    [selectedStatus, statusTabOptions],
  );

  useEffect(() => {
    setSelectedStatus((current) => (current === activeFilters.status ? current : activeFilters.status));
  }, [activeFilters.status]);

  const filteredItems = useMemo(
    () =>
      filterManutencoes(allItems, {
        search,
        status: activeFilters.status,
      }),
    [allItems, search, activeFilters.status],
  );

  const showStatusFilter = statusTabOptions.length > 1;
  const filtersReady = !state.loading && allItems.length > 0;

  const summaryCards = useMemo(() => {
    const count = (predicate) => allItems.filter(predicate).length;
    return [
      {
        caption: 'Solicitações na fila',
        icon: 'maintenance',
        title: 'Pendentes',
        value: pad2(count((item) => item.status === 'PENDENTE')),
        variant: 'maintenance',
      },
      {
        caption: 'Aprovadas aguardando oficina',
        icon: 'preventive',
        title: 'Agendadas',
        value: pad2(count((item) => item.status === 'AGENDADA')),
        variant: 'inactive',
      },
      {
        caption: 'Serviços em execução',
        icon: 'fleet',
        title: 'Em andamento',
        value: pad2(count((item) => item.status === 'EM_ANDAMENTO')),
        variant: 'total',
      },
      {
        caption: 'Encerradas ou indeferidas',
        icon: 'history',
        title: 'Histórico',
        value: pad2(
          count(
            (item) =>
              item.status === 'CONCLUIDA' ||
              item.status === 'REPROVADA' ||
              item.status === 'CANCELADA',
          ),
        ),
        variant: 'blocked',
      },
    ];
  }, [allItems]);

  function openDecisionModal(item, action) {
    setDecisionModal({
      action,
      item,
      motivo: '',
      prioridade: item.prioridade || 'MEDIA',
      open: true,
      submitting: false,
    });
  }

  function closeDecisionModal() {
    setDecisionModal((current) =>
      current.submitting
        ? current
        : {
            action: null,
            item: null,
            motivo: '',
            prioridade: 'MEDIA',
            open: false,
            submitting: false,
          },
    );
  }

  async function confirmarDecisao() {
    const { action, item, motivo, prioridade } = decisionModal;
    if (!action || !item) return;
    if (action === 'reprovar' && motivo.trim().length === 0) return;

    setDecisionModal((current) => ({ ...current, submitting: true }));
    try {
      const payload = { idGestor: getGestorId(), motivo };
      if (action === 'aprovar') {
        payload.prioridade = prioridade;
        await aprovarManutencao(item.id, payload);
      } else {
        await reprovarManutencao(item.id, payload);
      }
      await carregarPainel();
      closeDecisionModal();
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error.message || 'Não foi possível registrar a decisão.',
      }));
      setDecisionModal((current) => ({ ...current, submitting: false }));
    }
  }

  const isRejection = decisionModal.action === 'reprovar';
  const decisionTitle = isRejection ? 'Reprovar solicitação' : 'Aprovar solicitação';
  const decisionSubtitle = isRejection
    ? 'Informe a justificativa para indeferir a manutenção.'
    : 'Confirme a prioridade e libere o encaminhamento para oficina.';
  const canConfirmDecision =
    Boolean(decisionModal.action && decisionModal.item) &&
    !decisionModal.submitting &&
    (!isRejection || decisionModal.motivo.trim().length > 0);

  return (
    <div className="page-stack">
      <PageHeader
        subtitle="Triagem de solicitações corretivas e preventivas enviadas pelos motoristas."
        title="Manutenção"
      />

      <section aria-label="Resumo de manutenções" className="stats-grid stats-grid--fleet">
        {summaryCards.map((stat) => (
          <StatCard key={stat.title} layout="vertical" {...stat} />
        ))}
      </section>

      <SectionCard>
        {filtersReady ? (
          <FleetFilters
            className="fleet-filters--gestor"
            controlIdPrefix="gestor-manutencao"
            onSearchChange={setSearch}
            onStatusChange={setSelectedStatus}
            search={search}
            searchPlaceholder="Buscar por placa, motorista, descrição ou nº..."
            selectedStatus={activeFilters.status}
            statusSelectMode
            statusTabs={showStatusFilter ? statusTabOptions : null}
          />
        ) : null}

        {state.loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Carregando solicitações...</p>
          </div>
        ) : state.error && !state.painel ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Falha ao carregar manutenções</strong>
              <p>{state.error}</p>
            </div>
          </div>
        ) : (
          <>
            {state.error ? (
              <div className="admin-dashboard__error admin-dashboard__error--inline">
                <p>{state.error}</p>
              </div>
            ) : null}

            <div className="table-summary">
              <span>
                Mostrando {filteredItems.length} de {allItems.length} solicitações
                {hasActiveManutencaoFilters({ search, status: activeFilters.status })
                  ? ` · Status: ${activeFilters.status}`
                  : ''}
              </span>
              <span>Analise, aprove ou reprove solicitações pendentes.</span>
            </div>

            <MaintenanceRequestCardGrid
              items={filteredItems}
              onApprove={(item) => openDecisionModal(item, 'aprovar')}
              onReject={(item) => openDecisionModal(item, 'reprovar')}
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
        {decisionModal.item ? (
          <div className="reservation-decision-modal">
            <dl className="admin-modal-list">
              <div>
                <dt>Solicitação</dt>
                <dd>#{decisionModal.item.id}</dd>
              </div>
              <div>
                <dt>Veículo</dt>
                <dd>
                  {decisionModal.item.placa} · {decisionModal.item.vehicleLabel}
                </dd>
              </div>
              <div>
                <dt>Motorista</dt>
                <dd>{decisionModal.item.nomeMotorista || '—'}</dd>
              </div>
              <div>
                <dt>Descrição</dt>
                <dd>{decisionModal.item.descricao}</dd>
              </div>
            </dl>

            {!isRejection ? (
              <label className="admin-form-field admin-form-field--full">
                <span className="admin-form-field__label">Prioridade</span>
                <select
                  className="admin-form-field__input"
                  onChange={(event) =>
                    setDecisionModal((current) => ({ ...current, prioridade: event.target.value }))
                  }
                  value={decisionModal.prioridade}
                >
                  {PRIORIDADE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="admin-form-field admin-form-field--full">
              <span className="admin-form-field__label">
                {isRejection ? 'Justificativa da reprovação' : 'Observação da aprovação'}
                {isRejection ? <span className="admin-form-field__req">*</span> : null}
              </span>
              <textarea
                className="admin-form-field__textarea"
                maxLength={240}
                onChange={(event) =>
                  setDecisionModal((current) => ({ ...current, motivo: event.target.value }))
                }
                placeholder={
                  isRejection
                    ? 'Ex.: falha não compromete a segurança — agendar revisão preventiva.'
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
