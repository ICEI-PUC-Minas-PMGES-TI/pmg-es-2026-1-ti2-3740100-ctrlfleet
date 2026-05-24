const VAN_REGEX = /(sprinter|ducato|master|daily|van|furgão|furgao|kombi|fiorino|partner|expert)/i;
const PICKUP_REGEX = /(hilux|sw4|ranger|amarok|s10|toro|frontier|strada|saveiro|l200|caminhonete|picape)/i;
const SUV_REGEX = /(duster|creta|t-cross|compass|renegade|tracker|nivus|sportage|hr-v|suv)/i;
const BUS_REGEX = /(of-1519|volare|apache|paradiso|torino|millennium|ônibus|onibus|busscar)/i;
const HATCH_REGEX = /(onix|hb20|corsa|march|gol|celta|fit|palio|polo|argo|mobi|kwid|sandero|ka|yaris|etios|up!|picanto)/i;

/** Imagens estáticas em `public/` (Vite serve na raiz `/`). */
export const VEHICLE_TYPE_PUBLIC_IMAGES = {
  sedan: '/sedan.jpg',
  hatch: '/hatch.png',
  suv: '/suv.png',
  van: '/van.png',
  onibus: '/onibus.png',
  caminhonete: '/caminhonete.png',
};

const TIPO_TO_IMAGE_KEY = {
  SEDAN: 'sedan',
  HATCH: 'hatch',
  SUV: 'suv',
  VAN: 'van',
  ONIBUS: 'onibus',
  CAMINHONETE: 'caminhonete',
};

export function inferVehicleImageType(vehicle) {
  const tipo = String(vehicle?.tipoVeiculo || '').toUpperCase();
  if (TIPO_TO_IMAGE_KEY[tipo]) return TIPO_TO_IMAGE_KEY[tipo];

  const text = `${vehicle?.marca || ''} ${vehicle?.model || ''}`.toLowerCase();
  if (BUS_REGEX.test(text)) return 'onibus';
  if (VAN_REGEX.test(text)) return 'van';
  if (PICKUP_REGEX.test(text)) return 'caminhonete';
  if (SUV_REGEX.test(text)) return 'suv';
  if (HATCH_REGEX.test(text)) return 'hatch';
  return 'sedan';
}

export function resolveVehicleTypeImageUrl(vehicle) {
  const imageKey = inferVehicleImageType(vehicle);
  return VEHICLE_TYPE_PUBLIC_IMAGES[imageKey] || VEHICLE_TYPE_PUBLIC_IMAGES.sedan;
}

function hasCustomImageUrl(vehicle) {
  const fromDto = vehicle?.imageUrl || vehicle?.urlImagem || vehicle?.fotoUrl;
  return typeof fromDto === 'string' && fromDto.trim().length > 0;
}

export function resolveVehicleImageUrl(vehicle) {
  if (hasCustomImageUrl(vehicle)) {
    const fromDto = vehicle.imageUrl || vehicle.urlImagem || vehicle.fotoUrl;
    return fromDto.trim();
  }
  return resolveVehicleTypeImageUrl(vehicle);
}

export function usesVehicleTypePlaceholderImage(vehicle) {
  return !hasCustomImageUrl(vehicle);
}
