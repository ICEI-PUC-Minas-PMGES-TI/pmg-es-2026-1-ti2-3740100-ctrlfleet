import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DocumentPills } from '../../../components/gestor/DocumentPills';
import { RegistroUsoSection } from '../../../components/fleet/RegistroUsoSection';
import { ActionButton } from '../../../components/common/ActionButton';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { buscarVeiculo } from '../../../services/veiculoApi';

export function VehicleDetailPage() {
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadVehicle() {
      try {
        const data = await buscarVeiculo(vehicleId);
        if (active) setVehicle(data);
      } catch {
        if (active) setVehicle(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadVehicle();
    return () => {
      active = false;
    };
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="page-stack">
        <PageHeader subtitle="Carregando dados persistidos do banco." title="Carregando veiculo" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="page-stack">
        <PageHeader subtitle="Nao encontramos o veiculo solicitado." title="Veiculo nao encontrado" />
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
        subtitle="Consulta detalhada do veiculo, documentacao e historico recente."
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
        <SectionCard subtitle="Campos principais do cadastro." title="Informacoes gerais">
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
              <dt>CNH minima</dt>
              <dd>{vehicle.licenseCategory}</dd>
            </div>
            <div>
              <dt>Secretaria</dt>
              <dd>{vehicle.secretariat}</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard subtitle="Responsavel fixo associado ao veiculo." title="Motorista vinculado">
          {vehicle.driver ? (
            <dl className="summary-list">
              <div>
                <dt>Nome</dt>
                <dd>{vehicle.driver.name}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusBadge label={vehicle.driver.status} />
                </dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{vehicle.driver.email}</dd>
              </div>
              <div>
                <dt>CNH</dt>
                <dd>{vehicle.driver.cnh}</dd>
              </div>
              <div>
                <dt>Validade da CNH</dt>
                <dd>{vehicle.driver.cnhExpiry}</dd>
              </div>
            </dl>
          ) : (
            <p>Nenhum motorista vinculado a este veiculo.</p>
          )}
        </SectionCard>
      </div>

      <SectionCard subtitle="Situacao dos vencimentos monitorados." title="Documentacao">
        <DocumentPills documents={vehicle.documents} />
        <div className="documents-list">
          {vehicle.documents.map((item) => (
            <div className="documents-list__item" key={item.label}>
              <strong>{item.label}</strong>
              <span>Valido ate {item.dueDate}</span>
            </div>
          ))}
        </div>
        <Link className="text-link" to="/gestor/frota/novo">
          Editar cadastro e documentacao
        </Link>
      </SectionCard>

      <RegistroUsoSection veiculoId={vehicleId} />
    </div>
  );
}
