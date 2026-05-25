import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { DriverPicker } from '../../../components/solicitante/DriverPicker';
import { RouteAddressSearch } from '../../../components/solicitante/RouteAddressSearch';
import { RouteMapPicker } from '../../../components/solicitante/RouteMapPicker';
import { VehicleTypePicker } from '../../../components/solicitante/VehicleTypePicker';
import { listarMotoristasAtivos, listarVeiculosDoMotorista, mapMotoristaToView } from '../../../services/motoristaFrotaApi';
import { getAuthSession } from '../../../services/authSession';
import {
  getCurrentSolicitanteId,
  getCurrentSolicitanteMatricula,
  setCurrentSolicitante,
} from '../../../services/currentSolicitante';
import { fetchDrivingRoute, reverseGeocode } from '../../../services/geocodingApi';
import { FLEET_GARAGE, getFleetGaragePlace } from '../../../services/fleetMapLocations';
import { criarReserva } from '../../../services/reservaApi';
import { listarUsuarios } from '../../../services/usuarioApi';
import { mapBackendUserToView } from '../../../services/usuarioMappers';
import { mapBackendVehicleToView } from '../../../services/veiculoMappers';

function formatPreviewDateTime(value) {
  if (!value) return '—';
  const normalized = value.length === 16 ? `${value}:00` : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function toIsoDateTime(value) {
  if (!value) return value;
  return value.length === 16 ? `${value}:00` : value;
}

export function RequesterReservationCreatePage() {
  const navigate = useNavigate();
  const routeRequestRef = useRef(0);
  const reverseRequestRef = useRef(0);
  const [activeMapPoint, setActiveMapPoint] = useState('destino');

  const [form, setForm] = useState({
    idUsuario: String(getCurrentSolicitanteId()),
    matriculaSolicitante: getCurrentSolicitanteMatricula(),
    idMotorista: '',
    idVeiculo: '',
    dataHoraInicioPrevista: '',
    dataHoraFimEstimada: '',
    justificativa: '',
    origem: FLEET_GARAGE.label,
    destino: '',
    origemLat: null,
    origemLng: null,
    destinoLat: null,
    destinoLng: null,
  });

  const [optionsData, setOptionsData] = useState({
    loading: true,
    error: null,
    users: [],
    drivers: [],
    vehicles: [],
    vehiclesLoading: false,
  });
  const [submitState, setSubmitState] = useState({ loading: false, error: null });
  const [geocodeStatus, setGeocodeStatus] = useState({ origem: 'idle', destino: 'idle' });
  const [geocodeErrors, setGeocodeErrors] = useState({ origem: null, destino: null });
  const [routePositions, setRoutePositions] = useState([]);
  const [routeMeta, setRouteMeta] = useState(null);
  const [routeStatus, setRouteStatus] = useState('idle');

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      listarUsuarios({ signal: controller.signal }),
      listarMotoristasAtivos({ signal: controller.signal }),
    ])
      .then(([users, drivers]) => {
        const mappedDrivers = (drivers || []).map(mapMotoristaToView);
        setOptionsData({
          loading: false,
          error: null,
          users: users.map(mapBackendUserToView),
          drivers: mappedDrivers,
          vehicles: [],
          vehiclesLoading: false,
        });
        if (mappedDrivers.length === 1) {
          setForm((current) => ({
            ...current,
            idMotorista: String(mappedDrivers[0].id),
          }));
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setOptionsData({
          loading: false,
          error: error.message || 'Não foi possível carregar dados para a reserva.',
          users: [],
          drivers: [],
          vehicles: [],
          vehiclesLoading: false,
        });
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const motoristaId = form.idMotorista;
    if (!motoristaId) {
      setOptionsData((current) => ({ ...current, vehicles: [], vehiclesLoading: false }));
      setForm((current) => ({ ...current, idVeiculo: '' }));
      return undefined;
    }

    const controller = new AbortController();
    setOptionsData((current) => ({ ...current, vehiclesLoading: true }));

    listarVeiculosDoMotorista(Number(motoristaId), { signal: controller.signal })
      .then((vehicles) => {
        const mapped = (vehicles || []).map(mapBackendVehicleToView);
        setOptionsData((current) => ({
          ...current,
          vehicles: mapped,
          vehiclesLoading: false,
        }));
        setForm((current) => {
          const stillValid = mapped.some((vehicle) => String(vehicle.id) === current.idVeiculo);
          return {
            ...current,
            idVeiculo: stillValid ? current.idVeiculo : String(mapped[0]?.id ?? ''),
          };
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setOptionsData((current) => ({
          ...current,
          vehicles: [],
          vehiclesLoading: false,
        }));
        setForm((current) => ({ ...current, idVeiculo: '' }));
      });

    return () => controller.abort();
  }, [form.idMotorista]);

  const solicitantes = useMemo(
    () =>
      optionsData.users.filter(
        (user) => user.status === 'Ativo' && (user.role === 'Servidor Solicitante' || user.role === 'Solicitante'),
      ),
    [optionsData.users],
  );

  const veiculosDisponiveis = useMemo(() => optionsData.vehicles, [optionsData.vehicles]);

  const selectedDriver = useMemo(
    () => optionsData.drivers.find((driver) => String(driver.id) === form.idMotorista) ?? null,
    [form.idMotorista, optionsData.drivers],
  );

  const currentSolicitante = useMemo(() => {
    const currentId = getCurrentSolicitanteId();
    if (!currentId) return null;

    const session = getAuthSession();
    return (
      solicitantes.find((user) => Number(user.id) === currentId) ?? {
        id: currentId,
        matricula: getCurrentSolicitanteMatricula() ?? session?.matricula ?? '',
        nome: session?.nome ?? 'Solicitante',
      }
    );
  }, [solicitantes]);

  useEffect(() => {
    if (!currentSolicitante) return;

    setCurrentSolicitante({
      id: currentSolicitante.id,
      matricula: currentSolicitante.matricula,
    });

    setForm((current) => ({
      ...current,
      idUsuario: String(currentSolicitante.id),
      matriculaSolicitante: currentSolicitante.matricula,
    }));
  }, [currentSolicitante]);

  const selectedVehicle = useMemo(
    () => veiculosDisponiveis.find((vehicle) => String(vehicle.id) === form.idVeiculo) ?? null,
    [form.idVeiculo, veiculosDisponiveis],
  );

  const origemCoords = useMemo(
    () => ({ lat: form.origemLat, lng: form.origemLng }),
    [form.origemLat, form.origemLng],
  );

  const destinoCoords = useMemo(
    () => ({ lat: form.destinoLat, lng: form.destinoLng }),
    [form.destinoLat, form.destinoLng],
  );

  const routeReady =
    geocodeStatus.origem === 'ok' &&
    geocodeStatus.destino === 'ok' &&
    form.destinoLat != null &&
    form.origemLat != null;

  useEffect(() => {
    if (geocodeStatus.origem !== 'ok' || geocodeStatus.destino !== 'ok') {
      setRoutePositions([]);
      setRouteMeta(null);
      setRouteStatus('idle');
      return undefined;
    }

    const requestId = ++routeRequestRef.current;
    const controller = new AbortController();
    setRouteStatus('loading');

    fetchDrivingRoute(origemCoords, destinoCoords, { signal: controller.signal })
      .then((route) => {
        if (requestId !== routeRequestRef.current) return;
        setRoutePositions(route.positions);
        setRouteMeta({ distanceKm: route.distanceKm, durationMin: route.durationMin });
        setRouteStatus('ok');
      })
      .catch((error) => {
        if (error.name === 'AbortError' || requestId !== routeRequestRef.current) return;
        setRoutePositions([
          [form.origemLat, form.origemLng],
          [form.destinoLat, form.destinoLng],
        ]);
        setRouteMeta(null);
        setRouteStatus('error');
      });

    return () => controller.abort();
  }, [
    destinoCoords,
    form.destinoLat,
    form.destinoLng,
    form.origemLat,
    form.origemLng,
    geocodeStatus.destino,
    geocodeStatus.origem,
    origemCoords,
  ]);

  useEffect(() => {
    applyOrigemPlace(getFleetGaragePlace());
  }, []);

  function applyOrigemPlace(place) {
    setForm((current) => ({
      ...current,
      origem: place.label,
      origemLat: place.lat,
      origemLng: place.lng,
    }));
    setGeocodeStatus((current) => ({ ...current, origem: 'ok' }));
    setGeocodeErrors((current) => ({ ...current, origem: null }));
  }

  function applyDestinoPlace(place) {
    setForm((current) => ({
      ...current,
      destino: place.label,
      destinoLat: place.lat,
      destinoLng: place.lng,
    }));
    setGeocodeStatus((current) => ({ ...current, destino: 'ok' }));
    setGeocodeErrors((current) => ({ ...current, destino: null }));
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setGaragemOrigem() {
    applyOrigemPlace(getFleetGaragePlace());
    setActiveMapPoint('destino');
  }

  const handleAddressPlaceFound = useCallback((place, point) => {
    if (point === 'origem') {
      applyOrigemPlace(place);
      setActiveMapPoint('destino');
    } else {
      applyDestinoPlace(place);
    }
  }, []);

  async function handleMapPointSelect(lat, lng) {
    const point = activeMapPoint;
    const requestId = ++reverseRequestRef.current;

    setGeocodeStatus((current) => ({ ...current, [point]: 'loading' }));
    setGeocodeErrors((current) => ({ ...current, [point]: null }));

    const applyCoords = (label) => {
      if (point === 'origem') {
        setForm((current) => ({
          ...current,
          origem: label,
          origemLat: lat,
          origemLng: lng,
        }));
      } else {
        setForm((current) => ({
          ...current,
          destino: label,
          destinoLat: lat,
          destinoLng: lng,
        }));
      }
    };

    try {
      const place = await reverseGeocode(lat, lng);
      if (requestId !== reverseRequestRef.current) return;

      if (point === 'origem') {
        applyOrigemPlace(place);
        setActiveMapPoint('destino');
      } else {
        applyDestinoPlace(place);
      }
      setGeocodeErrors((current) => ({ ...current, [point]: null }));
    } catch (error) {
      if (requestId !== reverseRequestRef.current) return;

      const fallbackLabel = `Local marcado (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
      applyCoords(fallbackLabel);
      setGeocodeStatus((current) => ({ ...current, [point]: 'ok' }));
      setGeocodeErrors((current) => ({
        ...current,
        [point]: error.message || 'Endereço aproximado; o ponto no mapa foi salvo.',
      }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (geocodeStatus.origem !== 'ok') {
      setSubmitState({
        loading: false,
        error: geocodeErrors.origem || 'Marque a origem no mapa.',
      });
      return;
    }
    if (geocodeStatus.destino !== 'ok') {
      setSubmitState({
        loading: false,
        error: geocodeErrors.destino || 'Marque o destino no mapa.',
      });
      return;
    }
    if (!form.justificativa.trim()) {
      setSubmitState({
        loading: false,
        error: 'Informe a justificativa da viagem.',
      });
      return;
    }

    setSubmitState({ loading: true, error: null });

    try {
      await criarReserva({
        idUsuario: Number(form.idUsuario),
        matriculaSolicitante: form.matriculaSolicitante.trim(),
        idMotorista: Number(form.idMotorista),
        idVeiculo: Number(form.idVeiculo),
        dataHoraInicioPrevista: toIsoDateTime(form.dataHoraInicioPrevista),
        dataHoraFimEstimada: toIsoDateTime(form.dataHoraFimEstimada),
        origem: form.origem.trim(),
        destino: form.destino.trim(),
        justificativa: form.justificativa.trim(),
        origemLat: form.origemLat,
        origemLng: form.origemLng,
        destinoLat: form.destinoLat,
        destinoLng: form.destinoLng,
      });

      navigate('/solicitante/reservas', {
        state: { flashMessage: 'Reserva enviada para análise do gestor de frota.' },
      });
    } catch (error) {
      setSubmitState({
        loading: false,
        error: error.message || 'Não foi possível salvar a reserva.',
      });
    }
  }

  return (
    <div className="page-stack requester-page">
      <PageHeader
        eyebrow="Área do solicitante"
        subtitle="Escolha o motorista e o veículo vinculado, depois informe o trajeto no mapa."
        title="Solicitar Nova Reserva"
      />

      <form className="requester-create-layout" onSubmit={handleSubmit}>
        <div className="requester-create-layout__form">
          <section className="requester-panel">
            <header className="requester-panel__head">
              <span className="requester-panel__step">1</span>
              <div>
                <h2>Motorista, veículo e período</h2>
                <p>Primeiro escolha o motorista; em seguida aparecem os veículos vinculados a ele.</p>
              </div>
            </header>

            {optionsData.loading ? (
              <div className="admin-dashboard__loading">
                <span className="admin-dashboard__spinner" aria-hidden="true" />
                <p>Carregando opções...</p>
              </div>
            ) : null}

            {optionsData.error ? (
              <div className="admin-dashboard__error">
                <Icon name="alert" />
                <p>{optionsData.error}</p>
              </div>
            ) : null}

            <div className="requester-solicitante-field">
              <span className="requester-solicitante-field__label">Solicitante</span>
              <div className="requester-solicitante-field__value">
                <strong>{currentSolicitante?.name ?? '—'}</strong>
                <span className="requester-solicitante-field__matricula">
                  {currentSolicitante?.matricula ?? form.matriculaSolicitante}
                </span>
              </div>
              <input name="idUsuario" type="hidden" value={form.idUsuario} />
              <input name="matriculaSolicitante" type="hidden" value={form.matriculaSolicitante} />
            </div>

            <h3 className="requester-section-title">Selecionar motorista</h3>
            <DriverPicker
              disabled={optionsData.loading || Boolean(optionsData.error)}
              drivers={optionsData.drivers}
              onSelect={(driverId) => updateField('idMotorista', String(driverId))}
              selectedId={form.idMotorista}
            />

            {form.idMotorista ? (
              <>
                <h3 className="requester-section-title">
                  Veículos de {selectedDriver?.name ?? 'motorista selecionado'}
                </h3>
                {optionsData.vehiclesLoading ? (
                  <div className="admin-dashboard__loading">
                    <span className="admin-dashboard__spinner" aria-hidden="true" />
                    <p>Carregando veículos vinculados...</p>
                  </div>
                ) : (
                  <VehicleTypePicker
                    disabled={optionsData.loading || Boolean(optionsData.error)}
                    onSelect={(vehicleId) => updateField('idVeiculo', String(vehicleId))}
                    selectedId={form.idVeiculo}
                    vehicles={veiculosDisponiveis}
                  />
                )}
              </>
            ) : null}

            <div className="requester-form-grid">
              <label className="form-field">
                <span>Início previsto</span>
                <input
                  onChange={(event) => updateField('dataHoraInicioPrevista', event.target.value)}
                  required
                  type="datetime-local"
                  value={form.dataHoraInicioPrevista}
                />
              </label>

              <label className="form-field">
                <span>Fim estimado</span>
                <input
                  onChange={(event) => updateField('dataHoraFimEstimada', event.target.value)}
                  required
                  type="datetime-local"
                  value={form.dataHoraFimEstimada}
                />
              </label>
            </div>

            <label className="form-field requester-justificativa-field">
              <span>Justificativa da viagem</span>
              <textarea
                maxLength={500}
                onChange={(event) => updateField('justificativa', event.target.value)}
                placeholder="Descreva o motivo do deslocamento (ex.: reunião, entrega de documentos, vistoria)"
                required
                rows={3}
                value={form.justificativa}
              />
            </label>
          </section>

          <section className="requester-panel">
            <header className="requester-panel__head">
              <span className="requester-panel__step">2</span>
              <div>
                <h2>Trajeto</h2>
                <p>Busque o endereço acima do mapa (com sugestões) ou clique no mapa para marcar A e B.</p>
              </div>
            </header>

            <div className="requester-route-fields">
              <label className="form-field requester-route-address">
                <span>Origem</span>
                <input
                  id="reserva-origem"
                  placeholder="Marque no mapa (aba Origem)"
                  readOnly
                  required
                  value={form.origem}
                />
                {geocodeStatus.origem === 'loading' ? (
                  <span className="requester-field-hint">Buscando endereço…</span>
                ) : null}
                {geocodeErrors.origem ? (
                  <span className="requester-field-hint requester-field-hint--error">{geocodeErrors.origem}</span>
                ) : null}
              </label>

              <label className="form-field requester-route-address">
                <span>Destino</span>
                <input
                  id="reserva-destino"
                  placeholder="Marque no mapa (aba Destino)"
                  readOnly
                  required
                  value={form.destino}
                />
                {geocodeStatus.destino === 'loading' ? (
                  <span className="requester-field-hint">Buscando endereço…</span>
                ) : null}
                {geocodeErrors.destino ? (
                  <span className="requester-field-hint requester-field-hint--error">{geocodeErrors.destino}</span>
                ) : null}
              </label>

              <button className="requester-link-btn" onClick={setGaragemOrigem} type="button">
                Usar Garagem Central
              </button>
            </div>
          </section>

          {submitState.error ? <div className="admin-user-create__error">{submitState.error}</div> : null}

          <div className="requester-form-actions">
            <ActionButton onClick={() => navigate('/solicitante/reservas')} type="button" variant="secondary">
              Voltar
            </ActionButton>
            <ActionButton
              disabled={
                optionsData.loading ||
                submitState.loading ||
                !routeReady ||
                !form.justificativa.trim() ||
                !form.idMotorista ||
                !form.idVeiculo ||
                !form.matriculaSolicitante ||
                !currentSolicitante ||
                veiculosDisponiveis.length === 0
              }
              icon="reservations"
              type="submit"
            >
              {submitState.loading ? 'Enviando...' : 'Enviar solicitação'}
            </ActionButton>
          </div>
        </div>

        <div className="requester-create-layout__map">
          <div className="requester-map-column">
            <RouteAddressSearch
              activePoint={activeMapPoint}
              disabled={optionsData.loading}
              onActivePointChange={setActiveMapPoint}
              onPlaceFound={handleAddressPlaceFound}
            />

            <RouteMapPicker
              activePoint={activeMapPoint}
              destinoCoords={destinoCoords}
              destinoLabel={form.destino}
              geocodeStatus={geocodeStatus}
              onActivePointChange={setActiveMapPoint}
              onMapClick={handleMapPointSelect}
              origemCoords={origemCoords}
              origemLabel={form.origem}
              routeMeta={routeMeta}
              routePositions={routePositions}
              routeStatus={routeStatus}
            />

            <aside className="requester-summary">
              <h3>Resumo da solicitação</h3>
              <dl>
                <div>
                  <dt>Solicitante</dt>
                  <dd>
                    {currentSolicitante
                      ? `${currentSolicitante.name} · ${currentSolicitante.matricula}`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Motorista</dt>
                  <dd>
                    {selectedDriver
                      ? `${selectedDriver.name} · ${selectedDriver.matricula}`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Veículo</dt>
                  <dd>
                    {selectedVehicle
                      ? `${selectedVehicle.vehicleTypeLabel} · ${selectedVehicle.plate} — ${selectedVehicle.model}`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Período</dt>
                  <dd>
                    {formatPreviewDateTime(form.dataHoraInicioPrevista)} →{' '}
                    {formatPreviewDateTime(form.dataHoraFimEstimada)}
                  </dd>
                </div>
                <div>
                  <dt>Justificativa</dt>
                  <dd>{form.justificativa.trim() || '—'}</dd>
                </div>
                <div>
                  <dt>Trajeto</dt>
                  <dd>
                    {form.origem || '—'} → {form.destino || '—'}
                  </dd>
                </div>
                <div>
                  <dt>Rota estimada</dt>
                  <dd>
                    {routeMeta?.distanceKm != null
                      ? `~${routeMeta.distanceKm.toFixed(1)} km${routeMeta.durationMin != null ? ` · ~${routeMeta.durationMin} min` : ''}`
                      : routeReady
                        ? 'Calculando…'
                        : 'Informe origem e destino'}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </form>
    </div>
  );
}
