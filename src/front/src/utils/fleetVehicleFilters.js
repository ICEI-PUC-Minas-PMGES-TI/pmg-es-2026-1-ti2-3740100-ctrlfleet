export function filterByStatus(vehicle, status) {
  if (status === 'Todos') return true;
  return vehicle.status === status;
}

export function filterByType(vehicle, type) {
  if (type === 'Todos') return true;
  return vehicle.vehicleTypeLabel === type;
}

export function matchesFleetVehicleSearch(vehicle, searchTerm) {
  const term = searchTerm.trim().toLowerCase();
  if (term.length === 0) return true;

  const plate = (vehicle.plate || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const termPlate = term.replace(/[^a-z0-9]/g, '');

  return (
    (vehicle.plate || '').toLowerCase().includes(term) ||
    (termPlate.length > 0 && plate.includes(termPlate)) ||
    (vehicle.model || '').toLowerCase().includes(term) ||
    (vehicle.marca || '').toLowerCase().includes(term) ||
    (vehicle.vehicleTypeLabel || '').toLowerCase().includes(term)
  );
}

export function filterFleetVehicles(vehicles, { search = '', status = 'Todos', type = 'Todos' } = {}) {
  return vehicles.filter(
    (vehicle) =>
      matchesFleetVehicleSearch(vehicle, search) &&
      filterByStatus(vehicle, status) &&
      filterByType(vehicle, type),
  );
}

export function hasActiveFleetFilters({ search = '', status = 'Todos', type = 'Todos' } = {}) {
  return search.trim().length > 0 || status !== 'Todos' || type !== 'Todos';
}
