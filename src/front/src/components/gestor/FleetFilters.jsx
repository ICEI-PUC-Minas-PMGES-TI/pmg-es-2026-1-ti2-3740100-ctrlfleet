import { Icon } from '../common/Icon';

export function FleetFilters({
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onDateRangeChange,
  search,
  searchPlaceholder = 'Buscar por placa, modelo ou tipo...',
  selectedStatus,
  selectedType = 'Todos',
  selectedDateRange,
  statusTabs,
  vehicleTypeTabs,
  dateRangeTabs,
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
        {statusTabs?.length ? (
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
        ) : null}

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

        {dateRangeTabs?.length ? (
          <div className="fleet-filters__type-wrap">
            <span className="fleet-filters__type-label" id="fleet-date-range-label">
              Período
            </span>
            <label className="select-field fleet-filters__type" htmlFor="fleet-date-range">
              <select
                aria-labelledby="fleet-date-range-label"
                id="fleet-date-range"
                onChange={(event) => onDateRangeChange?.(event.target.value)}
                value={selectedDateRange}
              >
                {dateRangeTabs.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
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
