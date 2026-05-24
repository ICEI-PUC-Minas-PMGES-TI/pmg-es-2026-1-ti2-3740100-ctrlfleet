import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../common/Icon';
import { StatusBadge } from '../common/StatusBadge';
import { statusTabs, vehicleTypeTabs } from '../../data/fleetData';
import { applyGarageLocations, FLEET_GARAGE } from '../../services/fleetMapLocations';
import {
  filterFleetVehicles,
  hasActiveFleetFilters,
} from '../../utils/fleetVehicleFilters';
import { resolveVehicleImageUrl } from '../../utils/vehicleImage';
import { FleetLeafletMap } from './FleetLeafletMap';
import { FleetMapVehicleDetail } from './FleetMapVehicleDetail';

function SummaryChip({ count, icon, label, modifier }) {
  return (
    <div className={`fleet-map-chip fleet-map-chip--${modifier}`}>
      <Icon name={icon} />
      <div>
        <strong>{count}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

export function FleetMapView({ variant = 'default', vehicles = [] }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');
  const isModal = variant === 'modal';

  const mapVehicles = useMemo(() => applyGarageLocations(vehicles), [vehicles]);

  const filteredList = useMemo(
    () =>
      filterFleetVehicles(mapVehicles, {
        search,
        status: selectedStatus,
        type: selectedType,
      }),
    [mapVehicles, search, selectedStatus, selectedType],
  );

  const activeFilters = hasActiveFleetFilters({
    search,
    status: selectedStatus,
    type: selectedType,
  });

  useEffect(() => {
    if (selectedVehicle && !filteredList.some((vehicle) => vehicle.id === selectedVehicle.id)) {
      setSelectedVehicle(null);
    }
  }, [filteredList, selectedVehicle]);

  function handleSelectVehicle(vehicle) {
    setSelectedVehicle(vehicle || null);
  }

  function clearFilters() {
    setSearch('');
    setSelectedStatus('Todos');
    setSelectedType('Todos');
  }

  if (vehicles.length === 0) {
    return (
      <div className="fleet-map-empty">
        <Icon name="map" />
        <p>Nenhum veículo cadastrado para exibir no mapa.</p>
      </div>
    );
  }

  return (
    <div className={`fleet-map-layout${isModal ? ' fleet-map-layout--modal' : ''}`}>
      {isModal ? (
        <div className="fleet-map-summary" aria-label="Resumo da frota">
          <SummaryChip count={mapVehicles.length} icon="fleet" label="Veículos" modifier="total" />
          <SummaryChip count={filteredList.length} icon="fleet" label="Exibidos" modifier="garage" />
        </div>
      ) : null}

      <div className="fleet-map-layout__main">
        <div className="fleet-map-layout__map">
          <div className="fleet-map-toolbar">
            <p className="fleet-map-toolbar__context">
              {filteredList.length === mapVehicles.length ? (
                <>
                  Todos os veículos em <strong>{FLEET_GARAGE.label}</strong>
                </>
              ) : (
                <>
                  <strong>{filteredList.length}</strong> de {mapVehicles.length} veículos em{' '}
                  <strong>{FLEET_GARAGE.label}</strong>
                </>
              )}{' '}
              · OpenStreetMap
            </p>
          </div>

          <FleetLeafletMap
            onSelectVehicle={handleSelectVehicle}
            selectedVehicle={selectedVehicle}
            vehicles={filteredList}
          />

          {selectedVehicle && !isModal ? (
            <div className="modal-overlay" style={{ zIndex: 1000 }}>
              <div className="modal-shell modal-shell--md" role="dialog" aria-modal="true">
                <FleetMapVehicleDetail onClose={() => setSelectedVehicle(null)} vehicle={selectedVehicle} />
              </div>
            </div>
          ) : null}

          <div className="fleet-map-legend" aria-label="Legenda do mapa">
            <span className="fleet-map-legend__item">
              <span className="fleet-map-legend__car fleet-map-legend__car--garage" />
              Garagem
            </span>
          </div>
        </div>

        <aside className="fleet-map-sidebar">
          <div className="fleet-map-sidebar__header">
            <div>
              <strong>Veículos na garagem</strong>
              <span className="fleet-map-sidebar__note">{FLEET_GARAGE.label}</span>
            </div>
          </div>

          <div className="fleet-map-sidebar__filters fleet-map-sidebar__filters--enhanced">
            <label className="search-field fleet-map-sidebar__search-field" htmlFor="fleet-map-search">
              <Icon className="search-field__icon" name="search" />
              <input
                id="fleet-map-search"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por placa, modelo, marca ou tipo..."
                type="search"
                value={search}
              />
            </label>

            <div aria-label="Filtrar por status" className="fleet-map-sidebar__tabs" role="tablist">
              {statusTabs.map((tab) => (
                <button
                  aria-pressed={selectedStatus === tab}
                  className={`fleet-map-sidebar__tab ${selectedStatus === tab ? 'is-active' : ''}`}
                  key={tab}
                  onClick={() => setSelectedStatus(tab)}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="fleet-map-sidebar__type-row">
              <span className="fleet-map-sidebar__type-label" id="fleet-map-type-label">
                Tipo
              </span>
              <label className="select-field fleet-map-sidebar__type-select" htmlFor="fleet-map-type">
                <select
                  aria-labelledby="fleet-map-type-label"
                  id="fleet-map-type"
                  onChange={(event) => setSelectedType(event.target.value)}
                  value={selectedType}
                >
                  {vehicleTypeTabs.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="fleet-map-sidebar__filter-meta">
              <span className="fleet-map-sidebar__filter-count">
                <Icon name="fleet" />
                {filteredList.length} de {mapVehicles.length} no mapa
              </span>
              {activeFilters ? (
                <button className="fleet-map-sidebar__clear" onClick={clearFilters} type="button">
                  Limpar filtros
                </button>
              ) : null}
            </div>
          </div>

          <ul className="fleet-map-vehicle-list">
            {filteredList.length === 0 ? (
              <li className="fleet-map-vehicle-list__empty">
                <Icon name="search" />
                <p>Nenhum veículo encontrado com os filtros atuais.</p>
                {activeFilters ? (
                  <button className="fleet-map-sidebar__clear" onClick={clearFilters} type="button">
                    Limpar filtros
                  </button>
                ) : null}
              </li>
            ) : (
              filteredList.map((vehicle) => (
                <li key={vehicle.id}>
                  <button
                    className={[
                      'fleet-map-vehicle-list__item',
                      selectedVehicle?.id === vehicle.id ? 'fleet-map-vehicle-list__item--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleSelectVehicle(vehicle)}
                    type="button"
                  >
                    <img
                      alt=""
                      className="fleet-map-vehicle-list__thumb"
                      loading="lazy"
                      src={resolveVehicleImageUrl(vehicle)}
                    />
                    <div className="fleet-map-vehicle-list__main">
                      <span className="fleet-map-vehicle-list__plate">{vehicle.plate}</span>
                      <span className="fleet-map-vehicle-list__model">{vehicle.model}</span>
                      {vehicle.vehicleTypeLabel ? (
                        <span className="fleet-map-vehicle-list__type">{vehicle.vehicleTypeLabel}</span>
                      ) : null}
                    </div>
                    <StatusBadge label={vehicle.status} />
                  </button>
                </li>
              ))
            )}
          </ul>

          <div className="fleet-map-sidebar__detail">
            {selectedVehicle ? (
              <FleetMapVehicleDetail onClose={() => setSelectedVehicle(null)} vehicle={selectedVehicle} />
            ) : (
              <div className="fleet-map-sidebar__placeholder">
                <Icon name="fleet" />
                <p>Selecione um veículo na lista ou no mapa para ver placa, status e coordenadas.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
