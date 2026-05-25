import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { Modal } from '../../../components/common/Modal';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { iniciarTrajeto, listarChecklistSaida } from '../../../services/motoristaApi';

function formatKm(value) {
  if (value == null) return 'Sem registro';
  return `${Number(value).toLocaleString('pt-BR')} km`;
}

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

export function ChecklistSaidaPage() {
  const { motoristaId: motoristaIdParam, reservaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const motoristaId = getCurrentMotoristaId();
  const reserva = location.state?.reserva;

  const [quilometragemSaida, setQuilometragemSaida] = useState('');
  const [checkedItems, setCheckedItems] = useState(() => new Set());
  const [observacoes, setObservacoes] = useState({});
  const [checklistData, setChecklistData] = useState({
    loading: true,
    error: null,
    items: reserva?.checklistSaida || [],
  });
  const [submitState, setSubmitState] = useState({ loading: false, error: null });
  const [confirmStartOpen, setConfirmStartOpen] = useState(false);

  useEffect(() => {
    if (reserva?.checklistSaida?.length) {
      Promise.resolve().then(() =>
        setChecklistData({ loading: false, error: null, items: reserva.checklistSaida }),
      );
      return undefined;
    }

    const controller = new AbortController();

    Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      listarChecklistSaida({ signal: controller.signal })
        .then((items) => setChecklistData({ loading: false, error: null, items: items || [] }))
        .catch((error) => {
          if (error.name === 'AbortError') return;
          setChecklistData({
            loading: false,
            error: error.message || 'Não foi possível carregar o checklist.',
            items: [],
          });
        });
    });

    return () => controller.abort();
  }, [reserva]);

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

  const hasMileage = quilometragemSaida !== '' && Number(quilometragemSaida) >= 0;
  const respectsLastMileage =
    reserva?.ultimaQuilometragemVeiculo == null || Number(quilometragemSaida) >= reserva.ultimaQuilometragemVeiculo;
  const canSubmit =
    allChecked && hasMileage && respectsLastMileage && criticalObservationItems.length === 0 && !submitState.loading;
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

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setConfirmStartOpen(true);
  }

  async function confirmStartTrip() {
    if (!canSubmit) return;
    setSubmitState({ loading: true, error: null });
    try {
      await iniciarTrajeto(reservaId, {
        idMotorista: motoristaId,
        quilometragemSaida: Number(quilometragemSaida),
        itensChecklist: Array.from(checkedItems),
        observacoesChecklist: observacoes,
      });
      setConfirmStartOpen(false);
      navigate(`/motorista/${motoristaId}`, {
        replace: true,
        state: { flashMessage: 'Trajeto iniciado com sucesso.' },
      });
    } catch (error) {
      setSubmitState({
        loading: false,
        error: error.message || 'Não foi possível iniciar o trajeto.',
      });
      setConfirmStartOpen(false);
    }
  }

  return (
    <div className="page-stack motorista-page">
      <PageHeader
        eyebrow="Checklist de saída"
        subtitle="Quilometragem e todos os itens do checklist são obrigatórios para iniciar."
        title="Iniciar trajeto"
      />

      <SectionCard title="Conferência obrigatória">
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
                <strong>Registro obrigatório</strong>
                <span>
                  Informe a quilometragem de saída e marque todos os {totalChecklist} itens do checklist.
                </span>
              </div>
            </div>

            {reserva ? (
              <div className="driver-trip-summary">
                <div>
                  <strong>{reserva.placaVeiculo}</strong>
                  <span>{reserva.destino}</span>
                </div>
                <div>
                  <strong>Última KM</strong>
                  <span>{formatKm(reserva.ultimaQuilometragemVeiculo)}</span>
                </div>
                <div>
                  <strong>Saída prevista</strong>
                  <span>{formatDateTime(reserva.dataHoraInicioPrevista)}</span>
                </div>
              </div>
            ) : null}

            <label className="driver-mileage-field">
              <span>Quilometragem de saída obrigatória</span>
              <input
                min="0"
                onChange={(event) => setQuilometragemSaida(event.target.value)}
                placeholder="Ex.: 28100"
                required
                step="0.1"
                type="number"
                value={quilometragemSaida}
              />
            </label>

            <div className="driver-checklist-progress">
              <span>
                Checklist obrigatório: {checkedCount}/{totalChecklist} itens marcados
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

            {hasMileage && !respectsLastMileage ? (
              <div className="admin-dashboard__error">
                <Icon name="alert" />
                <div>
                  <strong>Quilometragem abaixo do último registro</strong>
                  <p>
                    Informe uma quilometragem maior ou igual a {formatKm(reserva.ultimaQuilometragemVeiculo)}.
                  </p>
                </div>
              </div>
            ) : null}

            {criticalObservationItems.length > 0 ? (
              <div className="admin-dashboard__error">
                <Icon name="alert" />
                <div>
                  <strong>Ocorrência crítica encontrada</strong>
                  <p>
                    {criticalObservationItems.map((item) => item.nome).join(', ')} precisa de avaliação do gestor antes
                    da saída.
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
                    placeholder={item.critico ? 'Ocorrência crítica bloqueia a saída' : 'Observação opcional'}
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
                  <strong>Trajeto não iniciado</strong>
                  <p>{submitState.error}</p>
                </div>
              </div>
            ) : null}

            <div className="driver-checklist-actions">
              <span className="driver-submit-hint">
                {!hasMileage
                  ? 'Informe a quilometragem para liberar o início.'
                  : !respectsLastMileage
                    ? 'A quilometragem deve respeitar o último registro.'
                    : criticalObservationItems.length > 0
                      ? 'Resolva a ocorrência crítica antes de iniciar.'
                      : !allChecked
                        ? 'Marque todos os itens obrigatórios.'
                        : 'Tudo pronto para iniciar.'}
              </span>
              <Link className="action-button action-button--secondary" to={`/motorista/${motoristaId}`}>
                Voltar
              </Link>
              <ActionButton disabled={!canSubmit} icon="check" type="submit">
                Iniciar trajeto
              </ActionButton>
            </div>
          </form>
        )}
      </SectionCard>

      <Modal
        footer={
          <>
            <ActionButton disabled={submitState.loading} onClick={() => setConfirmStartOpen(false)} variant="secondary">
              Revisar checklist
            </ActionButton>
            <ActionButton disabled={submitState.loading} icon="check" onClick={confirmStartTrip}>
              {submitState.loading ? 'Iniciando...' : 'Confirmar saída'}
            </ActionButton>
          </>
        }
        onClose={() => {
          if (!submitState.loading) setConfirmStartOpen(false);
        }}
        open={confirmStartOpen}
        subtitle="Após confirmar, a reserva e o veículo serão marcados como em uso."
        title="Confirmar início do trajeto"
      >
        <div className="reservation-decision-modal">
          <dl className="admin-modal-list">
            <div>
              <dt>Reserva</dt>
              <dd>#{reservaId}</dd>
            </div>
            <div>
              <dt>Motorista</dt>
              <dd>#{motoristaId}</dd>
            </div>
            <div>
              <dt>Quilometragem de saída</dt>
              <dd>{Number(quilometragemSaida).toLocaleString('pt-BR')} km</dd>
            </div>
            <div>
              <dt>Última KM</dt>
              <dd>{formatKm(reserva?.ultimaQuilometragemVeiculo)}</dd>
            </div>
            <div>
              <dt>Checklist</dt>
              <dd>{checkedCount}/{totalChecklist} itens</dd>
            </div>
          </dl>
          <p className="admin-modal-detail">
            Confirme somente se a inspeção de saída foi realizada e todos os itens obrigatórios foram verificados.
          </p>
        </div>
      </Modal>
    </div>
  );
}
