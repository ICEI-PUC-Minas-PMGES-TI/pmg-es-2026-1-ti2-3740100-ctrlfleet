import { geocodePlace } from '../services/geocodingApi';
import { FLEET_GARAGE } from '../services/fleetMapLocations';

function toCoord(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function coordsFromReservation(reservation) {
  const origemLat = toCoord(reservation?.origemLat);
  const origemLng = toCoord(reservation?.origemLng);
  const destinoLat = toCoord(reservation?.destinoLat);
  const destinoLng = toCoord(reservation?.destinoLng);

  const origemCoords =
    origemLat != null && origemLng != null ? { lat: origemLat, lng: origemLng } : null;
  const destinoCoords =
    destinoLat != null && destinoLng != null ? { lat: destinoLat, lng: destinoLng } : null;

  return { origemCoords, destinoCoords };
}

function isGaragemCentral(origem) {
  return /garagem\s*central/i.test(String(origem || '').trim());
}

export async function resolveReservationCoords(
  { origem, destino, origemCoords, destinoCoords },
  options = {},
) {
  let resolvedOrigem = origemCoords;
  let resolvedDestino = destinoCoords;

  if (!resolvedOrigem?.lat) {
    if (isGaragemCentral(origem)) {
      resolvedOrigem = { lat: FLEET_GARAGE.lat, lng: FLEET_GARAGE.lng };
    } else if (origem?.trim()) {
      const result = await geocodePlace(origem, options);
      resolvedOrigem = { lat: result.lat, lng: result.lng };
    }
  }

  if (!resolvedDestino?.lat && destino?.trim()) {
    const result = await geocodePlace(destino, options);
    resolvedDestino = { lat: result.lat, lng: result.lng };
  }

  return { origemCoords: resolvedOrigem, destinoCoords: resolvedDestino };
}
