import { FLEET_GARAGE } from './fleetMapLocations';

/** Em dev o Vite faz proxy para evitar CORS; em produção use reverse proxy nos mesmos paths. */
const GEOCODE_VIA_PROXY =
  import.meta.env.VITE_GEOCODE_PROXY === 'true' || import.meta.env.DEV;

const PHOTON_URL = GEOCODE_VIA_PROXY ? '/geocode/photon/' : 'https://photon.komoot.io/api/';
const NOMINATIM_URL = GEOCODE_VIA_PROXY
  ? '/geocode/nominatim/search'
  : 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = GEOCODE_VIA_PROXY
  ? '/geocode/nominatim/reverse'
  : 'https://nominatim.openstreetmap.org/reverse';
const OSRM_URL = GEOCODE_VIA_PROXY
  ? '/routing/osrm/route/v1/driving'
  : 'https://router.project-osrm.org/route/v1/driving';

const GEOCODE_HEADERS = {
  Accept: 'application/json',
  'Accept-Language': 'pt-BR',
  'User-Agent': 'CtrlFleet/1.0 (fleet reservation app)',
};

/** Região metropolitana de Belo Horizonte */
const BH_BBOX = '-44.12,-20.12,-43.82,-19.72';

const AMENITY_LABELS = {
  bank: 'Banco',
  cafe: 'Café',
  cinema: 'Cinema',
  clinic: 'Clínica',
  college: 'Faculdade',
  community_centre: 'Centro comunitário',
  courthouse: 'Fórum',
  embassy: 'Embaixada',
  fuel: 'Posto',
  government: 'Órgão público',
  hospital: 'Hospital',
  library: 'Biblioteca',
  marketplace: 'Mercado',
  parking: 'Estacionamento',
  pharmacy: 'Farmácia',
  place_of_worship: 'Templo',
  police: 'Polícia',
  post_office: 'Correios',
  restaurant: 'Restaurante',
  school: 'Escola',
  theatre: 'Teatro',
  townhall: 'Prefeitura',
  university: 'Universidade',
};

const SHOP_LABELS = {
  mall: 'Shopping',
  supermarket: 'Supermercado',
  convenience: 'Mercadinho',
  department_store: 'Loja de departamento',
  clothes: 'Loja de roupas',
  electronics: 'Eletrônicos',
  hardware: 'Material de construção',
  bakery: 'Padaria',
  beauty: 'Beleza',
  books: 'Livraria',
  chemist: 'Drogaria',
  furniture: 'Móveis',
  gift: 'Presentes',
  jewelry: 'Joalheria',
  pet: 'Pet shop',
  sports: 'Esportes',
  travel_agency: 'Agência de viagens',
};

const TOURISM_LABELS = {
  hotel: 'Hotel',
  museum: 'Museu',
  attraction: 'Atração',
  viewpoint: 'Mirante',
};

function buildSearchQuery(query) {
  const trimmed = query.trim();
  if (/belo horizonte|minas gerais|brasil/i.test(trimmed)) return trimmed;
  return `${trimmed}, Belo Horizonte, Minas Gerais, Brasil`;
}

function resolvePlaceCategory({ osmKey, osmValue, type, name }) {
  if (osmKey === 'shop' && osmValue) return SHOP_LABELS[osmValue] || 'Comércio';
  if (osmKey === 'amenity' && osmValue) return AMENITY_LABELS[osmValue] || 'Estabelecimento';
  if (osmKey === 'tourism' && osmValue) return TOURISM_LABELS[osmValue] || 'Turismo';
  if (osmKey === 'leisure') return 'Lazer';
  if (osmKey === 'office') return 'Escritório';
  if (osmKey === 'building' && name) return 'Edifício';
  if (osmKey === 'historic') return 'Patrimônio';
  if (type === 'street' || osmKey === 'highway') return 'Rua';
  if (type === 'house') return 'Endereço';
  if (name) return 'Local';
  return null;
}

function formatShortLabel(item) {
  const address = item.address || {};
  const primary =
    address.university ||
    address.amenity ||
    address.shop ||
    address.building ||
    address.office ||
    address.tourism ||
    address.leisure ||
    address.historic ||
    address.suburb ||
    address.neighbourhood ||
    address.road ||
    address.city_district;

  if (primary) {
    const secondary = address.suburb || address.neighbourhood || address.city || address.town;
    return secondary ? `${primary}, ${secondary}` : primary;
  }

  return item.display_name.split(',')[0].trim();
}

function formatSubtitle(item) {
  const parts = item.display_name.split(',').map((part) => part.trim());
  if (parts.length <= 1) return parts[0] || '';
  return parts.slice(1, 4).join(', ');
}

function mapPhotonFeature(feature) {
  const [lng, lat] = feature.geometry.coordinates;
  const props = feature.properties || {};
  const label =
    props.name ||
    (props.street && props.housenumber ? `${props.street}, ${props.housenumber}` : props.street) ||
    props.city ||
    'Local';

  const subtitleParts = [
    props.street && props.housenumber ? `${props.street}, ${props.housenumber}` : props.street,
    props.district || props.suburb,
    props.city,
    props.state,
  ].filter(Boolean);

  const category = resolvePlaceCategory({
    osmKey: props.osm_key,
    osmValue: props.osm_value,
    type: props.type,
    name: props.name,
  });

  return {
    id: `photon-${props.osm_id ?? 'x'}-${lat.toFixed(5)}-${lng.toFixed(5)}`,
    label,
    subtitle: subtitleParts.join(' · '),
    lat: Number(lat),
    lng: Number(lng),
    displayName: [props.name, props.street, props.city, props.state, props.country].filter(Boolean).join(', '),
    category,
    source: 'photon',
  };
}

export function mapNominatimResult(item) {
  const address = item.address || {};
  const category = resolvePlaceCategory({
    osmKey: item.class,
    osmValue: item.type,
    type: item.type,
    name: item.namedetails?.name || formatShortLabel(item),
  });

  return {
    id: `nominatim-${item.place_id ?? item.osm_id ?? item.display_name}`,
    label: formatShortLabel(item),
    subtitle: formatSubtitle(item),
    lat: Number(item.lat),
    lng: Number(item.lon),
    displayName: item.display_name,
    category:
      category ||
      (address.shop ? 'Comércio' : address.amenity ? 'Estabelecimento' : address.road ? 'Rua' : 'Local'),
    source: 'nominatim',
  };
}

function scorePlace(place, query) {
  const normalizedQuery = query.trim().toLowerCase();
  let score = 0;

  if (place.category && place.category !== 'Rua' && place.category !== 'Endereço') score += 12;
  if (place.source === 'photon' && place.category) score += 4;
  if (place.label.toLowerCase().includes(normalizedQuery)) score += 8;

  const tokens = normalizedQuery.split(/\s+/).filter((token) => token.length > 2);
  tokens.forEach((token) => {
    if (place.label.toLowerCase().includes(token)) score += 3;
    if (place.subtitle?.toLowerCase().includes(token)) score += 1;
  });

  return score;
}

function dedupePlaces(places) {
  const seen = new Map();

  places.forEach((place) => {
    const key = `${place.label.toLowerCase()}|${place.lat.toFixed(4)}|${place.lng.toFixed(4)}`;
    const existing = seen.get(key);
    if (!existing || scorePlace(place, place.label) > scorePlace(existing, existing.label)) {
      seen.set(key, place);
    }
  });

  return [...seen.values()];
}

async function searchPlacesPhoton(query, options = {}) {
  const params = new URLSearchParams({
    q: query.trim(),
    lat: String(FLEET_GARAGE.lat),
    lon: String(FLEET_GARAGE.lng),
    limit: String(options.limit ?? 10),
    bbox: BH_BBOX,
  });

  try {
    const response = await fetch(`${PHOTON_URL}?${params}`, { signal: options.signal });
    if (!response.ok) return [];

    const data = await response.json();
    if (!Array.isArray(data?.features)) return [];

    return data.features.map(mapPhotonFeature);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    return [];
  }
}

async function searchPlacesNominatim(query, options = {}) {
  const params = new URLSearchParams({
    q: buildSearchQuery(query),
    format: 'json',
    addressdetails: '1',
    extratags: '1',
    namedetails: '1',
    limit: String(options.limit ?? 6),
    countrycodes: 'br',
    viewbox: '-44.12,-19.72,-43.82,-20.12',
    bounded: '0',
  });

  try {
    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: GEOCODE_HEADERS,
      signal: options.signal,
    });

    if (!response.ok) return [];

    const results = await response.json();
    if (!Array.isArray(results)) return [];

    return results.map(mapNominatimResult);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    return [];
  }
}

export async function searchPlaces(query, options = {}) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const limit = options.limit ?? 10;

  const [photonResult, nominatimResult] = await Promise.allSettled([
    searchPlacesPhoton(trimmed, { ...options, limit: limit + 4 }),
    searchPlacesNominatim(trimmed, { ...options, limit: Math.ceil(limit / 2) }),
  ]);

  const photonItems = photonResult.status === 'fulfilled' ? photonResult.value : [];
  const nominatimItems = nominatimResult.status === 'fulfilled' ? nominatimResult.value : [];
  const bothProvidersFailed =
    photonResult.status === 'rejected' && nominatimResult.status === 'rejected';

  if (photonItems.length === 0 && nominatimItems.length === 0) {
    if (bothProvidersFailed) {
      throw new Error('Serviço de busca indisponível. Verifique sua conexão e tente novamente.');
    }
    throw new Error('Nenhum local encontrado. Tente outro termo de busca.');
  }

  const merged = dedupePlaces([...photonItems, ...nominatimItems])
    .sort((a, b) => scorePlace(b, trimmed) - scorePlace(a, trimmed))
    .slice(0, limit);

  return merged;
}

export async function geocodePlace(query, options = {}) {
  const suggestions = await searchPlaces(query, { ...options, limit: 1 });
  if (!suggestions.length) {
    throw new Error('Local não encontrado. Escolha uma opção da lista ou refine a busca.');
  }

  const match = suggestions[0];
  return {
    lat: match.lat,
    lng: match.lng,
    displayName: match.displayName,
    label: match.label,
  };
}

function formatReverseLabel(data) {
  const address = data?.address ?? {};
  const poiName =
    data?.name ||
    address.amenity ||
    address.shop ||
    address.tourism ||
    address.leisure ||
    address.office ||
    address.building;

  const street = [address.road || address.pedestrian || address.footway, address.house_number]
    .filter(Boolean)
    .join(', ');

  const district = address.suburb || address.neighbourhood || address.quarter;
  const city = address.city || address.town || address.municipality || address.village;

  const parts = [];
  if (poiName) parts.push(poiName);
  if (street && street !== poiName) parts.push(street);
  if (district && !parts.includes(district)) parts.push(district);
  if (city && !parts.includes(city)) parts.push(city);

  if (parts.length) return parts.join(' · ');
  if (data?.display_name) {
    return data.display_name.split(',').slice(0, 3).join(', ').trim();
  }
  return 'Local marcado no mapa';
}

export async function reverseGeocode(lat, lng, options = {}) {
  if (lat == null || lng == null) {
    throw new Error('Coordenadas inválidas para buscar o endereço.');
  }

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
    addressdetails: '1',
    zoom: '18',
  });

  const response = await fetch(`${NOMINATIM_REVERSE_URL}?${params}`, {
    headers: GEOCODE_HEADERS,
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error('Não foi possível obter o endereço do ponto marcado.');
  }

  const data = await response.json();
  if (!data || data.error) {
    throw new Error('Endereço não encontrado para este ponto no mapa.');
  }

  return {
    lat,
    lng,
    label: formatReverseLabel(data),
    displayName: data.display_name ?? formatReverseLabel(data),
  };
}

export async function fetchDrivingRoute(origin, destination, options = {}) {
  if (origin?.lat == null || origin?.lng == null || destination?.lat == null || destination?.lng == null) {
    return { positions: [], distanceKm: null, durationMin: null };
  }

  const path = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const params = new URLSearchParams({
    overview: 'full',
    geometries: 'geojson',
    steps: 'false',
  });

  const response = await fetch(`${OSRM_URL}/${path}?${params}`, { signal: options.signal });
  if (!response.ok) {
    throw new Error('Não foi possível calcular a rota entre origem e destino.');
  }

  const data = await response.json();
  const route = data?.routes?.[0];
  const coordinates = route?.geometry?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return {
      positions: [
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ],
      distanceKm: null,
      durationMin: null,
    };
  }

  return {
    positions: coordinates.map(([lng, lat]) => [lat, lng]),
    distanceKm: route.distance ? route.distance / 1000 : null,
    durationMin: route.duration ? Math.round(route.duration / 60) : null,
  };
}

