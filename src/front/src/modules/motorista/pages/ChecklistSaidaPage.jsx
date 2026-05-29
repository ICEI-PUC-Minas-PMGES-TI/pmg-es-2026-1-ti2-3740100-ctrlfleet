import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import {
  buscarReservaMotorista,
  obterStatusChecklistSaida,
  registrarChecklistSaidaFinal,
  registrarQuilometragemSaida,
} from '../../../services/motoristaApi';
import { ChecklistTipoCard } from '../../../components/motorista/ChecklistTipoCard';
import { canOpenChecklistSaida, formatKm, getChecklistWindowMessage } from '../../../utils/motoristaReservaUtils';

export function ChecklistSaidaPage() {
  const { reservaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const motoristaId = getCurrentMotoristaId();
  const reserva = location.state?.reserva;

  const [status, setStatus] = useState({ loading: true, error: null, data: null });
  const [quilometragemSaida, setQuilometragemSaida] = useState('');
  const [kmState, setKmState] = useState({ saving: false, error: null });
  const [registerState, setRegisterState] = useState({ loading: false, error: null });

  const loadStatus = useCallback(async () => {
    if (!motoristaId || !reservaId) return;
    setStatus((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await obterStatusChecklistSaida(reservaId, motoristaId);
      setStatus({ loading: false, error: null, data });
      if (data.quilometragemSaida != null) {
        setQuilometragemSaida(String(data.quilometragemSaida));
      }
    } catch (error) {
      setStatus({ loading: false, error: error.message || 'Não foi possível carregar os tipos de checklist.', data: null });
    }
  }, [motoristaId, reservaId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus, location.key]);

  const canFillChecklist = canOpenChecklistSaida(reserva);
  const windowMessage = getChecklistWindowMessage(reserva);
  const tipos = status.data?.tipos || [];
  const preenchimentoCompleto = Boolean(status.data?.preenchimentoCompleto);
  const checklistRegistrado = Boolean(status.data?.checklistRegistrado);
  const ultimaKmVeiculo =
    status.data?.ultimaQuilometragemVeiculo ?? reserva?.ultimaQuilometragemVeiculo ?? null;
  const kmRegistrada = status.data?.quilometragemSaida;
  const basePath = `/motorista/${motoristaId}/reservas/${reservaId}`;

  async function registrarChecklist() {
    setRegisterState({ loading: true, error: null });
    try {
      await registrarChecklistSaidaFinal(reservaId, motoristaId);
      const atualizada = await buscarReservaMotorista(motoristaId, reservaId);
      navigate(basePath, {
        replace: true,
        state: {
          reserva: atualizada
            ? { ...reserva, ...atualizada, checklistSaidaConcluido: true }
            : { ...reserva, checklistSaidaConcluido: true },
          flashMessage: 'Checklist de saída registrado com sucesso.',
        },
      });
    } catch (error) {
      setRegisterState({ loading: false, error: error.message || 'Não foi possível registrar o checklist.' });
    }
  }

  async function salvarQuilometragem() {
    const km = Number(String(quilometragemSaida).replace(',', '.'));
    if (!Number.isFinite(km) || km < 0) return;
    setKmState({ saving: true, error: null });
    try {
      await registrarQuilometragemSaida(reservaId, { idMotorista: motoristaId, quilometragemSaida: km });
      await loadStatus();
      setKmState({ saving: false, error: null });
    } catch (error) {
      setKmState({ saving: false, error: error.message || 'Não foi possível salvar a quilometragem.' });
    }
  }

  return (
    <div className="page-stack motorista-page">
      <PageHeader
        eyebrow="Checklist de saída"
        subtitle="Preencha cada tipo de inspeção separadamente: Limpeza, Mecânica, Iluminação e Combustível."
        title="Tipos de checklist"
      />

      <Link className="motorista-viagem-detail__back" state={{ reserva }} to={basePath}>
        <Icon name="fleet" />
        <span>Voltar ao detalhe da viagem</span>
      </Link>

      {!canFillChecklist ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <div>
            <strong>Checklist indisponível</strong>
            <p>{windowMessage || 'O checklist só pode ser preenchido 15 minutos antes da saída prevista.'}</p>
          </div>
        </div>
      ) : null}

      {status.loading ? (
        <div className="admin-dashboard__loading">
          <span aria-hidden="true" className="admin-dashboard__spinner" />
          <p>Carregando tipos de checklist...</p>
        </div>
      ) : status.error ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <p>{status.error}</p>
        </div>
      ) : (
        <>
          <SectionCard title="Quilometragem de saída">
            <div className="checklist-km-panel">
              <div className="checklist-km-panel__vehicle">
                <div>
                  <span className="checklist-km-panel__label">Quilometragem atual do veículo</span>
                  <p className="checklist-km-panel__hint">Último registro na frota (hodômetro de referência)</p>
                </div>
                <strong className="checklist-km-panel__value">{formatKm(ultimaKmVeiculo)}</strong>
              </div>

              {kmRegistrada != null && kmRegistrada > 0 ? (
                <p className="checklist-km-panel__saved">
                  <Icon name="check" />
                  <span>
                    Saída registrada nesta viagem: <strong>{formatKm(kmRegistrada)}</strong>
                  </span>
                </p>
              ) : null}

              <p className="driver-checklist-tipo__hint">
                <Icon name="alert" />
                <span>Informe a leitura do hodômetro agora, deve ser igual ou maior que a quilometragem atual do veículo.</span>
              </p>

              <label className="driver-mileage-field checklist-km-panel__input">
                <span>Quilometragem na saída</span>
                <input
                  min={ultimaKmVeiculo != null ? ultimaKmVeiculo : 0}
                  onChange={(e) => setQuilometragemSaida(e.target.value)}
                  placeholder={ultimaKmVeiculo != null ? `Ex.: ${Math.ceil(ultimaKmVeiculo)}` : 'Ex.: 28100'}
                  step="0.1"
                  type="number"
                  value={quilometragemSaida}
                />
              </label>

              {kmState.error ? <p className="admin-dashboard__error">{kmState.error}</p> : null}
              <ActionButton disabled={kmState.saving} icon="check" onClick={salvarQuilometragem}>
                {kmState.saving ? 'Salvando...' : 'Salvar quilometragem'}
              </ActionButton>
            </div>
          </SectionCard>

          <SectionCard title="Escolha o tipo para preencher">
            {tipos.length === 0 ? (
              <div className="admin-dashboard__error">
                <Icon name="alert" />
                <p>Nenhum tipo de checklist disponível. Atualize a página ou contate o suporte.</p>
              </div>
            ) : null}
            <div className="checklist-tipo-grid">
              {tipos.map((tipo) => (
                <ChecklistTipoCard
                  key={tipo.idTipoInspecao}
                  reserva={reserva}
                  tipo={tipo}
                  to={`${basePath}/checklist-saida/tipos/${tipo.idTipoInspecao}`}
                />
              ))}
            </div>
          </SectionCard>

          {checklistRegistrado ? (
            <div className="motorista-viagem-card__alert motorista-viagem-card__alert--ok">
              <Icon name="check" />
              <span>Checklist registrado. Volte ao detalhe da viagem para iniciar a corrida.</span>
            </div>
          ) : preenchimentoCompleto ? (
            <div className="motorista-viagem-card__alert motorista-viagem-card__alert--ok">
              <Icon name="check" />
              <span>Todos os itens foram preenchidos. Clique em &quot;Registrar checklist&quot; para concluir.</span>
            </div>
          ) : null}

          {registerState.error ? (
            <div className="admin-dashboard__error">
              <p>{registerState.error}</p>
            </div>
          ) : null}

          <div className="driver-checklist-actions">
            <Link className="action-button action-button--secondary" state={{ reserva }} to={basePath}>
              Voltar ao detalhe
            </Link>
            {checklistRegistrado ? (
              <Link className="action-button action-button--primary" state={{ reserva }} to={basePath}>
                Ir ao detalhe da viagem
              </Link>
            ) : preenchimentoCompleto ? (
              <ActionButton
                disabled={registerState.loading}
                icon="check"
                onClick={registrarChecklist}
              >
                {registerState.loading ? 'Registrando...' : 'Registrar checklist'}
              </ActionButton>
            ) : (
              <ActionButton disabled icon="check">
                Conclua todos os tipos e a quilometragem
              </ActionButton>
            )}
          </div>
        </>
      )}
    </div>
  );
}
