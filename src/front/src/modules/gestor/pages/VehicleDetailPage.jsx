import { Link, useParams } from 'react-router-dom';
import { DocumentPills } from '../../../components/gestor/DocumentPills';
import { ActionButton } from '../../../components/common/ActionButton';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { fleetVehicles } from '../../../data/fleetData';

export function VehicleDetailPage() {
  const { vehicleId } = useParams();
  const vehicle = fleetVehicles.find((item) => item.id === vehicleId);

  if (!vehicle) {
    return (
      <div className="page-stack">
        <PageHeader subtitle="Não encontramos o veículo solicitado." title="Veículo não encontrado" />
        <ActionButton to="/gestor/frota" variant="secondary">
          Voltar para a frota
        </ActionButton>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        actionIcon="edit"
        actionLabel="Editar cadastro"
        actionTo="/gestor/frota/novo"
        subtitle="Consulta detalhada do veículo, documentação e histórico recente."
        title={vehicle.model}
      />

      <div className="detail-hero">
        <div>
          <span className="plate-chip">{vehicle.plate}</span>
          <h2>{vehicle.secretariat}</h2>
          <p>{vehicle.mileage}</p>
        </div>
        <StatusBadge label={vehicle.status} />
      </div>

      <div className="content-grid">
        <SectionCard subtitle="Campos principais do cadastro." title="Informações gerais">
          <dl className="summary-list">
            <div>
              <dt>Modelo</dt>
              <dd>{vehicle.model}</dd>
            </div>
            <div>
              <dt>Ano</dt>
              <dd>{vehicle.year}</dd>
            </div>
            <div>
              <dt>CNH mínima</dt>
              <dd>{vehicle.licenseCategory}</dd>
            </div>
            <div>
              <dt>Secretaria</dt>
              <dd>{vehicle.secretariat}</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard subtitle="Situação dos vencimentos monitorados." title="Documentação">
          <DocumentPills documents={vehicle.documents} />
          <div className="documents-list">
            {vehicle.documents.map((item) => (
              <div className="documents-list__item" key={item.label}>
                <strong>{item.label}</strong>
                <span>Válido até {item.dueDate}</span>
              </div>
            ))}
          </div>
          <Link className="text-link" to="/gestor/frota/novo/documentacao">
            Atualizar documentação
          </Link>
        </SectionCard>
      </div>

      <SectionCard subtitle="Rastreabilidade das movimentações do bem." title="Histórico recente">
        <div className="history-list">
          {vehicle.history.map((entry) => (
            <article className="history-item" key={`${vehicle.id}-${entry.date}`}>
              <span>{entry.date}</span>
              <p>{entry.label}</p>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
