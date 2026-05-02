import { Icon } from '../common/Icon';

export function FleetFilters({
  onSearchChange,
  onSecretariatChange,
  onStatusChange,
  search,
  secretariat,
  secretariats,
  selectedStatus,
  statusTabs,
}) {
  return (
    <div className="fleet-filters">
      <label className="search-field" htmlFor="fleet-search">
        <Icon className="search-field__icon" name="search" />
        <input
          id="fleet-search"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por placa ou modelo..."
          type="search"
          value={search}
        />
      </label>

      <div aria-label="Filtrar por status" className="filter-tabs" role="tablist">
        {statusTabs.map((tab) => (
          <button
            aria-pressed={selectedStatus === tab}
            className={`filter-tab ${selectedStatus === tab ? 'is-active' : ''}`}
            key={tab}
            onClick={() => onStatusChange(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <label className="select-field" htmlFor="fleet-secretariat">
        <span className="sr-only">Secretaria</span>
        <select id="fleet-secretariat" onChange={(event) => onSecretariatChange(event.target.value)} value={secretariat}>
          {secretariats.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
