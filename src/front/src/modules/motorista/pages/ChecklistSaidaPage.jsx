import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { iniciarTrajeto, listarChecklistSaida } from '../../../services/motoristaApi';

const DEFAULT_MOTORISTA_ID = 5;

export function ChecklistSaidaPage() {
  const { motoristaId: motoristaIdParam, reservaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const motoristaId = Number(motoristaIdParam || location.state?.motoristaId || DEFAULT_MOTORISTA_ID);
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

  useEffect(() => {
    if (reserva?.checklistSaida?.length) {
      setChecklistData({ loading: false, error: null, items: reserva.checklistSaida });
      return undefined;
    }

    const controller = new AbortController();
    listarChecklistSaida({ signal: controller.signal })
      .then((items) => setChecklistData({ loading: false, error: null, items: items || [] }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setChecklistData({
          loading: false,
          error: error.message || 'Nao foi possivel carregar checklist.',
          items: [],
        });
      });

    return () => controller.abort();
  }, [reserva]);

  const allChecked = useMemo(
    () => checklistData.items.length > 0 && checklistData.items.every((item) => checkedItems.has(item.id)),
    [checkedItems, checklistData.items],
  );

  const hasMileage = quilometragemSaida !== '' && Number(quilometragemSaida) >= 0;
  const canSubmit = allChecked && hasMileage && !submitState.loading;
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

    setSubmitState({ loading: true, error: null });
    try {
      await iniciarTrajeto(reservaId, {
        idMotorista: motoristaId,
        quilometragemSaida: Number(quilometragemSaida),
        itensChecklist: Array.from(checkedItems),
        observacoesChecklist: observacoes,
      });
      navigate(`/motorista/${motoristaId}`, {
        replace: true,
        state: { flashMessage: 'Trajeto iniciado com sucesso.' },
      });
    } catch (error) {
      setSubmitState({
        loading: false,
        error: error.message || 'Nao foi possivel iniciar o trajeto.',
      });
    }
  }

  return (
    <div className="page-stack motorista-page">
      <PageHeader
        eyebrow="Checklist de saida"
        subtitle="Quilometragem e todos os itens do checklist sao obrigatorios para iniciar."
        title="Iniciar trajeto"
      />

      <SectionCard title="Conferencia obrigatoria">
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
                <strong>Registro obrigatorio</strong>
                <span>
                  Informe a quilometragem de saida e marque todos os {totalChecklist} itens do checklist.
                </span>
              </div>
            </div>

            {reserva ? (
              <div className="driver-trip-summary">
                <strong>{reserva.placaVeiculo}</strong>
                <span>{reserva.destino}</span>
              </div>
            ) : null}

            <label className="driver-mileage-field">
              <span>Quilometragem de saida obrigatoria</span>
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
                Checklist obrigatorio: {checkedCount}/{totalChecklist} itens marcados
              </span>
              <strong>{allChecked ? 'Completo' : 'Pendente'}</strong>
            </div>

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
                  </label>
                  <input
                    aria-label={`Observacao de ${item.nome}`}
                    onChange={(event) =>
                      setObservacoes((current) => ({ ...current, [item.id]: event.target.value }))
                    }
                    placeholder="Observacao opcional"
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
                  <strong>Trajeto nao iniciado</strong>
                  <p>{submitState.error}</p>
                </div>
              </div>
            ) : null}

            <div className="driver-checklist-actions">
              <span className="driver-submit-hint">
                {!hasMileage
                  ? 'Informe a quilometragem para liberar o inicio.'
                  : !allChecked
                    ? 'Marque todos os itens obrigatorios.'
                    : 'Tudo pronto para iniciar.'}
              </span>
              <Link className="action-button action-button--secondary" to={`/motorista/${motoristaId}`}>
                Voltar
              </Link>
              <ActionButton disabled={!canSubmit} icon="check" type="submit">
                {submitState.loading ? 'Iniciando...' : 'Iniciar trajeto'}
              </ActionButton>
            </div>
          </form>
        )}
      </SectionCard>
    </div>
  );
}
