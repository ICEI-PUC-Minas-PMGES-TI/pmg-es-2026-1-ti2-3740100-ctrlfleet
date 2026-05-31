import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { DocumentPills } from '../../../components/gestor/DocumentPills';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { buscarVeiculoDoMotorista } from '../../../services/motoristaFrotaApi';
import { mapBackendVehicleToView } from '../../../services/veiculoMappers';
import { resolveVehicleImageUrl } from '../../../utils/vehicleImage';
import { formatKm } from '../../../utils/motoristaReservaUtils';

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

export function MotoristaVeiculoDetalhePage() {
  const { vehicleId } = useParams();
  const motoristaId = getCurrentMotoristaId();
  const [vehicleState, setVehicleState] = useState({ loading: true, error: null, item: null });

  const loadVehicle = useCallback(
    (signal) => {
      if (!motoristaId) return Promise.resolve();

      setVehicleState((current) => ({ ...current, loading: true, error: null }));
      return buscarVeiculoDoMotorista(motoristaId, vehicleId, { signal })
        .then((dto) => {
          setVehicleState({ loading: false, error: null, item: mapBackendVehicleToView(dto) });
        })
        .catch((error) => {
          if (error.name === 'AbortError') return;
          setVehicleState({
            loading: false,
            error: error.message || 'Falha ao carregar veículo.',
            item: null,
          });
        });
    },
    [motoristaId, vehicleId],
  );

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => loadVehicle(controller.signal));
    return () => controller.abort();
  }, [loadVehicle]);

  const vehicleImageUrl = useMemo(
    () => (vehicleState.item ? resolveVehicleImageUrl(vehicleState.item) : null),
    [vehicleState.item],
  );

  if (!motoristaId) {
    return (
      <div className="page-stack motorista-page">
        <p className="motorista-dashboard__invalid">Sessão inválida para o perfil de motorista.</p>
      </div>
    );
  }

  if (vehicleState.loading) {
    return (
      <div className="page-stack motorista-page motorista-veiculo-detail">
        <div className="admin-dashboard__loading">
          <span aria-hidden="true" className="admin-dashboard__spinner" />
          <p>Carregando veículo...</p>
        </div>
      </div>
    );
  }

  if (vehicleState.error || !vehicleState.item) {
    return (
      <div className="page-stack motorista-page motorista-veiculo-detail">
        <ActionButton to={`/motorista/${motoristaId}/veiculos`} variant="secondary">
          Voltar para meus veículos
        </ActionButton>
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <div>
            <strong>Veículo não encontrado</strong>
            <p>{vehicleState.error || 'Não encontramos o veículo solicitado.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const vehicle = vehicleState.item;

  return (
    <div className="page-stack motorista-page motorista-veiculo-detail">
      <Link className="motorista-viagem-detail__back" to={`/motorista/${motoristaId}/veiculos`}>
        <Icon name="chevronLeft" />
        <span>Voltar para meus veículos</span>
      </Link>

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

      {vehicle.status === 'Manutenção' || vehicle.status === 'Inativo' ? (
        <div className="motorista-viagem-card__alert">
          <Icon name="alert" />
          <span>
            {vehicle.status === 'Manutenção'
              ? 'Este veículo está em manutenção. Entre em contato com a frota antes de utilizá-lo.'
              : 'Este veículo está inativo e não pode ser utilizado.'}
          </span>
        </div>
      ) : null}

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
          {vehicle.documents.map((doc) => (
            <article
              className={`motorista-doc-card motorista-doc-card--${doc.state}`}
              key={doc.id || doc.label}
            >
              <div className="motorista-doc-card__head">
                <strong>{doc.label}</strong>
                <span className={`motorista-doc-card__state motorista-doc-card__state--${doc.state}`}>
                  {documentStateLabel(doc.state)}
                </span>
              </div>
              <p className="motorista-doc-card__due">Válido até {doc.dueDate}</p>
              <p className="motorista-doc-card__payment">
                Pagamento: <strong>{formatPaymentStatus(doc.statusPagamento)}</strong>
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
