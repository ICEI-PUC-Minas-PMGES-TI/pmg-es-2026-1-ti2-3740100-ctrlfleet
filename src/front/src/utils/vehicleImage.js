const VAN_REGEX = /(sprinter|ducato|master|daily|van|furgão|furgao|kombi)/i;
const SUV_REGEX = /(hilux|sw4|ranger|amarok|s10|toro|frontier|strada|duster|creta|t-cross|compass|renegade)/i;

export function inferVehicleImageType(vehicle) {
  const text = `${vehicle?.marca || ''} ${vehicle?.model || ''}`.toLowerCase();
  if (VAN_REGEX.test(text)) return 'van';
  if (SUV_REGEX.test(text)) return 'suv';
  return 'sedan';
}

export function resolveVehicleImageUrl(vehicle) {
  const fromDto = vehicle?.imageUrl || vehicle?.urlImagem || vehicle?.fotoUrl;
  if (typeof fromDto === 'string' && fromDto.trim().length > 0) {
    return fromDto.trim();
  }
  return null;
}
