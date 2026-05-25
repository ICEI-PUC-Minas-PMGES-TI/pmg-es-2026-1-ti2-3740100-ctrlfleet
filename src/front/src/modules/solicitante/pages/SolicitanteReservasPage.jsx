import { useEffect, useMemo, useState } from 'react';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { criarReserva } from '../../../services/reservaApi';
import { listarUsuarios } from '../../../services/usuarioApi';
import { mapBackendUserToView } from '../../../services/usuarioMappers';
import { listarVeiculos } from '../../../services/veiculoApi';
import { mapBackendVehicleToView } from '../../../services/veiculoMappers';

const initialForm = {
  idUsuario: '',
  idVeiculo: '',
  dataHoraInicioPrevista: '',
  dataHoraFimEstimada: '',
  origem: 'Garagem Central',
  destino: '',
};

export function SolicitanteReservasPage() {
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState({ loading: false, error: null, success: null });
  const [optionsData, setOptionsData] = useState({
    loading: true,
    error: null,
    users: [],
    vehicles: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      Promise.all([
        listarUsuarios({ signal: controller.signal }),
        listarVeiculos({ signal: controller.signal }),
      ])
        .then(([users, vehicles]) => {
          setOptionsData({
            loading: false,
            error: null,
            users: users.map(mapBackendUserToView),
            vehicles: vehicles.map(mapBackendVehicleToView),
          });
        })
        .catch((error) => {
          if (error.name === 'AbortError') return;
          setOptionsData({
            loading: false,
            error: error.message || 'Não foi possível carregar solicitantes e veículos.',
            users: [],
            vehicles: [],
          });
        });
    });

    return () => controller.abort();
  }, []);

  const solicitantes = useMemo(
    () => optionsData.users.filter((user) => user.role === 'Servidor Solicitante' || user.role === 'Solicitante'),
    [optionsData.users],
  );

  const veiculosDisponiveis = useMemo(
    () => optionsData.vehicles.filter((vehicle) => vehicle.status === 'Ativo'),
    [optionsData.vehicles],
  );

  useEffect(() => {
    Promise.resolve().then(() => {
      setForm((current) => ({
        ...current,
        idUsuario: current.idUsuario || solicitantes[0]?.id || '',
        idVeiculo: current.idVeiculo || veiculosDisponiveis[0]?.id || '',
      }));
    });
  }, [solicitantes, veiculosDisponiveis]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setState({ loading: true, error: null, success: null });
    try {
      const reserva = await criarReserva({
        ...form,
        idUsuario: Number(form.idUsuario),
        idVeiculo: Number(form.idVeiculo),
      });
      setState({ loading: false, error: null, success: `Reserva #${reserva.idReserva} solicitada.` });
      setForm(initialForm);
    } catch (error) {
      setState({ loading: false, error: error.message || 'Não foi possível criar a reserva.', success: null });
    }
  }

  return (
    <div className="page-stack motorista-page">
      <PageHeader
        eyebrow="Solicitante"
        subtitle="Crie uma reserva para entrar na fila de avaliação do gestor."
        title="Nova reserva"
      />

      <SectionCard title="Dados da reserva">
        {optionsData.loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Carregando dados para a reserva...</p>
          </div>
        ) : optionsData.error ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Falha ao carregar dados</strong>
              <p>{optionsData.error}</p>
            </div>
          </div>
        ) : null}

        <form className="driver-checklist-form" onSubmit={handleSubmit}>
          <div className="driver-checklist-item">
            <label>
              <span>Solicitante</span>
              <select
                disabled={optionsData.loading || Boolean(optionsData.error) || solicitantes.length === 0}
                onChange={(event) => updateField('idUsuario', event.target.value)}
                required
                value={form.idUsuario}
              >
                <option value="">Selecione um solicitante</option>
                {solicitantes.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Veículo</span>
              <select
                disabled={optionsData.loading || Boolean(optionsData.error) || veiculosDisponiveis.length === 0}
                onChange={(event) => updateField('idVeiculo', event.target.value)}
                required
                value={form.idVeiculo}
              >
                <option value="">Selecione um veículo</option>
                {veiculosDisponiveis.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate} - {vehicle.model}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="driver-checklist-item">
            <label>
              <span>Início previsto</span>
              <input
                onChange={(event) => updateField('dataHoraInicioPrevista', event.target.value)}
                required
                type="datetime-local"
                value={form.dataHoraInicioPrevista}
              />
            </label>
            <label>
              <span>Fim estimado</span>
              <input
                onChange={(event) => updateField('dataHoraFimEstimada', event.target.value)}
                required
                type="datetime-local"
                value={form.dataHoraFimEstimada}
              />
            </label>
          </div>

          <div className="driver-checklist-item">
            <label>
              <span>Origem</span>
              <input onChange={(event) => updateField('origem', event.target.value)} required value={form.origem} />
            </label>
            <label>
              <span>Destino</span>
              <input
                onChange={(event) => updateField('destino', event.target.value)}
                required
                value={form.destino}
              />
            </label>
          </div>

          {state.error ? (
            <div className="admin-dashboard__error">
              <Icon name="alert" />
              <div>
                <strong>Reserva não criada</strong>
                <p>{state.error}</p>
              </div>
            </div>
          ) : null}
          {state.success ? <div className="flash-banner">{state.success}</div> : null}

          <div className="driver-checklist-actions">
            <ActionButton disabled={state.loading} icon="reservations" type="submit">
              {state.loading ? 'Solicitando...' : 'Solicitar reserva'}
            </ActionButton>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
