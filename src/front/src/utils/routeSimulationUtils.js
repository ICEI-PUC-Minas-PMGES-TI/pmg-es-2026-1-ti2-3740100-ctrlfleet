import { parseReservaDateTime } from './motoristaReservaUtils';

/** Distância em metros entre dois pontos { lat, lng }. */
export function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Comprimento total da polyline [[lat,lng], ...] em metros. */
export function polylineLengthMeters(positions) {
  if (!positions?.length || positions.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < positions.length; i += 1) {
    const [lat1, lng1] = positions[i - 1];
    const [lat2, lng2] = positions[i];
    total += haversineMeters({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 });
  }
  return total;
}

/** Direção em graus (0–360) ao longo da rota no progresso informado. */
export function bearingAlongRoute(positions, progress) {
  if (!positions?.length) return 0;
  const epsilon = 0.008;
  const p1 = positionAlongRoute(positions, Math.max(0, progress - epsilon));
  const p2 = positionAlongRoute(positions, Math.min(1, progress + epsilon));
  if (!p1 || !p2) return 0;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  const dLng = toRad(p2.lng - p1.lng);
  const lat1 = toRad(p1.lat);
  const lat2 = toRad(p2.lat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Posição interpolada (0–1) ao longo da rota. */
export function positionAlongRoute(positions, progress) {
  if (!positions?.length) return null;
  if (positions.length === 1) {
    const [lat, lng] = positions[0];
    return { lat, lng };
  }

  const t = Math.min(1, Math.max(0, progress));
  const segments = [];
  let total = 0;
  for (let i = 1; i < positions.length; i += 1) {
    const [lat1, lng1] = positions[i - 1];
    const [lat2, lng2] = positions[i];
    const len = haversineMeters({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 });
    segments.push({ lat1, lng1, lat2, lng2, len });
    total += len;
  }
  if (total <= 0) {
    const [lat, lng] = positions[positions.length - 1];
    return { lat, lng };
  }

  let target = t * total;
  for (const seg of segments) {
    if (target <= seg.len) {
      const ratio = seg.len > 0 ? target / seg.len : 0;
      return {
        lat: seg.lat1 + (seg.lat2 - seg.lat1) * ratio,
        lng: seg.lng1 + (seg.lng2 - seg.lng1) * ratio,
      };
    }
    target -= seg.len;
  }
  const last = positions[positions.length - 1];
  return { lat: last[0], lng: last[1] };
}

/** Duração da simulação em ms (20s–90s, proporcional à rota OSRM). */
export function simulationDurationMs(osrmDurationMin) {
  if (osrmDurationMin != null && osrmDurationMin > 0) {
    const compressed = osrmDurationMin * 60 * 1000 * 0.08;
    return Math.min(90000, Math.max(20000, compressed));
  }
  return 45000;
}

export function formatDurationMs(ms) {
  if (ms == null || !Number.isFinite(ms)) return '—';
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec}s`;
  return `${min} min ${sec}s`;
}

/** Duração legível em horas (ex.: viagem de 9 h 15 min). */
export function formatDurationHours(ms) {
  if (ms == null || !Number.isFinite(ms)) return '—';
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins} min`;
}

export function formatDurationMinutes(minutes) {
  if (minutes == null || !Number.isFinite(minutes)) return '—';
  return formatDurationHours(minutes * 60 * 1000);
}

/** Tempo previsto da reserva (chegada − saída) em minutos. */
export function reservationPlannedDurationMin(reserva) {
  const start = parseReservaDateTime(reserva?.dataHoraInicioPrevista)?.getTime() ?? null;
  const end = parseReservaDateTime(reserva?.dataHoraFimEstimada)?.getTime() ?? null;
  if (start == null || end == null || end <= start) return null;
  return Math.round((end - start) / 60000);
}

/** Distância ida e volta (2× a rota A→B). */
export function roundTripDistanceKm(oneWayKm) {
  const oneWay = Number(oneWayKm) || 0;
  return Math.round(oneWay * 2 * 10) / 10;
}

export function reverseRoutePositions(positions) {
  if (!positions?.length) return [];
  return [...positions].reverse();
}

/** Distância da rota em km (OSRM ou polyline). */
export function resolveRouteDistanceKm(routeDistanceKm, routePositions) {
  if (routeDistanceKm != null && Number.isFinite(routeDistanceKm) && routeDistanceKm > 0) {
    return routeDistanceKm;
  }
  const meters = polylineLengthMeters(routePositions);
  if (meters > 0) {
    return Math.round((meters / 1000) * 10) / 10;
  }
  return 0;
}

/** Hodômetro de retorno = saída + distância percorrida na rota. */
export function calculateReturnMileage(kmSaida, distanceKm) {
  if (kmSaida == null || !Number.isFinite(kmSaida)) return null;
  const dist = Number(distanceKm) || 0;
  return Math.round((kmSaida + dist) * 10) / 10;
}

export function buildTripSummary({
  reserva,
  routeDistanceKm,
  oneWayDistanceKm,
  routeDurationMin,
  tripStartedAt,
  tripEndedAt,
}) {
  const actualMs = tripEndedAt - tripStartedAt;
  const osrmEstMin = routeDurationMin;
  const plannedMin = reservationPlannedDurationMin(reserva);
  const estimatedMin = osrmEstMin ?? plannedMin;

  let deltaLabel = '—';
  if (estimatedMin != null && actualMs > 0) {
    const actualMin = actualMs / 60000;
    const diff = actualMin - estimatedMin;
    const abs = Math.abs(diff);
    if (abs < 1) deltaLabel = 'No previsto';
    else if (diff > 0) deltaLabel = `${Math.round(abs)} min acima do estimado`;
    else deltaLabel = `${Math.round(abs)} min abaixo do estimado`;
  }

  return {
    origem: reserva?.origem || '—',
    destino: reserva?.destino || '—',
    placa: reserva?.placaVeiculo || '—',
    veiculo: reserva?.modeloVeiculo || '—',
    distanceKm: routeDistanceKm,
    oneWayDistanceKm: oneWayDistanceKm ?? routeDistanceKm,
    roundTrip: oneWayDistanceKm != null && oneWayDistanceKm !== routeDistanceKm,
    tempoEstimadoMin: estimatedMin,
    tempoEstimadoLabel: formatDurationMinutes(estimatedMin),
    tempoRealMs: actualMs,
    tempoRealLabel: formatDurationMs(actualMs),
    deltaLabel,
    plannedWindowLabel:
      plannedMin != null ? `${plannedMin} min (janela da reserva)` : null,
    osrmLabel: osrmEstMin != null ? `${osrmEstMin} min (rota no mapa)` : null,
  };
}
