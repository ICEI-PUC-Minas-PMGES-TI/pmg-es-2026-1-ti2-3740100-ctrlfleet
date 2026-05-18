import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import {
  finalizarTrajeto,
  listarReservasAprovadasMotorista,
  listarReservasEmUsoMotorista,
} from '../../../services/motoristaApi';

const DEFAULT_MOTORISTA_ID = 5;

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

export function MotoristaDashboardPage() {
  const location = useLocation();
  const params = useParams();
  const motoristaId = Number(params.motoristaId || DEFAULT_MOTORISTA_ID);
  const [reservasData, setReservasData] = useState({
    loading: true,
    error: null,
    items: [],
    emUso: [],
  });

  function carregarReservas(signal) {
    const controller = new AbortController();
    const requestSignal = signal || controller.signal;
    setReservasData((current) => ({ ...current, loading: true, error: null }));

    Promise.all([
      listarReservasAprovadasMotorista(motoristaId, { signal: requestSignal }),
      listarReservasEmUsoMotorista(motoristaId, { signal: requestSignal }),
    ])
      .then(([items, emUso]) => {
        setReservasData({ loading: false, error: null, items: items || [], emUso: emUso || [] });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setReservasData({
          loading: false,
          error: error.message || 'Nao foi possivel carregar reservas.',
          items: [],
          emUso: [],
        });
      });

    return controller;
  }

  useEffect(() => {
    const controller = carregarReservas();
    return () => controller.abort();
  }, [motoristaId]);

  async function handleFinalizarTrajeto(reserva) {
    const rawKm = window.prompt(`Quilometragem de retorno da reserva #${reserva.idReserva}:`);
    if (rawKm == null) return;
    const quilometragemRetorno = Number(rawKm.replace(',', '.'));
    if (!Number.isFinite(quilometragemRetorno) || quilometragemRetorno < 0) {
      setReservasData((current) => ({ ...current, error: 'Informe uma quilometragem de retorno valida.' }));
      return;
    }

    try {
      await finalizarTrajeto(reserva.idReserva, { idMotorista: motoristaId, quilometragemRetorno });
      carregarReservas();
    } catch (error) {
      setReservasData((current) => ({
        ...current,
        error: error.message || 'Nao foi possivel finalizar o trajeto.',
      }));
    }
  }

  const stats = useMemo(
    () => [
      {
        caption: 'Liberadas para iniciar',
        icon: 'reservations',
        title: 'Aprovadas',
        value: pad2(reservasData.items.length),
      },
      {
        caption: 'Trajetos abertos',
        icon: 'fleet',
        title: 'Em uso',
        value: pad2(reservasData.emUso.length),
      },
      {
        caption: 'Antes da retirada',
        icon: 'check',
        title: 'Checklist',
        value: 'Obrig.',
      },
      {
        caption: 'Motorista selecionado',
        icon: 'users',
        title: 'Perfil',
        value: `#${motoristaId}`,
      },
    ],
    [motoristaId, reservasData.emUso.length, reservasData.items.length],
  );

  return (
    <div className="page-stack motorista-page">
      <PageHeader
        eyebrow="Jornada do Motorista"
        subtitle="Tela individual com viagens aprovadas, trajetos em uso e pendencias obrigatorias."
        title={`Motorista #${motoristaId}`}
      />

      {location.state?.flashMessage ? <div className="flash-banner">{location.state.flashMessage}</div> : null}

      <section className="stats-grid stats-grid--compact">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <SectionCard title="Pendencias obrigatorias">
        <div className="driver-required-grid">
          <div className="driver-required-item">
            <Icon name="check" />
            <div>
              <strong>Checklist de saida</strong>
              <span>Todos os itens devem ser marcados antes de iniciar o trajeto.</span>
            </div>
          </div>
          <div className="driver-required-item">
            <Icon name="reports" />
            <div>
              <strong>Quilometragem</strong>
              <span>A quilometragem de saida e de retorno e obrigatoria no registro de uso.</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {reservasData.emUso.length > 0 ? (
        <SectionCard title="Trajetos em uso">
          <div className="driver-reservation-list">
            {reservasData.emUso.map((reserva) => (
              <article className="driver-reservation-card" key={reserva.idReserva}>
                <div className="driver-reservation-card__main">
                  <div>
                    <span className="driver-reservation-card__kicker">Reserva #{reserva.idReserva}</span>
                    <h2>{reserva.destino}</h2>
                    <p>
                      {reserva.placaVeiculo} - {reserva.modeloVeiculo}
                    </p>
                  </div>
                  <StatusBadge label="Em uso" />
                </div>
                <button
                  className="action-button action-button--primary action-button--with-icon"
                  onClick={() => handleFinalizarTrajeto(reserva)}
                  type="button"
                >
                  <Icon className="action-button__icon" name="check" />
                  <span>Finalizar trajeto</span>
                </button>
              </article>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="Reservas aprovadas">
        {reservasData.loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Carregando reservas...</p>
          </div>
        ) : reservasData.error ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Falha ao carregar reservas</strong>
              <p>{reservasData.error}</p>
            </div>
          </div>
        ) : reservasData.items.length === 0 ? (
          <div className="admin-empty">
            <Icon name="reservations" />
            <p>Nenhuma reserva aprovada para este motorista.</p>
          </div>
        ) : (
          <div className="driver-reservation-list">
            {reservasData.items.map((reserva) => (
              <article className="driver-reservation-card" key={reserva.idReserva}>
                <div className="driver-reservation-card__main">
                  <div>
                    <span className="driver-reservation-card__kicker">Reserva #{reserva.idReserva}</span>
                    <h2>{reserva.destino}</h2>
                    <p>
                      {reserva.origem} -&gt; {reserva.destino}
                    </p>
                  </div>
                  <StatusBadge label="Aprovada" />
                </div>

                <dl className="driver-reservation-card__meta">
                  <div>
                    <dt>Veiculo</dt>
                    <dd>
                      {reserva.placaVeiculo} - {reserva.modeloVeiculo}
                    </dd>
                  </div>
                  <div>
                    <dt>Solicitante</dt>
                    <dd>{reserva.nomeSolicitante}</dd>
                  </div>
                  <div>
                    <dt>Inicio</dt>
                    <dd>{formatDateTime(reserva.dataHoraInicioPrevista)}</dd>
                  </div>
                  <div>
                    <dt>Fim previsto</dt>
                    <dd>{formatDateTime(reserva.dataHoraFimEstimada)}</dd>
                  </div>
                </dl>

                <Link
                  className="action-button action-button--primary action-button--with-icon"
                  state={{ motoristaId, reserva }}
                  to={`/motorista/${motoristaId}/reservas/${reserva.idReserva}/checklist-saida`}
                >
                  <Icon className="action-button__icon" name="check" />
                  <span>Fazer checklist</span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
