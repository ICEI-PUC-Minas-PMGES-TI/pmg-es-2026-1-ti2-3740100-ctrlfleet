import { useState } from 'react';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { criarReserva } from '../../../services/reservaApi';

const initialForm = {
  idUsuario: 10,
  idVeiculo: 1,
  dataHoraInicioPrevista: '',
  dataHoraFimEstimada: '',
  origem: 'Garagem Central',
  destino: '',
};

export function SolicitanteReservasPage() {
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState({ loading: false, error: null, success: null });

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
      setState({ loading: false, error: error.message || 'Nao foi possivel criar reserva.', success: null });
    }
  }

  return (
    <div className="page-stack motorista-page">
      <PageHeader
        eyebrow="Solicitante"
        subtitle="Crie uma reserva para entrar na fila de avaliacao do gestor."
        title="Nova reserva"
      />

      <SectionCard title="Dados da reserva">
        <form className="driver-checklist-form" onSubmit={handleSubmit}>
          <div className="driver-checklist-item">
            <label>
              <span>Solicitante</span>
              <select onChange={(event) => updateField('idUsuario', event.target.value)} value={form.idUsuario}>
                <option value={10}>Fernando Tavares</option>
                <option value={11}>Juliana Martins</option>
                <option value={13}>Camila Reis</option>
              </select>
            </label>
            <label>
              <span>Veiculo</span>
              <select onChange={(event) => updateField('idVeiculo', event.target.value)} value={form.idVeiculo}>
                <option value={1}>ABC1A23 - Onix</option>
                <option value={2}>XYZ5B67 - HB20</option>
                <option value={3}>LMN9C12 - Corsa</option>
                <option value={4}>VXY8D01 - March</option>
                <option value={10}>UVW4J56 - Strada</option>
              </select>
            </label>
          </div>

          <div className="driver-checklist-item">
            <label>
              <span>Inicio previsto</span>
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
                <strong>Reserva nao criada</strong>
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
