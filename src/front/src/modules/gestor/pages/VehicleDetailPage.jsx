import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { RegistroUsoSection } from '../../../components/fleet/RegistroUsoSection';
import { DocumentPills } from '../../../components/gestor/DocumentPills';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { buscarVeiculo, editarDocumentacaoVeiculo } from '../../../services/veiculoApi';
import { mapBackendVehicleToView } from '../../../services/veiculoMappers';
import { resolveVehicleImageUrl } from '../../../utils/vehicleImage';
import { formatKm } from '../../../utils/registroUsoFormatters';

const PAYMENT_STATUS_LABELS = {
  PAGO: 'Pago',
  PENDENTE: 'Pendente',
  ATRASADO: 'Atrasado',
};

function formatPaymentStatus(value) {
  return PAYMENT_STATUS_LABELS[String(value || '').toUpperCase()] || value || '—';
}

function documentStateLabel(state) {
  if (state === 'expired') return 'Vencido';
  if (state === 'warning') return 'Atenção';
  return 'Em dia';
}

export function VehicleDetailPage() {
  const { vehicleId } = useParams();
  const [vehicleState, setVehicleState] = useState({ loading: true, error: null, item: null });
  const [editingDocs, setEditingDocs] = useState({});

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
  const vehicleImageUrl = resolveVehicleImageUrl(vehicle);
  const motorista = vehicle.motoristaResponsavel;

  return (
    <div className="page-stack motorista-veiculo-detail">
      <PageHeader
        actionIcon="edit"
        actionLabel="Editar cadastro"
        actionTo={`/gestor/frota/${vehicleId}/editar`}
        subtitle="Consulta detalhada do veiculo, documentacao e historico recente."
        title={vehicle.model}
      />

      <article className="motorista-veiculo-detail__hero">
        <div className="motorista-veiculo-detail__media">
          <img
            alt={`${vehicle.marca} ${vehicle.model}`}
            className="motorista-veiculo-detail__photo"
            src={vehicleImageUrl}
          />
          <span className="motorista-veiculo-detail__type-badge">{vehicle.vehicleTypeLabel}</span>
        </div>

        <div className="motorista-veiculo-detail__hero-copy">
          <div className="motorista-veiculo-detail__hero-top">
            <span className="motorista-veiculo-detail__plate">{vehicle.plate}</span>
            <StatusBadge label={vehicle.status} />
          </div>
          <h1>
            {vehicle.marca} {vehicle.model}
          </h1>
          <p>Ano {vehicle.year} · CNH categoria {vehicle.licenseCategory}</p>
          <p className="motorista-veiculo-detail__odometer">
            <Icon name="dashboard" />
            <span>
              Quilometragem atual: <strong>{formatKm(vehicle.quilometragemAtual)}</strong>
            </span>
          </p>
          <p className="motorista-veiculo-detail__secretaria">{vehicle.secretaria}</p>
        </div>
      </article>

      <div className="detail-actions">
        <ActionButton icon="history" to={`/gestor/frota/${vehicleId}/historico`} variant="secondary">
          Histórico do veículo
        </ActionButton>
        <ActionButton icon="reservations" to="/gestor/reservas" variant="secondary">
          Timeline de reserva
        </ActionButton>
      </div>

      <section aria-label="Informações do veículo" className="motorista-veiculo-detail__stats">
        <div className="motorista-veiculo-detail__stat">
          <Icon name="fleet" />
          <div>
            <span>Tipo</span>
            <strong>{vehicle.vehicleTypeLabel}</strong>
          </div>
        </div>
        <div className="motorista-veiculo-detail__stat">
          <Icon name="calendar" />
          <div>
            <span>Ano</span>
            <strong>{vehicle.year}</strong>
          </div>
        </div>
        <div className="motorista-veiculo-detail__stat">
          <Icon name="users" />
          <div>
            <span>CNH mínima</span>
            <strong>Categoria {vehicle.licenseCategory}</strong>
          </div>
        </div>
        <div className="motorista-veiculo-detail__stat">
          <Icon name="dashboard" />
          <div>
            <span>Quilometragem</span>
            <strong>{formatKm(vehicle.quilometragemAtual)}</strong>
          </div>
        </div>
        <div className="motorista-veiculo-detail__stat">
          <Icon name="clipboard" />
          <div>
            <span>Secretaria</span>
            <strong>{vehicle.secretaria}</strong>
          </div>
        </div>
        <div className="motorista-veiculo-detail__stat">
          <Icon name="users" />
          <div>
            <span>Motorista responsável</span>
            <strong>{motorista?.nome || 'Não atribuído'}</strong>
            {motorista?.matricula ? <div>{motorista.matricula}</div> : null}
          </div>
        </div>
      </section>

      <section className="motorista-veiculo-detail__docs-panel">
        <header className="motorista-veiculo-detail__section-head">
          <div>
            <span className="motorista-veiculo-detail__eyebrow">Frota</span>
            <h2>Documentação</h2>
            <p>Situação de IPVA, seguro e licenciamento monitorados pela gestão.</p>
          </div>
          <DocumentPills documents={vehicle.documents} />
        </header>

        <div className="motorista-veiculo-detail__docs-grid">
          {vehicle.documents.map((item) => (
            <article className={`motorista-doc-card motorista-doc-card--${item.state}`} key={item.id || item.label}>
              <div className="motorista-doc-card__head">
                <strong>{item.label}</strong>
                <span className={`motorista-doc-card__state motorista-doc-card__state--${item.state}`}>
                  {documentStateLabel(item.state)}
                </span>
              </div>
              <p className="motorista-doc-card__due">Válido até {item.dueDate}</p>
              <p className="motorista-doc-card__payment">
                Pagamento: <strong>{formatPaymentStatus(item.statusPagamento)}</strong>
              </p>

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
                    Salvar
                  </ActionButton>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <RegistroUsoSection veiculoId={vehicleId} />
    </div>
  );
}
