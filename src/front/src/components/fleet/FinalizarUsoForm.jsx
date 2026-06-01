import { useEffect, useMemo, useState } from 'react';
import { ActionButton } from '../common/ActionButton';
import { SectionCard } from '../common/SectionCard';
import { getAuthSession } from '../../services/authSession';
import { finalizarCorrida } from '../../services/registroUsoApi';
import { listarUsuarios } from '../../services/usuarioApi';

function toIsoWithSeconds(value) {
  if (!value) return '';
  return value.length === 16 ? `${value}:00` : value;
}

export function FinalizarUsoForm({ veiculoId, onFinalizado }) {
  const canManageUsuarios = getAuthSession()?.role === 'ROLE_ADMINISTRADOR';
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosErro, setUsuariosErro] = useState(null);
  const [canLoadUsuarios, setCanLoadUsuarios] = useState(canManageUsuarios);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [form, setForm] = useState({
    idMotorista: '',
    idReserva: '',
    dataSaida: '',
    quilometragemSaida: '',
    dataRetorno: '',
    quilometragemRetorno: '',
    observacoesVeiculo: '',
  });

  useEffect(() => {
    if (!canManageUsuarios) return undefined;

    const controller = new AbortController();
    listarUsuarios({ signal: controller.signal })
      .then(setUsuarios)
      .catch((error) => {
        if (error.name !== 'AbortError') {
          if (error.status === 403 || /403|forbidden/i.test(error.message || '')) {
            setCanLoadUsuarios(false);
            return;
          }
          setUsuariosErro(error.message || 'Não foi possível carregar motoristas.');
        }
      });
    return () => controller.abort();
  }, [canManageUsuarios]);

  const motoristas = useMemo(
    () =>
      usuarios.filter(
        (usuario) =>
          usuario.status === 'ATIVO' &&
          (usuario.tipoCadastro === 'motorista' || usuario.tipoConta === 'ROLE_MOTORISTA'),
      ),
    [usuarios],
  );

  function updateField(field, value) {
    setFeedback(null);
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      await finalizarCorrida({
        idVeiculo: Number(veiculoId),
        idMotorista: Number(form.idMotorista),
        idReserva: form.idReserva ? Number(form.idReserva) : null,
        dataSaida: toIsoWithSeconds(form.dataSaida),
        quilometragemSaida: Number(form.quilometragemSaida),
        dataRetorno: toIsoWithSeconds(form.dataRetorno),
        quilometragemRetorno: Number(form.quilometragemRetorno),
        observacoesVeiculo: form.observacoesVeiculo.trim() || null,
      });
      setFeedback({ type: 'success', message: 'Uso finalizado e veículo liberado.' });
      setForm((current) => ({
        ...current,
        idReserva: '',
        quilometragemSaida: '',
        quilometragemRetorno: '',
        observacoesVeiculo: '',
        dataSaida: '',
        dataRetorno: '',
      }));
      await onFinalizado?.();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Não foi possível finalizar o uso.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (!canLoadUsuarios) {
    return null;
  }

  return (
    <SectionCard
      subtitle="Registre retorno, quilometragem e libere o veículo para novas reservas."
      title="Finalizar uso"
    >
      <form className="form-grid finalizar-uso-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Motorista</span>
          <select
            onChange={(event) => updateField('idMotorista', event.target.value)}
            required
            value={form.idMotorista}
          >
            <option value="">Selecione</option>
            {motoristas.map((motorista) => (
              <option key={motorista.id} value={motorista.id}>
                {motorista.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>ID da reserva</span>
          <input
            min="1"
            onChange={(event) => updateField('idReserva', event.target.value)}
            placeholder="Opcional"
            type="number"
            value={form.idReserva}
          />
        </label>

        <label className="form-field">
          <span>Data de saída</span>
          <input
            onChange={(event) => updateField('dataSaida', event.target.value)}
            required
            type="datetime-local"
            value={form.dataSaida}
          />
        </label>

        <label className="form-field">
          <span>Data de retorno</span>
          <input
            onChange={(event) => updateField('dataRetorno', event.target.value)}
            required
            type="datetime-local"
            value={form.dataRetorno}
          />
        </label>

        <label className="form-field">
          <span>KM saída</span>
          <input
            min="0"
            onChange={(event) => updateField('quilometragemSaida', event.target.value)}
            required
            step="0.1"
            type="number"
            value={form.quilometragemSaida}
          />
        </label>

        <label className="form-field">
          <span>KM retorno</span>
          <input
            min="0"
            onChange={(event) => updateField('quilometragemRetorno', event.target.value)}
            required
            step="0.1"
            type="number"
            value={form.quilometragemRetorno}
          />
        </label>

        <label className="form-field finalizar-uso-form__observacoes">
          <span>Observações do veículo</span>
          <textarea
            onChange={(event) => updateField('observacoesVeiculo', event.target.value)}
            placeholder="Avarias, limpeza, abastecimento ou observações do retorno"
            value={form.observacoesVeiculo}
          />
        </label>

        {(feedback || usuariosErro) && (
          <div className={`flash-banner flash-banner--${feedback?.type === 'error' || usuariosErro ? 'error' : 'success'}`}>
            {feedback?.message || usuariosErro}
          </div>
        )}

        <div className="form-actions">
          <ActionButton disabled={submitting || motoristas.length === 0} type="submit">
            {submitting ? 'Finalizando...' : 'Finalizar uso'}
          </ActionButton>
        </div>
      </form>
    </SectionCard>
  );
}
