import { Icon } from '../common/Icon';

export function FleetFilters({
  onSearchChange,
  onStatusChange,
  onTypeChange,
  search,
  searchPlaceholder = 'Buscar por placa, modelo ou tipo...',
  selectedStatus,
  selectedType = 'Todos',
  statusTabs,
  vehicleTypeTabs,
}) {
  return (
    <div className="fleet-filters">
      <label className="search-field" htmlFor="fleet-search">
        <Icon className="search-field__icon" name="search" />
        <input
          id="fleet-search"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          type="search"
          value={search}
        />
      </label>

      <div className="fleet-filters__toolbar">
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

        {vehicleTypeTabs?.length ? (
          <div className="fleet-filters__type-wrap">
            <span className="fleet-filters__type-label" id="fleet-type-label">
              Tipo
            </span>
            <label className="select-field fleet-filters__type" htmlFor="fleet-type">
              <select
                aria-labelledby="fleet-type-label"
                id="fleet-type"
                onChange={(event) => onTypeChange?.(event.target.value)}
                value={selectedType}
              >
                {vehicleTypeTabs.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </div>
    </div>
  );
}
