import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { MotoristaChecklistTipoPanel } from '../../../components/motorista/MotoristaChecklistTipoPanel';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { buscarChecklistPorTipo, registrarChecklistParcialSaida } from '../../../services/motoristaApi';

export function ChecklistSaidaTipoPage() {
  const { reservaId, tipoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const motoristaId = getCurrentMotoristaId();
  const reserva = location.state?.reserva;

  const [checklistData, setChecklistData] = useState({ loading: true, error: null, tipo: null });
  const [checkedItems, setCheckedItems] = useState(() => new Set());
  const [observacoes, setObservacoes] = useState({});
  const [submitState, setSubmitState] = useState({ loading: false, error: null });

  const hubPath = `/motorista/${motoristaId}/reservas/${reservaId}/checklist-saida`;

  useEffect(() => {
    const controller = new AbortController();
    buscarChecklistPorTipo(tipoId, { signal: controller.signal })
      .then((tipo) => setChecklistData({ loading: false, error: null, tipo }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setChecklistData({
          loading: false,
          error: error.message || 'Não foi possível carregar os itens.',
          tipo: null,
        });
      });
    return () => controller.abort();
  }, [tipoId]);

  const items = useMemo(() => checklistData.tipo?.itens || [], [checklistData.tipo]);
  const allChecked = useMemo(
    () => items.length > 0 && items.every((item) => checkedItems.has(item.id)),
    [checkedItems, items],
  );
  const criticalObservationItems = useMemo(
    () =>
      items.filter(
        (item) => item.critico && observacoes[item.id] && observacoes[item.id].trim().length > 0,
      ),
    [items, observacoes],
  );
  const canSubmit = allChecked && criticalObservationItems.length === 0 && !submitState.loading;

  function toggleItem(itemId) {
    setCheckedItems((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitState({ loading: true, error: null });
    try {
      await registrarChecklistParcialSaida(reservaId, tipoId, {
        idMotorista: motoristaId,
        itensChecklist: Array.from(checkedItems),
        observacoesChecklist: observacoes,
      });
      navigate(hubPath, {
        replace: true,
        state: { reserva, flashMessage: `Checklist "${checklistData.tipo?.nome}" salvo.` },
      });
    } catch (error) {
      setSubmitState({ loading: false, error: error.message || 'Não foi possível salvar.' });
    }
  }

  return (
    <div className="page-stack motorista-page">
      <PageHeader
        eyebrow="Checklist de saída"
        subtitle="Marque todos os itens deste tipo de inspeção."
        title={checklistData.tipo?.nome || 'Preencher checklist'}
      />

      <Link className="motorista-viagem-detail__back" state={{ reserva }} to={hubPath}>
        <Icon name="fleet" />
        <span>Voltar aos tipos de checklist</span>
      </Link>

      <SectionCard>
        {checklistData.loading ? (
          <div className="admin-dashboard__loading">
            <span aria-hidden="true" className="admin-dashboard__spinner" />
          </div>
        ) : checklistData.error ? (
          <div className="admin-dashboard__error">
            <p>{checklistData.error}</p>
          </div>
        ) : (
          <form className="driver-checklist-form" onSubmit={handleSubmit}>
            <MotoristaChecklistTipoPanel
              checkedItems={checkedItems}
              items={items}
              observacoes={observacoes}
              onObservacaoChange={(id, value) => setObservacoes((c) => ({ ...c, [id]: value }))}
              onToggle={toggleItem}
              tipo={checklistData.tipo}
            />

            {submitState.error ? (
              <div className="admin-dashboard__error">
                <p>{submitState.error}</p>
              </div>
            ) : null}

            <div className="driver-checklist-actions">
              <Link className="action-button action-button--secondary" state={{ reserva }} to={hubPath}>
                Cancelar
              </Link>
              <ActionButton disabled={!canSubmit} icon="check" type="submit">
                {submitState.loading ? 'Salvando...' : `Salvar ${checklistData.tipo?.nome}`}
              </ActionButton>
            </div>
          </form>
        )}
      </SectionCard>
    </div>
  );
}
