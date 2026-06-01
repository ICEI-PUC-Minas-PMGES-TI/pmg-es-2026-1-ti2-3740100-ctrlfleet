import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FinalizarUsoForm } from '../../../components/fleet/FinalizarUsoForm';
import { RegistroUsoSection } from '../../../components/fleet/RegistroUsoSection';
import { DocumentPills } from '../../../components/gestor/DocumentPills';
import { ActionButton } from '../../../components/common/ActionButton';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { buscarVeiculo, editarDocumentacaoVeiculo, listarManutencoesPorVeiculo } from '../../../services/veiculoApi';
import { mapBackendVehicleToView } from '../../../services/veiculoMappers';
import { mapManutencaoToView, resolveManutencaoStatusVariant } from '../../../utils/manutencaoMappers';

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  }).format(Number(value || 0));
}

export function VehicleDetailPage() {
  const { vehicleId } = useParams();
  const [vehicleState, setVehicleState] = useState({ loading: true, error: null, item: null });
  const [maintenanceState, setMaintenanceState] = useState({ loading: true, error: null, items: [] });
  const [editingDocs, setEditingDocs] = useState({});
  const [historyVersion, setHistoryVersion] = useState(0);

  const loadVehicle = useCallback((signal) => {
    setVehicleState((current) => ({ ...current, loading: true, error: null }));
    return buscarVeiculo(vehicleId, { signal })
      .then((dto) => {
        const item = mapBackendVehicleToView(dto);
        setVehicleState({ loading: false, error: null, item });
        setEditingDocs(
          Object.fromEntries(
            item.documents
              .filter((doc) => typeof doc.id === 'number')
              .map((doc) => [
                doc.id,
                {
                  dataVencimento: doc.dataVencimento,
                  statusPagamento: doc.statusPagamento,
                  tipoDocumento: doc.tipoDocumento,
                  valorPago: doc.valorPago ?? '',
                },
              ]),
          ),
        );
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setVehicleState({ loading: false, error: error.message || 'Falha ao carregar veiculo.', item: null });
      });
  }, [vehicleId]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => loadVehicle(controller.signal));
    return () => controller.abort();
  }, [loadVehicle]);

  useEffect(() => {
    const controller = new AbortController();
    setMaintenanceState((current) => ({ ...current, loading: true, error: null }));

    listarManutencoesPorVeiculo(vehicleId, { signal: controller.signal })
      .then((items) => {
        setMaintenanceState({
          loading: false,
          error: null,
          items: (items || []).map(mapManutencaoToView),
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setMaintenanceState({
          loading: false,
          error: error.message || 'Falha ao carregar manutencoes.',
          items: [],
        });
      });

    return () => controller.abort();
  }, [vehicleId]);

  async function handleSaveDocument(documento) {
    const form = editingDocs[documento.id];
    if (!form) return;

    await editarDocumentacaoVeiculo(vehicleId, documento.id, {
      tipoDocumento: form.tipoDocumento,
      dataVencimento: form.dataVencimento,
      statusPagamento: form.statusPagamento,
      valorPago: form.valorPago === '' ? null : Number(form.valorPago),
    });
    await loadVehicle();
  }

  async function handleUsoFinalizado() {
    await loadVehicle();
    setHistoryVersion((current) => current + 1);
  }

  if (vehicleState.loading) {
    return (
      <div className="page-stack">
        <PageHeader subtitle="Carregando dados do cadastro." title="Veiculo" />
      </div>
    );
  }

  if (vehicleState.error || !vehicleState.item) {
    return (
      <div className="page-stack">
        <PageHeader subtitle={vehicleState.error || 'Nao encontramos o veiculo solicitado.'} title="Veiculo nao encontrado" />
        <ActionButton to="/gestor/frota" variant="secondary">
          Voltar para a frota
        </ActionButton>
      </div>
    );
  }

  const vehicle = vehicleState.item;
  const activeMaintenances = maintenanceState.items.filter((item) => item.status === 'EM_ANDAMENTO');
  const completedMaintenances = maintenanceState.items.filter((item) => item.status === 'CONCLUIDA');
  const maintenanceCost = maintenanceState.items.reduce((total, item) => total + Number(item.custoTotal || 0), 0);
  const recentMaintenances = maintenanceState.items.slice(0, 3);

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="edit"
        actionLabel="Editar cadastro"
        actionTo={`/gestor/frota/${vehicleId}/editar`}
        subtitle="Consulta detalhada do veiculo, documentacao e historico recente."
        title={vehicle.model}
      />

      <div className="detail-hero">
        <div>
          <span className="plate-chip">{vehicle.plate}</span>
          <h2>{vehicle.model}</h2>
          <p>{vehicle.year}</p>
        </div>
        <StatusBadge label={vehicle.status} />
      </div>

      <div className="detail-actions">
        <ActionButton icon="history" to={`/gestor/frota/${vehicleId}/historico`} variant="secondary">
          Histórico do veículo
        </ActionButton>
        <ActionButton icon="reservations" to="/gestor/reservas" variant="secondary">
          Timeline de reserva
        </ActionButton>
      </div>

      <div className="content-grid">
        <SectionCard subtitle="Campos principais do cadastro." title="Informacoes gerais">
          <dl className="summary-list">
            <div>
              <dt>Marca</dt>
              <dd>{vehicle.marca}</dd>
            </div>
            <div>
              <dt>Modelo</dt>
              <dd>{vehicle.model}</dd>
            </div>
            <div>
              <dt>Ano</dt>
              <dd>{vehicle.year}</dd>
            </div>
            <div>
              <dt>CNH minima</dt>
              <dd>{vehicle.licenseCategory}</dd>
            </div>
          </dl>
        </SectionCard>
      </div>

      <SectionCard subtitle="Situacao dos vencimentos monitorados." title="Documentacao">
        <DocumentPills documents={vehicle.documents} />
        <div className="documents-list">
          {vehicle.documents.map((item) => (
            <div className="documents-list__item" key={item.id || item.label}>
              <strong>{item.label}</strong>
              <span>Valido ate {item.dueDate}</span>
              {typeof item.id === 'number' ? (
                <div className="form-grid">
                  <label className="form-field">
                    <span>Vencimento</span>
                    <input
                      onChange={(event) =>
                        setEditingDocs((current) => ({
                          ...current,
                          [item.id]: { ...current[item.id], dataVencimento: event.target.value },
                        }))
                      }
                      type="date"
                      value={editingDocs[item.id]?.dataVencimento || ''}
                    />
                  </label>
                  <label className="form-field">
                    <span>Status</span>
                    <select
                      onChange={(event) =>
                        setEditingDocs((current) => ({
                          ...current,
                          [item.id]: { ...current[item.id], statusPagamento: event.target.value },
                        }))
                      }
                      value={editingDocs[item.id]?.statusPagamento || 'PENDENTE'}
                    >
                      <option value="PAGO">Pago</option>
                      <option value="PENDENTE">Pendente</option>
                      <option value="ATRASADO">Atrasado</option>
                    </select>
                  </label>
                  <ActionButton onClick={() => handleSaveDocument(item)} type="button" variant="secondary">
                    Salvar documento
                  </ActionButton>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        subtitle={`${activeMaintenances.length} em andamento, ${completedMaintenances.length} concluidas. Custo total ${formatCurrency(maintenanceCost)}.`}
        title="Manutencoes do veiculo"
      >
        {maintenanceState.loading ? (
          <div className="registro-uso-vazio">
            <p>Carregando manutencoes...</p>
          </div>
        ) : maintenanceState.error ? (
          <div className="registro-uso-vazio">
            <p>{maintenanceState.error}</p>
          </div>
        ) : recentMaintenances.length === 0 ? (
          <div className="registro-uso-vazio">
            <p>Nenhuma manutencao registrada para este veiculo.</p>
          </div>
        ) : (
          <div className="vehicle-maintenance-summary">
            {recentMaintenances.map((manutencao) => (
              <article
                className={`vehicle-maintenance-summary__item vehicle-maintenance-summary__item--${resolveManutencaoStatusVariant(manutencao.status)}`}
                key={manutencao.id}
              >
                <div>
                  <span>{manutencao.tipoLabel}</span>
                  <strong>{manutencao.descricao || 'Manutencao sem descricao'}</strong>
                  <small>
                    {manutencao.dataReferenciaLabel} - {manutencao.quilometragemRegistroLabel} - {manutencao.custoTotalLabel}
                  </small>
                </div>
                <StatusBadge label={manutencao.statusLabel} />
              </article>
            ))}
            <ActionButton icon="history" to={`/gestor/frota/${vehicleId}/historico`} variant="secondary">
              Ver prontuario completo
            </ActionButton>
          </div>
        )}
      </SectionCard>

      <FinalizarUsoForm onFinalizado={handleUsoFinalizado} veiculoId={vehicleId} />

      <RegistroUsoSection key={historyVersion} veiculoId={vehicleId} />
    </div>
  );
}
