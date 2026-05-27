import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { Modal } from '../../../components/common/Modal';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { finalizarTrajeto, listarChecklistRetorno, listarReservasEmUsoMotorista } from '../../../services/motoristaApi';

function formatKm(value) {
  if (value == null) return '—';
  return `${Number(value).toLocaleString('pt-BR')} km`;
}

function formatDateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function ChecklistRetornoPage() {
  const { reservaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const motoristaId = getCurrentMotoristaId();

  const [reserva, setReserva] = useState(location.state?.reserva ?? null);

  const [quilometragemRetorno, setQuilometragemRetorno] = useState('');
  const [observacoesVeiculo, setObservacoesVeiculo] = useState('');
  const [checkedItems, setCheckedItems] = useState(() => new Set());
  const [observacoes, setObservacoes] = useState({});
  const [checklistData, setChecklistData] = useState({
    loading: true,
    error: null,
    items: reserva?.checklistRetorno || [],
  });
  const [submitState, setSubmitState] = useState({ loading: false, error: null });
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const initial = location.state?.reserva;
    if (
      initial &&
      String(initial.idReserva) === String(reservaId) &&
      initial.checklistRetorno?.length > 0
    ) {
      setReserva(initial);
      setChecklistData({ loading: false, error: null, items: initial.checklistRetorno });
      return undefined;
    }

    if (!reservaId || !motoristaId) {
      setChecklistData((c) => ({ ...c, loading: false }));
      return undefined;
    }

    const controller = new AbortController();

    async function load() {
      setChecklistData((c) => ({ ...c, loading: true, error: null }));
      try {
        const emUso = await listarReservasEmUsoMotorista(motoristaId, { signal: controller.signal });
        const found = (emUso || []).find((r) => String(r.idReserva) === String(reservaId));
        if (controller.signal.aborted) return;
        if (found) {
          setReserva(found);
          if (found.checklistRetorno?.length) {
            setChecklistData({ loading: false, error: null, items: found.checklistRetorno });
          } else {
            const items = await listarChecklistRetorno({ signal: controller.signal });
            if (!controller.signal.aborted) {
              setChecklistData({ loading: false, error: null, items: items || [] });
            }
          }
        } else {
          const items = await listarChecklistRetorno({ signal: controller.signal });
          if (!controller.signal.aborted) {
            setChecklistData({ loading: false, error: null, items: items || [] });
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        setChecklistData({
          loading: false,
          error: error.message || 'Não foi possível carregar o checklist de retorno.',
          items: [],
        });
      }
    }

    load();
    return () => controller.abort();
  }, [location.state?.reserva, motoristaId, reservaId]);

  const kmSaida = reserva?.quilometragemSaidaTrajeto;

  const allChecked = useMemo(
    () => checklistData.items.length > 0 && checklistData.items.every((item) => checkedItems.has(item.id)),
    [checkedItems, checklistData.items],
  );
  const missingItems = useMemo(
    () => checklistData.items.filter((item) => !checkedItems.has(item.id)),
    [checkedItems, checklistData.items],
  );
  const criticalObservationItems = useMemo(
    () =>
      checklistData.items.filter(
        (item) => item.critico && observacoes[item.id] && observacoes[item.id].trim().length > 0,
      ),
    [checklistData.items, observacoes],
  );

  const hasMileage = quilometragemRetorno !== '' && Number(quilometragemRetorno.replace(',', '.')) >= 0;
  const kmRetornoNum = Number(quilometragemRetorno.replace(',', '.'));
  const respectsSaidaKm =
    kmSaida == null || !Number.isFinite(kmRetornoNum) || kmRetornoNum >= Number(kmSaida);
  const canSubmit =
    allChecked &&
    hasMileage &&
    respectsSaidaKm &&
    criticalObservationItems.length === 0 &&
    !submitState.loading;
  const checkedCount = checkedItems.size;
  const totalChecklist = checklistData.items.length;

  function toggleItem(itemId) {
    setCheckedItems((current) => {
      const next = new Set(current);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setConfirmOpen(true);
  }

  async function confirmFinish() {
    if (!canSubmit) return;
    setSubmitState({ loading: true, error: null });
    try {
      await finalizarTrajeto(reservaId, {
        idMotorista: motoristaId,
        quilometragemRetorno: kmRetornoNum,
        observacoesVeiculo: observacoesVeiculo.trim() || undefined,
        itensChecklist: Array.from(checkedItems),
        observacoesChecklist: observacoes,
      });
      setConfirmOpen(false);
      navigate(`/motorista/${motoristaId}`, {
        replace: true,
        state: { flashMessage: 'Trajeto finalizado com sucesso. Reserva concluída.' },
      });
    } catch (error) {
      setSubmitState({
        loading: false,
        error: error.message || 'Não foi possível finalizar o trajeto.',
      });
      setConfirmOpen(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Retorno à garagem"
        subtitle="Conferência obrigatória do veículo e quilometragem antes de encerrar o registro de uso."
        title="Finalizar corrida"
      />

      <SectionCard title="Checklist de devolução">
        {checklistData.loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Carregando checklist...</p>
          </div>
        ) : checklistData.error ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Falha ao carregar checklist</strong>
              <p>{checklistData.error}</p>
            </div>
          </div>
        ) : (
          <form className="driver-checklist-form" onSubmit={handleSubmit}>
            <div className="driver-required-banner">
              <Icon name="alert" />
              <div>
                <strong>Encerramento obrigatório</strong>
                <span>
                  Marque todos os {totalChecklist} itens do checklist de retorno e informe a quilometragem do odômetro ao
                  devolver o veículo.
                </span>
              </div>
            </div>

            {reserva ? (
              <div className="driver-trip-summary driver-trip-summary--retorno">
                <div>
                  <strong>{reserva.placaVeiculo}</strong>
                  <span>{reserva.destino}</span>
                </div>
                <div>
                  <strong>KM na saída</strong>
                  <span>{formatKm(kmSaida)}</span>
                </div>
                <div>
                  <strong>Fim previsto</strong>
                  <span>{formatDateTime(reserva.dataHoraFimEstimada)}</span>
                </div>
              </div>
            ) : null}

            <label className="driver-mileage-field">
              <span>Quilometragem de retorno (obrigatória)</span>
              <input
                inputMode="decimal"
                min="0"
                onChange={(event) => setQuilometragemRetorno(event.target.value)}
                placeholder="Ex.: 28450"
                required
                step="0.1"
                type="text"
                value={quilometragemRetorno}
              />
            </label>

            <label className="admin-form-field admin-form-field--full">
              <span className="admin-form-field__label">Observações gerais do veículo</span>
              <textarea
                className="admin-form-field__textarea"
                maxLength={500}
                onChange={(event) => setObservacoesVeiculo(event.target.value)}
                placeholder="Estado geral, limpeza, combustível, ocorrências no trajeto..."
                rows={3}
                value={observacoesVeiculo}
              />
            </label>

            <div className="driver-checklist-progress">
              <span>
                Checklist de retorno: {checkedCount}/{totalChecklist} itens
              </span>
              <strong>{allChecked ? 'Completo' : 'Pendente'}</strong>
            </div>

            {!allChecked && missingItems.length > 0 ? (
              <div className="driver-required-banner">
                <Icon name="alert" />
                <div>
                  <strong>Itens pendentes</strong>
                  <span>{missingItems.map((item) => item.nome).join(', ')}</span>
                </div>
              </div>
            ) : null}

            {hasMileage && !respectsSaidaKm ? (
              <div className="admin-dashboard__error">
                <Icon name="alert" />
                <div>
                  <strong>Quilometragem inválida</strong>
                  <p>O retorno deve ser maior ou igual à quilometragem registrada na saída ({formatKm(kmSaida)}).</p>
                </div>
              </div>
            ) : null}

            {criticalObservationItems.length > 0 ? (
              <div className="admin-dashboard__error">
                <Icon name="alert" />
                <div>
                  <strong>Ocorrência em item crítico</strong>
                  <p>
                    {criticalObservationItems.map((item) => item.nome).join(', ')} — informe o gestor antes de
                    concluir.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="driver-checklist-list">
              {checklistData.items.map((item) => (
                <div className="driver-checklist-item" key={item.id}>
                  <label>
                    <input
                      checked={checkedItems.has(item.id)}
                      onChange={() => toggleItem(item.id)}
                      type="checkbox"
                    />
                    <span>{item.nome}</span>
                    {item.critico ? <span className="driver-critical-badge">Crítico</span> : null}
                  </label>
                  <input
                    aria-label={`Observação de ${item.nome}`}
                    onChange={(event) =>
                      setObservacoes((current) => ({ ...current, [item.id]: event.target.value }))
                    }
                    placeholder={item.critico ? 'Ocorrência crítica bloqueia a conclusão' : 'Observação opcional'}
                    type="text"
                    value={observacoes[item.id] || ''}
                  />
                </div>
              ))}
            </div>

            {submitState.error ? (
              <div className="admin-dashboard__error">
                <Icon name="alert" />
                <div>
                  <strong>Não foi possível concluir</strong>
                  <p>{submitState.error}</p>
                </div>
              </div>
            ) : null}

            <div className="driver-checklist-actions">
              <span className="driver-submit-hint">
                {!hasMileage
                  ? 'Informe a quilometragem de retorno.'
                  : !respectsSaidaKm
                    ? 'A quilometragem deve ser ≥ à da saída.'
                    : criticalObservationItems.length > 0
                      ? 'Resolva itens críticos com o gestor.'
                      : !allChecked
                        ? 'Marque todos os itens do checklist.'
                        : 'Pronto para encerrar a corrida.'}
              </span>
              <Link className="action-button action-button--secondary" to={`/motorista/${motoristaId}`}>
                Voltar
              </Link>
              <ActionButton disabled={!canSubmit} icon="check" type="submit">
                Encerrar corrida
              </ActionButton>
            </div>
          </form>
        )}
      </SectionCard>

      <Modal
        footer={
          <>
            <ActionButton disabled={submitState.loading} onClick={() => setConfirmOpen(false)} variant="secondary">
              Revisar
            </ActionButton>
            <ActionButton disabled={submitState.loading} icon="check" onClick={confirmFinish}>
              {submitState.loading ? 'Finalizando...' : 'Confirmar encerramento'}
            </ActionButton>
          </>
        }
        onClose={() => {
          if (!submitState.loading) setConfirmOpen(false);
        }}
        open={confirmOpen}
        subtitle="A reserva será marcada como concluída e o veículo voltará como disponível na frota."
        title="Confirmar finalização"
      >
        <div className="reservation-decision-modal">
          <dl className="admin-modal-list">
            <div>
              <dt>Reserva</dt>
              <dd>#{reservaId}</dd>
            </div>
            <div>
              <dt>KM saída</dt>
              <dd>{formatKm(kmSaida)}</dd>
            </div>
            <div>
              <dt>KM retorno</dt>
              <dd>{Number.isFinite(kmRetornoNum) ? kmRetornoNum.toLocaleString('pt-BR') : '—'} km</dd>
            </div>
            <div>
              <dt>Checklist</dt>
              <dd>
                {checkedCount}/{totalChecklist} itens
              </dd>
            </div>
          </dl>
          <p className="admin-modal-detail">
            Confirme somente após inspecionar o veículo e registrar a quilometragem real de devolução.
          </p>
        </div>
      </Modal>
    </div>
  );
}
