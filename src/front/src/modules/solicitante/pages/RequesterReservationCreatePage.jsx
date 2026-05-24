import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { criarReserva } from '../../../services/reservaApi';
import { listarUsuarios } from '../../../services/usuarioApi';
import { listarVeiculos } from '../../../services/veiculoApi';

const initialFormState = {
  datahoraFimEstimada: '',
  datahoraInicioPrevista: '',
  destino: '',
  idMotorista: '',
  idUsuario: '14',
  idVeiculo: '',
  origem: '',
  statusReserva: 'SOLICITADA',
};

const statusLabels = {
  SOLICITADA: 'Pendente',
};

function padId(prefix, value) {
  return `${prefix}-${String(value).padStart(3, '0')}`;
}

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
  const [formMeta, setFormMeta] = useState({
    loading: true,
    error: null,
    vehicles: [],
    drivers: [],
  });
  const [submitState, setSubmitState] = useState({
    loading: false,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([listarVeiculos({ signal: controller.signal }), listarUsuarios({ signal: controller.signal })])
      .then(([vehicles, users]) => {
        setFormMeta({
          loading: false,
          error: null,
          vehicles,
          drivers: users.filter(
            (user) =>
              user.status === 'ATIVO' &&
              (user.tipoCadastro === 'motorista' || user.tipoConta === 'ROLE_MOTORISTA' || user.perfilAcesso === 'Motorista'),
          ),
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setFormMeta({
          loading: false,
          error: error.message || 'Falha ao carregar dados para a reserva.',
          vehicles: [],
          drivers: [],
        });
      });

    return () => controller.abort();
  }, []);

  const selectedVehicle = useMemo(
    () => formMeta.vehicles.find((vehicle) => String(vehicle.id) === formState.idVeiculo) ?? null,
    [formMeta.vehicles, formState.idVeiculo],
  );

  const selectedDriver = useMemo(
    () => formMeta.drivers.find((driver) => String(driver.id) === formState.idMotorista) ?? null,
    [formMeta.drivers, formState.idMotorista],
  );

  function updateForm(field, value) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitState({ loading: true, error: null });

    try {
      await criarReserva({
        datahoraFimEstimada: formState.datahoraFimEstimada,
        datahoraInicioPrevista: formState.datahoraInicioPrevista,
        destino: formState.destino,
        idMotorista: Number(formState.idMotorista),
        idUsuario: Number(formState.idUsuario),
        idVeiculo: Number(formState.idVeiculo),
        origem: formState.origem,
        statusReserva: formState.statusReserva,
      });

      navigate('/solicitante/reservas', {
        state: { flashMessage: 'Reserva salva e enviada para análise do gestor.' },
      });
    } catch (error) {
      setSubmitState({
        loading: false,
        error: error.message || 'Não foi possível salvar a reserva.',
      });
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Área do solicitante"
        subtitle="Preencha os campos usados pela tabela Reservas para registrar uma nova solicitação."
        title="Solicitar Nova Reserva"
      />

      <div className="content-grid content-grid--form">
        <SectionCard
          subtitle="Campos alinhados ao modelo: usuário, veículo, motorista, horários, origem, destino e status."
          title="Dados da reserva"
        >
          {formMeta.error ? (
            <div className="admin-dashboard__error reservation-form__feedback">
              <Icon name="alert" />
              <div>
                <strong>Falha ao carregar dados</strong>
                <p>{formMeta.error}</p>
              </div>
            </div>
          ) : null}

          {submitState.error ? <div className="admin-user-create__error">{submitState.error}</div> : null}

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>ID do usuário</span>
              <input readOnly value={padId('USR', formState.idUsuario)} />
            </label>

            <label className="form-field">
              <span>Veículo</span>
              <select
                onChange={(event) => updateForm('idVeiculo', event.target.value)}
                required
                value={formState.idVeiculo}
              >
                <option value="">Selecione um veículo</option>
                {formMeta.vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.placa} - {vehicle.modelo}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Motorista</span>
              <select
                onChange={(event) => updateForm('idMotorista', event.target.value)}
                required
                value={formState.idMotorista}
              >
                <option value="">Selecione um motorista</option>
                {formMeta.drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.nome} - {driver.matricula}
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
                onChange={(event) => updateForm('datahoraInicioPrevista', event.target.value)}
                required
                type="datetime-local"
                value={formState.datahoraInicioPrevista}
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
                <option value="SOLICITADA">Pendente</option>
              </select>
            </label>

            <div className="form-actions">
              <ActionButton onClick={() => navigate('/solicitante/reservas')} type="button" variant="secondary">
                Cancelar
              </ActionButton>
              <ActionButton disabled={formMeta.loading || submitState.loading} icon="reservations" type="submit">
                {submitState.loading ? 'Salvando...' : formMeta.loading ? 'Carregando...' : 'Solicitar reserva'}
              </ActionButton>
            </div>
          </form>
        </SectionCard>

        <SectionCard subtitle="Conferência visual antes do envio." title="Pré-visualização">
          <dl className="summary-list">
            <div>
              <dt>ID usuário</dt>
              <dd>{padId('USR', formState.idUsuario)}</dd>
            </div>
            <div>
              <dt>ID veículo</dt>
              <dd>{formState.idVeiculo ? padId('VEI', formState.idVeiculo) : 'Pendente'}</dd>
            </div>
            <div>
              <dt>Veículo</dt>
              <dd>{selectedVehicle ? `${selectedVehicle.placa} - ${selectedVehicle.modelo}` : 'Não selecionado'}</dd>
            </div>
            <div>
              <dt>Motorista</dt>
              <dd>{selectedDriver ? selectedDriver.nome : 'Não selecionado'}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge label={statusLabels[formState.statusReserva] ?? formState.statusReserva} />
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
              <dd>{formatDateTime(formState.datahoraInicioPrevista)}</dd>
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
