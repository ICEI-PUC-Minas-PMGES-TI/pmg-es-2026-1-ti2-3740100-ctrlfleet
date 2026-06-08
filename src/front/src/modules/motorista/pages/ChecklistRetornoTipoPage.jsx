import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { MotoristaChecklistTipoPanel } from '../../../components/motorista/MotoristaChecklistTipoPanel';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { buscarChecklistPorTipo, registrarChecklistParcialRetorno } from '../../../services/motoristaApi';
import { loadTripSummary } from '../../../utils/tripSummaryStorage';

export function ChecklistRetornoTipoPage() {
  const { reservaId, tipoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const motoristaId = getCurrentMotoristaId();
  const reserva = location.state?.reserva;
  const tripSummary = location.state?.tripSummary ?? loadTripSummary(reservaId);
  const hubPath = `/motorista/${motoristaId}/reservas/${reservaId}/checklist-retorno`;
  const pageState = { reserva, tripSummary };

  const [checklistData, setChecklistData] = useState({ loading: true, error: null, tipo: null });
  const [checkedItems, setCheckedItems] = useState(() => new Set());
  const [observacoes, setObservacoes] = useState({});
  const [submitState, setSubmitState] = useState({ loading: false, error: null });

  useEffect(() => {
    buscarChecklistPorTipo(tipoId)
      .then((tipo) => setChecklistData({ loading: false, error: null, tipo }))
      .catch((error) =>
        setChecklistData({ loading: false, error: error.message, tipo: null }),
      );
  }, [tipoId]);

  const items = useMemo(() => checklistData.tipo?.itens || [], [checklistData.tipo]);
  const allChecked = useMemo(
    () => items.length > 0 && items.every((item) => checkedItems.has(item.id)),
    [checkedItems, items],
  );
  const canSubmit = allChecked && !submitState.loading;
  const corridaPath = `/motorista/${motoristaId}/reservas/${reservaId}/corrida`;

  if (!tripSummary) {
    return (
      <div className="page-stack motorista-page">
        <div className="motorista-viagem-card__alert">
          <Icon name="alert" />
          <span>Finalize a corrida no mapa antes de preencher o checklist de retorno.</span>
          <Link className="action-button action-button--secondary" state={{ reserva }} to={corridaPath}>
            Ir para a corrida
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitState({ loading: true, error: null });
    try {
      await registrarChecklistParcialRetorno(reservaId, tipoId, {
        idMotorista: motoristaId,
        itensChecklist: Array.from(checkedItems),
        observacoesChecklist: observacoes,
      });
      navigate(hubPath, { replace: true, state: pageState });
    } catch (error) {
      setSubmitState({ loading: false, error: error.message });
    }
  }

  return (
    <div className="page-stack motorista-page">
      <PageHeader title={checklistData.tipo?.nome || 'Checklist de retorno'} subtitle="Preencha os itens deste tipo." />
      <Link className="motorista-viagem-detail__back" state={pageState} to={hubPath}>
        <Icon name="fleet" />
        <span>Voltar aos tipos</span>
      </Link>
      <SectionCard>
        {checklistData.loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
          </div>
        ) : (
          <form className="driver-checklist-form" onSubmit={handleSubmit}>
            <MotoristaChecklistTipoPanel
              checkedItems={checkedItems}
              items={items}
              observacoes={observacoes}
              onObservacaoChange={(id, v) => setObservacoes((c) => ({ ...c, [id]: v }))}
              onToggle={(id) =>
                setCheckedItems((cur) => {
                  const n = new Set(cur);
                  if (n.has(id)) n.delete(id);
                  else n.add(id);
                  return n;
                })
              }
              tipo={checklistData.tipo}
            />
            <div className="driver-checklist-actions">
              <Link className="action-button action-button--secondary" to={hubPath} state={pageState}>
                Cancelar
              </Link>
              <ActionButton disabled={!canSubmit} icon="check" type="submit">
                Salvar {checklistData.tipo?.nome}
              </ActionButton>
            </div>
          </form>
        )}
      </SectionCard>
    </div>
  );
}
