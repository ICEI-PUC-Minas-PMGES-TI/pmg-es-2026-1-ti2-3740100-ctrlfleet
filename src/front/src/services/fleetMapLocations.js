export const FLEET_GARAGE = {
  lat: -19.9167,
  lng: -43.9345,
  label: 'Garagem Central',
};

/** Ponto fixo da garagem no mapa de frota (mesmas coordenadas do pin 🏢). */
export function getFleetGaragePlace() {
  return {
    label: FLEET_GARAGE.label,
    lat: FLEET_GARAGE.lat,
    lng: FLEET_GARAGE.lng,
    displayName: FLEET_GARAGE.label,
    category: 'Garagem da frota',
  };
}

function garageOffset(vehicleId) {
  const id = Number(vehicleId) || 1;
  const angle = ((id * 53) % 360) * (Math.PI / 180);
  const radius = 0.00045 + (id % 4) * 0.00012;

  return {
    lat: FLEET_GARAGE.lat + radius * Math.cos(angle),
    lng: FLEET_GARAGE.lng + radius * Math.sin(angle),
    source: 'garage',
  };
}

/** Posiciona todos os veículos na garagem (modo simples até integrar reservas/rotas). */
export function applyGarageLocations(vehicles = []) {
  return vehicles.map((vehicle) => ({
    ...vehicle,
    location: garageOffset(vehicle.id),
    mapContext: {
      placeType: 'garage',
      label: FLEET_GARAGE.label,
    },
  }));
}
