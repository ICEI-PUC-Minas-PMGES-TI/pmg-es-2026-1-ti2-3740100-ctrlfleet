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
    `${vehicle.marca || ''} ${vehicle.model || ''}`.toLowerCase().includes(term) ||
    (vehicle.vehicleTypeLabel || '').toLowerCase().includes(term) ||
    (vehicle.secretaria || '').toLowerCase().includes(term)
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

const DEFAULT_STATUS_TABS = ['Todos', 'Ativo', 'Manutenção', 'Inativo', 'Bloqueado'];

const DEFAULT_TYPE_TABS = ['Todos', 'Hatch', 'Sedan', 'SUV', 'Van', 'Ônibus', 'Caminhonete', 'Outros'];

export function buildFleetStatusTabs(vehicles, preferredOrder = DEFAULT_STATUS_TABS) {
  const present = new Set((vehicles || []).map((vehicle) => vehicle.status).filter(Boolean));
  return preferredOrder.filter((tab) => tab === 'Todos' || present.has(tab));
}

export function buildFleetTypeTabs(vehicles, preferredOrder = DEFAULT_TYPE_TABS) {
  const present = new Set((vehicles || []).map((vehicle) => vehicle.vehicleTypeLabel).filter(Boolean));
  const tabs = preferredOrder.filter((tab) => tab === 'Todos' || present.has(tab));
  const extras = [...present].filter((label) => !tabs.includes(label)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  return [...tabs, ...extras];
}

export function resolveFleetFilterSelection({ status, type, statusTabs, typeTabs }) {
  return {
    status: statusTabs.includes(status) ? status : 'Todos',
    type: typeTabs.includes(type) ? type : 'Todos',
  };
}

export function hasActiveFleetFilters({ search = '', status = 'Todos', type = 'Todos' } = {}) {
  return search.trim().length > 0 || status !== 'Todos' || type !== 'Todos';
}
