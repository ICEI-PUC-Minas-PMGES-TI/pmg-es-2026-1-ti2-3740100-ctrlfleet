import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FleetFilters } from '../../../components/gestor/FleetFilters';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatCard } from '../../../components/common/StatCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { listarHistoricoMotorista } from '../../../services/motoristaApi';
import {
  MOTORISTA_REGISTRO_SORT_KEY,
  MOTORISTA_REGISTRO_VIEW_KEY,
  REGISTRO_SORT_FILTERS,
  REGISTRO_VIEW_FILTERS,
  formatDateTime,
  formatKm,
  getSortOrderLabel,
  readStoredSortOrder,
  sortRegistrosByOrder,
  writeStoredSortOrder,
} from '../../../utils/motoristaReservaUtils';
import {
  buildMotoristaViagemNumbers,
  formatViagemLabel,
  getUserReservaNumber,
} from '../../../utils/userReservaNumbers';

function kmPercorrida(registro) {
  if (registro.quilometragemPercorrida != null) return registro.quilometragemPercorrida;
  if (registro.quilometragemRetorno == null || registro.quilometragemSaida == null) return null;
  return Math.max(0, registro.quilometragemRetorno - registro.quilometragemSaida);
}

function RegistroCard({ concluida, motoristaId, percorrida, registro, viagemNumber }) {
  return (
    <article
      className={`driver-journey-card${concluida ? '' : ' driver-journey-card--active'}`}
    >
      <div aria-hidden="true" className="driver-journey-card__accent" />
      <div className="driver-journey-card__body">
        <div className="driver-journey-card__head">
          <div>
            <span className={`driver-journey-card__chip${concluida ? '' : ' driver-journey-card__chip--muted'}`}>
              {formatViagemLabel(viagemNumber)}
            </span>
            <h2 className="driver-journey-card__title">
              {registro.origem || 'Origem não informada'} → {registro.destino || 'Destino não informado'}
            </h2>
            <p className="driver-journey-card__modelo">
              <span className="driver-placa-pill">{registro.placaVeiculo || '—'}</span>
              {registro.modeloVeiculo ? ` · ${registro.modeloVeiculo}` : ''}
            </p>
          </div>
          <StatusBadge label={concluida ? 'Concluída' : 'Em uso'} />
        </div>

        <dl className="driver-journey-card__meta">
          <div>
            <dt>Saída</dt>
            <dd>{formatDateTime(registro.dataSaida)}</dd>
          </div>
          <div>
            <dt>Retorno</dt>
            <dd>{formatDateTime(registro.dataRetorno)}</dd>
          </div>
          <div>
            <dt>KM percorrida</dt>
            <dd>{formatKm(percorrida)}</dd>
          </div>
          <div>
            <dt>Hodômetro</dt>
            <dd>
              {formatKm(registro.quilometragemSaida)} → {formatKm(registro.quilometragemRetorno)}
            </dd>
          </div>
        </dl>

        {registro.observacoesVeiculo ? (
          <div className="driver-journey-card__banner">
            <Icon name="clipboard" />
            <div>
              <strong>Observações</strong>
              <span>{registro.observacoesVeiculo}</span>
            </div>
          </div>
        ) : null}

        {concluida && registro.idReserva ? (
          <div className="driver-journey-card__actions">
            <Link
              className="motorista-viagem-card__action motorista-viagem-card__action--secondary"
              to={`/motorista/${motoristaId}/reservas/${registro.idReserva}/historico`}
            >
              <Icon name="history" />
              <span>Ver histórico completo da viagem</span>
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function MotoristaHistoricoPage() {
  const motoristaId = getCurrentMotoristaId();
  const [state, setState] = useState({ loading: true, error: null, items: [] });
  const [viewMode, setViewMode] = useState(() =>
    readStoredSortOrder(MOTORISTA_REGISTRO_VIEW_KEY, REGISTRO_VIEW_FILTERS, 'registros'),
  );
  const [sortOrder, setSortOrder] = useState(() =>
    readStoredSortOrder(MOTORISTA_REGISTRO_SORT_KEY, REGISTRO_SORT_FILTERS, 'newest'),
  );

  const handleSortOrderChange = useCallback((order) => {
    setSortOrder(order);
    writeStoredSortOrder(MOTORISTA_REGISTRO_SORT_KEY, order);
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    writeStoredSortOrder(MOTORISTA_REGISTRO_VIEW_KEY, mode);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      setState((current) => ({ ...current, loading: true, error: null }));

      listarHistoricoMotorista(motoristaId, { signal: controller.signal })
        .then((items) => setState({ loading: false, error: null, items: items || [] }))
        .catch((error) => {
          if (error.name === 'AbortError') return;
          setState({
            loading: false,
            error: error.message || 'Não foi possível carregar o histórico.',
            items: [],
          });
        });
    });

    return () => controller.abort();
  }, [motoristaId]);

  const viagemNumbers = useMemo(
    () => buildMotoristaViagemNumbers(state.items),
    [state.items],
  );

  const registros = useMemo(
    () =>
      sortRegistrosByOrder(state.items, sortOrder).map((registro) => ({
        ...registro,
        viagemNumber: getUserReservaNumber(viagemNumbers, registro.idReserva),
      })),
    [state.items, sortOrder, viagemNumbers],
  );

  const stats = useMemo(() => {
    const finalizadas = registros.filter((item) => item.dataRetorno).length;
    const abertas = registros.length - finalizadas;
    const kmTotal = registros.reduce((total, item) => total + (kmPercorrida(item) || 0), 0);

    return [
      {
        caption: 'Viagens com registro de uso',
        icon: 'reports',
        title: 'Total',
        value: String(registros.length).padStart(2, '0'),
        variant: 'total',
      },
      {
        caption: 'Com retorno registrado',
        icon: 'check',
        title: 'Concluídas',
        value: String(finalizadas).padStart(2, '0'),
        variant: 'active',
      },
      {
        caption: 'Ainda em uso',
        icon: 'fleet',
        title: 'Abertas',
        value: String(abertas).padStart(2, '0'),
        variant: 'maintenance',
      },
      {
        caption: 'Quilometragem percorrida',
        icon: 'dashboard',
        title: 'KM',
        value: Math.round(kmTotal).toLocaleString('pt-BR'),
        variant: 'blocked',
      },
    ];
  }, [registros]);

  return (
    <div className="page-stack motorista-page motorista-historico-page">
      <PageHeader
        subtitle=""
        title="Histórico de viagens"
      />

      <section aria-label="Resumo do histórico" className="stats-grid stats-grid--compact">
        {stats.map((stat) => (
          <StatCard key={stat.title} layout="vertical" {...stat} />
        ))}
      </section>

      {!state.loading && !state.error && registros.length > 0 ? (
        <div className="motorista-historico-page__filters">
          <FleetFilters
            className="fleet-filters--motorista fleet-filters--compact"
            onSearchChange={() => {}}
            onSortOrderChange={handleSortOrderChange}
            onViewModeChange={handleViewModeChange}
            search=""
            selectedSortOrder={sortOrder}
            selectedViewMode={viewMode}
            showSearch={false}
            sortOrderTabs={REGISTRO_SORT_FILTERS}
            viewModeTabs={REGISTRO_VIEW_FILTERS}
          />

          <p className="motorista-historico-page__hint">
            {registros.length} viagem{registros.length === 1 ? '' : 's'} · Ordenado por:{' '}
            {getSortOrderLabel(sortOrder, REGISTRO_SORT_FILTERS)} · Exibição:{' '}
            {getSortOrderLabel(viewMode, REGISTRO_VIEW_FILTERS)}
          </p>
        </div>
      ) : null}

      {state.loading ? (
        <div className="admin-dashboard__loading">
          <span aria-hidden="true" className="admin-dashboard__spinner" />
          <p>Carregando histórico...</p>
        </div>
      ) : state.error ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <div>
            <strong>Falha ao carregar histórico</strong>
            <p>{state.error}</p>
          </div>
        </div>
      ) : registros.length === 0 ? (
        <div className="admin-empty">
          <Icon name="reports" />
          <p>Nenhum registro de uso encontrado para este motorista.</p>
        </div>
      ) : viewMode === 'completo' ? (
        <section aria-label="Histórico completo" className="motorista-historico-page__timeline-panel">
          <header className="motorista-historico-page__timeline-head">
            <div>
              <span className="motorista-veiculo-detail__eyebrow">Linha do tempo</span>
              <h2>Todos os registros</h2>
              <p>Saída, retorno e quilometragem de cada uso vinculado ao seu perfil.</p>
            </div>
          </header>

          <ol className="operational-timeline motorista-historico-page__timeline">
            {registros.map((registro, index) => {
              const concluida = Boolean(registro.dataRetorno);
              const percorrida = kmPercorrida(registro);

              return (
                <li className="operational-timeline__item" key={registro.idUso || registro.id}>
                  <span className="operational-timeline__dot" />
                  <div className="operational-timeline__body">
                    <div className="operational-timeline__head">
                      <strong>
                        {formatViagemLabel(registro.viagemNumber)} · {registro.origem || '—'} →{' '}
                        {registro.destino || '—'}
                      </strong>
                      <span>{concluida ? 'Concluída' : 'Em uso'}</span>
                    </div>
                    <p>
                      <span className="driver-placa-pill">{registro.placaVeiculo || '—'}</span>
                      {registro.modeloVeiculo ? ` · ${registro.modeloVeiculo}` : ''} · {formatKm(percorrida)}{' '}
                      percorridos
                    </p>
                    <small>
                      Saída: {formatDateTime(registro.dataSaida)} · Retorno: {formatDateTime(registro.dataRetorno)}
                    </small>
                    <small>
                      Hodômetro {formatKm(registro.quilometragemSaida)} → {formatKm(registro.quilometragemRetorno)}
                    </small>
                    {registro.observacoesVeiculo ? <em>{registro.observacoesVeiculo}</em> : null}
                    {concluida && registro.idReserva ? (
                      <Link
                        className="motorista-historico-page__timeline-link"
                        to={`/motorista/${motoristaId}/reservas/${registro.idReserva}/historico`}
                      >
                        <Icon name="history" />
                        <span>Ver histórico completo da viagem</span>
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ) : (
        <div className="driver-journey-list">
          {registros.map((registro) => (
            <RegistroCard
              concluida={Boolean(registro.dataRetorno)}
              key={registro.idUso || registro.id}
              motoristaId={motoristaId}
              percorrida={kmPercorrida(registro)}
              registro={registro}
              viagemNumber={registro.viagemNumber}
            />
          ))}
        </div>
      )}
    </div>
  );
}
