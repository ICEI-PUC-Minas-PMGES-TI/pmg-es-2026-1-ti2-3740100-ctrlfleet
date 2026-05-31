import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { listarVeiculosDoMotorista } from '../../../services/motoristaFrotaApi';
import { solicitarManutencaoMotorista } from '../../../services/motoristaManutencaoApi';
import { mapBackendVehicleToView } from '../../../services/veiculoMappers';

const MIN_DESCRIPTION_LENGTH = 15;

export function MotoristaSolicitarManutencaoPage() {
  const navigate = useNavigate();
  const motoristaId = getCurrentMotoristaId();
  const [vehiclesData, setVehiclesData] = useState({ loading: true, error: null, items: [] });
  const [form, setForm] = useState({
    idVeiculo: '',
    quilometragemAtual: '',
    descricaoProblema: '',
  });
  const [submitState, setSubmitState] = useState({ loading: false, error: null, success: null });

  useEffect(() => {
    if (!motoristaId) return undefined;

    const controller = new AbortController();
    setVehiclesData((current) => ({ ...current, loading: true, error: null }));

    listarVeiculosDoMotorista(motoristaId, { apenasDisponiveis: false, signal: controller.signal })
      .then((items) => {
        const mapped = (items || []).map(mapBackendVehicleToView);
        setVehiclesData({ loading: false, error: null, items: mapped });
        if (mapped.length === 1) {
          setForm((current) => ({
            ...current,
            idVeiculo: mapped[0].id,
            quilometragemAtual:
              current.quilometragemAtual ||
              (mapped[0].quilometragemAtual != null ? String(mapped[0].quilometragemAtual) : ''),
          }));
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setVehiclesData({
          loading: false,
          error: error.message || 'Falha ao carregar veículos.',
          items: [],
        });
      });

    return () => controller.abort();
  }, [motoristaId]);

  const selectedVehicle = useMemo(
    () => vehiclesData.items.find((item) => String(item.id) === String(form.idVeiculo)) || null,
    [form.idVeiculo, vehiclesData.items],
  );

  const descriptionLength = form.descricaoProblema.trim().length;
  const canSubmit =
    form.idVeiculo &&
    form.descricaoProblema.trim().length >= MIN_DESCRIPTION_LENGTH &&
    Number.isFinite(Number(String(form.quilometragemAtual).replace(',', '.'))) &&
    Number(String(form.quilometragemAtual).replace(',', '.')) >= 0;

  function handleVehicleChange(event) {
    const idVeiculo = event.target.value;
    const vehicle = vehiclesData.items.find((item) => String(item.id) === String(idVeiculo));
    setForm((current) => ({
      ...current,
      idVeiculo,
      quilometragemAtual:
        vehicle?.quilometragemAtual != null ? String(vehicle.quilometragemAtual) : current.quilometragemAtual,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit || !motoristaId) return;

    setSubmitState({ loading: true, error: null, success: null });
    try {
      await solicitarManutencaoMotorista(motoristaId, {
        idVeiculo: Number(form.idVeiculo),
        quilometragemAtual: Number(String(form.quilometragemAtual).replace(',', '.')),
        descricaoProblema: form.descricaoProblema.trim(),
        emergencia: true,
      });

      navigate(`/motorista/${motoristaId}/manutencao`, {
        replace: true,
        state: {
          flashMessage: 'Solicitação de emergência enviada. A frota foi notificada.',
        },
      });
    } catch (error) {
      setSubmitState({
        loading: false,
        error: error.message || 'Não foi possível enviar a solicitação.',
        success: null,
      });
    }
  }

  if (!motoristaId) {
    return (
      <div className="page-stack motorista-page">
        <p className="motorista-dashboard__invalid">Sessão inválida para o perfil de motorista.</p>
      </div>
    );
  }

  return (
    <div className="page-stack motorista-page motorista-maintenance-request-page">
      <PageHeader
        subtitle="Descreva a falha com clareza para acelerar a triagem do gestor de frota."
        title="Solicitar manutenção de emergência"
      />

      <div className="maintenance-request-banner">
        <Icon name="alert" />
        <div>
          <strong>Use apenas em situações críticas</strong>
          <p>
            Exemplos: falha mecânica durante o trajeto, superaquecimento, perda de freios ou ruído que comprometa a
            segurança.
          </p>
        </div>
      </div>

      <SectionCard subtitle="Campos obrigatórios conforme o processo de manutenção." title="Detalhes da solicitação">
        {vehiclesData.loading ? (
          <div className="admin-dashboard__loading">
            <span aria-hidden="true" className="admin-dashboard__spinner" />
            <p>Carregando veículos...</p>
          </div>
        ) : vehiclesData.error ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Falha ao carregar veículos</strong>
              <p>{vehiclesData.error}</p>
            </div>
          </div>
        ) : vehiclesData.items.length === 0 ? (
          <div className="admin-empty">
            <Icon name="fleet" />
            <p>Nenhum veículo vinculado ao seu perfil.</p>
          </div>
        ) : (
          <form className="maintenance-request-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Veículo</span>
              <select onChange={handleVehicleChange} required value={form.idVeiculo}>
                <option value="">Selecione o veículo</option>
                {vehiclesData.items.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate} · {vehicle.marca} {vehicle.model}
                  </option>
                ))}
              </select>
            </label>

            {selectedVehicle ? (
              <div className="maintenance-request-vehicle-summary">
                <span>{selectedVehicle.plate}</span>
                <span>{selectedVehicle.vehicleTypeLabel}</span>
                <span>{selectedVehicle.status}</span>
              </div>
            ) : null}

            <label className="form-field">
              <span>Quilometragem atual</span>
              <input
                inputMode="decimal"
                min="0"
                onChange={(event) => setForm((current) => ({ ...current, quilometragemAtual: event.target.value }))}
                placeholder="Informe o hodômetro atual"
                required
                step="0.1"
                type="number"
                value={form.quilometragemAtual}
              />
            </label>

            <label className="form-field">
              <span>Descrição do problema</span>
              <textarea
                minLength={MIN_DESCRIPTION_LENGTH}
                onChange={(event) => setForm((current) => ({ ...current, descricaoProblema: event.target.value }))}
                placeholder="Descreva sintomas, local da falha e qualquer detalhe relevante para a oficina."
                required
                rows={6}
                value={form.descricaoProblema}
              />
              <span className={`maintenance-request-counter${descriptionLength >= MIN_DESCRIPTION_LENGTH ? ' is-valid' : ''}`}>
                {descriptionLength}/{MIN_DESCRIPTION_LENGTH} caracteres mínimos
              </span>
            </label>

            {submitState.error ? (
              <div className="admin-dashboard__error">
                <Icon name="alert" />
                <div>
                  <strong>Não foi possível enviar</strong>
                  <p>{submitState.error}</p>
                </div>
              </div>
            ) : null}

            <div className="maintenance-request-actions">
              <ActionButton disabled={submitState.loading} to={`/motorista/${motoristaId}/manutencao`} variant="secondary">
                Cancelar
              </ActionButton>
              <ActionButton disabled={!canSubmit || submitState.loading} type="submit" variant="danger">
                {submitState.loading ? 'Enviando...' : 'Enviar solicitação de emergência'}
              </ActionButton>
            </div>
          </form>
        )}
      </SectionCard>

      <p className="maintenance-request-footnote">
        Após o envio, a solicitação ficará pendente de análise do gestor de frota. Você pode acompanhar o status em{' '}
        <Link to={`/motorista/${motoristaId}/manutencao`}>Manutenções</Link>.
      </p>
    </div>
  );
}
