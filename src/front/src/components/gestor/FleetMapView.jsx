import { useMemo, useState } from 'react';
import { Icon } from '../common/Icon';
import { StatusBadge } from '../common/StatusBadge';
import { applyGarageLocations, FLEET_GARAGE } from '../../services/fleetMapLocations';
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
  const isModal = variant === 'modal';

  const mapVehicles = useMemo(() => applyGarageLocations(vehicles), [vehicles]);

  const filteredList = useMemo(() => {
    const term = search.trim().toLowerCase();
    return mapVehicles.filter((vehicle) => {
      if (term.length === 0) return true;
      return (
        (vehicle.plate || '').toLowerCase().includes(term) ||
        (vehicle.model || '').toLowerCase().includes(term)
      );
    });
  }, [mapVehicles, search]);

  function handleSelectVehicle(vehicle) {
    setSelectedVehicle(vehicle || null);
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
          <SummaryChip count={mapVehicles.length} icon="fleet" label="Na garagem" modifier="garage" />
        </div>
      ) : null}

      <div className="fleet-map-layout__main">
        <div className="fleet-map-layout__map">
          <div className="fleet-map-toolbar">
            <p className="fleet-map-toolbar__context">
              Todos os veículos em <strong>{FLEET_GARAGE.label}</strong> · OpenStreetMap
            </p>
          </div>

          <FleetLeafletMap
            onSelectVehicle={handleSelectVehicle}
            selectedVehicle={selectedVehicle}
            vehicles={mapVehicles}
          />

          {selectedVehicle ? (
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
              <strong>Veículos ({filteredList.length})</strong>
              <span className="fleet-map-sidebar__note">{FLEET_GARAGE.label}</span>
            </div>
          </div>

          <div className="fleet-map-sidebar__filters">
            <label className="fleet-map-sidebar__search">
              <Icon name="search" />
              <input
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar placa ou modelo"
                type="search"
                value={search}
              />
            </label>
          </div>

          <ul className="fleet-map-vehicle-list">
            {filteredList.length === 0 ? (
              <li className="fleet-map-vehicle-list__empty">Nenhum veículo encontrado.</li>
            ) : (
              filteredList.map((vehicle) => (
                <li key={vehicle.id}>
                  <button
                    className={[
                      'fleet-map-vehicle-list__item',
                      selectedVehicle?.id === vehicle.id ? 'fleet-map-vehicle-list__item--active' : '',
                      'fleet-map-vehicle-list__item--garage',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleSelectVehicle(vehicle)}
                    type="button"
                  >
                    <span className="fleet-map-vehicle-list__dot fleet-map-vehicle-list__dot--garage" />
                    <div className="fleet-map-vehicle-list__main">
                      <span className="fleet-map-vehicle-list__plate">{vehicle.plate}</span>
                      <span className="fleet-map-vehicle-list__model">Garagem</span>
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
