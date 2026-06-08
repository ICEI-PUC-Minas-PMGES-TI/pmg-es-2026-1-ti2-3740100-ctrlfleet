import { bearingAlongRoute, positionAlongRoute, reverseRoutePositions } from '../utils/routeSimulationUtils';
import { resolveLiveTripProgress } from '../utils/fleetActiveTripsStorage';

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

function normalizePlate(plate) {
  return String(plate || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function findTripForVehicle(vehicle, activeTrips) {
  if (!activeTrips?.length) return null;
  return (
    activeTrips.find((trip) => String(trip.vehicleId) === String(vehicle.id)) ||
    activeTrips.find((trip) => normalizePlate(trip.placaVeiculo) === normalizePlate(vehicle.plate)) ||
    null
  );
}

/**
 * Sobrepõe veículos em corrida ativa (sincronizados via localStorage) sobre a garagem padrão.
 */
export function applyActiveTripsToFleetVehicles(vehicles = [], activeTrips = []) {
  return applyGarageLocations(vehicles).map((vehicle) => {
    const trip = findTripForVehicle(vehicle, activeTrips);
    if (!trip) return vehicle;

    const progress = resolveLiveTripProgress(trip);
    const isReturnLeg =
      trip.tripLeg === 'return' ||
      trip.status === 'returning' ||
      trip.status === 'returned' ||
      trip.status === 'awaiting_checklist';
    const routeForPosition = isReturnLeg
      ? reverseRoutePositions(trip.routePositions)
      : trip.routePositions;
    let position = null;

    if (routeForPosition?.length) {
      position = positionAlongRoute(routeForPosition, progress);
    } else if (trip.origemCoords?.lat != null) {
      position = trip.origemCoords;
    }

    if (!position) return vehicle;

    const bearing = routeForPosition?.length
      ? bearingAlongRoute(routeForPosition, progress)
      : 0;
    const isAwaitingChecklist = trip.status === 'awaiting_checklist';
    const isAtOrigin = trip.status === 'returned' || isAwaitingChecklist;
    const isAtDestination = trip.status === 'arrived';

    let mapLabel;
    let reservationStatus;
    if (isAwaitingChecklist) {
      mapLabel = `Na origem · aguardando checklist · ${trip.origem || '—'}`;
      reservationStatus = 'Aguardando checklist';
    } else if (isAtOrigin) {
      mapLabel = `Na origem A · ${trip.origem || '—'}`;
      reservationStatus = 'Na origem';
    } else if (isAtDestination) {
      mapLabel = `No destino B · aguardando volta · ${trip.destino || '—'}`;
      reservationStatus = 'No destino B';
    } else if (isReturnLeg) {
      mapLabel = `Volta · ${trip.destino || '—'} → ${trip.origem || '—'}`;
      reservationStatus = 'Volta para A';
    } else {
      mapLabel = `Ida · ${trip.origem || '—'} → ${trip.destino || '—'}`;
      reservationStatus = 'Indo para B';
    }

    return {
      ...vehicle,
      location: { lat: position.lat, lng: position.lng, source: 'route' },
      routeBearing: bearing,
      activeTrip: trip,
      mapContext: {
        placeType: 'driving',
        label: mapLabel,
        reservation: {
          id: trip.reservaId,
          status: reservationStatus,
          motorista: trip.motoristaNome || 'Motorista',
          inicio: trip.origem,
          fim: trip.destino,
        },
        simulation: {
          progress,
          start: {
            label: trip.origem || 'Origem',
            lat: trip.origemCoords?.lat ?? trip.routePositions?.[0]?.[0] ?? null,
            lng: trip.origemCoords?.lng ?? trip.routePositions?.[0]?.[1] ?? null,
          },
          end: {
            label: trip.destino || 'Destino',
            lat: trip.destinoCoords?.lat ?? trip.routePositions?.at(-1)?.[0] ?? null,
            lng: trip.destinoCoords?.lng ?? trip.routePositions?.at(-1)?.[1] ?? null,
          },
        },
      },
    };
  });
}
