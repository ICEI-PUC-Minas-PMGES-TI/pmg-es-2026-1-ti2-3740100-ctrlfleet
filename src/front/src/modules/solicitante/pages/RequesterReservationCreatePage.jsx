import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { fleetVehicles } from '../../../data/fleetData';

const initialFormState = {
  datahoraFimEstimada: '',
  datahoraInicioPrevisto: '',
  destino: '',
  idUsuario: 'USR-014',
  idVeiculo: '',
  origem: '',
  statusReserva: 'Pendente',
};

function formatDateTime(value) {
  if (!value) return 'Pendente';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function RequesterReservationCreatePage() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState(initialFormState);

  const selectedVehicle = useMemo(
    () => fleetVehicles.find((vehicle) => vehicle.id === formState.idVeiculo) ?? null,
    [formState.idVeiculo],
  );

  function updateForm(field, value) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    navigate('/solicitante/reservas', {
      state: { flashMessage: 'Reserva enviada para análise do gestor.' },
    });
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Área do solicitante"
        subtitle="Preencha os campos usados pela tabela Reservas para registrar uma nova solicitação."
        title="Solicitar Nova Reserva"
      />

      <div className="content-grid content-grid--form">
        <SectionCard subtitle="Campos alinhados ao modelo: usuário, veículo, horários, origem, destino e status." title="Dados da reserva">
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>ID do usuário</span>
              <input readOnly value={formState.idUsuario} />
            </label>

            <label className="form-field">
              <span>Veículo</span>
              <select
                onChange={(event) => updateForm('idVeiculo', event.target.value)}
                required
                value={formState.idVeiculo}
              >
                <option value="">Selecione um veículo</option>
                {fleetVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate} - {vehicle.model}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Origem</span>
              <input
                onChange={(event) => updateForm('origem', event.target.value)}
                placeholder="Ex.: Prefeitura Municipal"
                required
                value={formState.origem}
              />
            </label>

            <label className="form-field">
              <span>Destino</span>
              <input
                onChange={(event) => updateForm('destino', event.target.value)}
                placeholder="Ex.: Secretaria de Saúde"
                required
                value={formState.destino}
              />
            </label>

            <label className="form-field">
              <span>Início previsto</span>
              <input
                onChange={(event) => updateForm('datahoraInicioPrevisto', event.target.value)}
                required
                type="datetime-local"
                value={formState.datahoraInicioPrevisto}
              />
            </label>

            <label className="form-field">
              <span>Fim estimado</span>
              <input
                onChange={(event) => updateForm('datahoraFimEstimada', event.target.value)}
                required
                type="datetime-local"
                value={formState.datahoraFimEstimada}
              />
            </label>

            <label className="form-field">
              <span>Status da reserva</span>
              <select
                onChange={(event) => updateForm('statusReserva', event.target.value)}
                value={formState.statusReserva}
              >
                <option>Pendente</option>
              </select>
            </label>

            <div className="form-actions">
              <ActionButton onClick={() => navigate('/solicitante/reservas')} type="button" variant="secondary">
                Cancelar
              </ActionButton>
              <ActionButton icon="reservations" type="submit">
                Solicitar reserva
              </ActionButton>
            </div>
          </form>
        </SectionCard>

        <SectionCard subtitle="Conferência visual antes do envio." title="Pré-visualização">
          <dl className="summary-list">
            <div>
              <dt>ID usuário</dt>
              <dd>{formState.idUsuario}</dd>
            </div>
            <div>
              <dt>ID veículo</dt>
              <dd>{formState.idVeiculo ? `VEI-${formState.idVeiculo.padStart(3, '0')}` : 'Pendente'}</dd>
            </div>
            <div>
              <dt>Veículo</dt>
              <dd>{selectedVehicle ? `${selectedVehicle.plate} - ${selectedVehicle.model}` : 'Não selecionado'}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge label={formState.statusReserva} />
              </dd>
            </div>
            <div>
              <dt>Origem</dt>
              <dd>{formState.origem || 'Pendente'}</dd>
            </div>
            <div>
              <dt>Destino</dt>
              <dd>{formState.destino || 'Pendente'}</dd>
            </div>
            <div>
              <dt>Início previsto</dt>
              <dd>{formatDateTime(formState.datahoraInicioPrevisto)}</dd>
            </div>
            <div>
              <dt>Fim estimado</dt>
              <dd>{formatDateTime(formState.datahoraFimEstimada)}</dd>
            </div>
          </dl>
        </SectionCard>
      </div>
    </div>
  );
}
