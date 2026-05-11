import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { RegistroUsoSection } from '../../../components/fleet/RegistroUsoSection';
import { DocumentPills } from '../../../components/gestor/DocumentPills';
import { ActionButton } from '../../../components/common/ActionButton';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { buscarVeiculo, editarDocumentacaoVeiculo } from '../../../services/veiculoApi';
import { mapBackendVehicleToView } from '../../../services/veiculoMappers';

export function VehicleDetailPage() {
  const { vehicleId } = useParams();
  const [vehicleState, setVehicleState] = useState({ loading: true, error: null, item: null });
  const [editingDocs, setEditingDocs] = useState({});

  function loadVehicle(signal) {
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
  }

  useEffect(() => {
    const controller = new AbortController();
    loadVehicle(controller.signal);
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

      <RegistroUsoSection veiculoId={vehicleId} />
    </div>
  );
}
