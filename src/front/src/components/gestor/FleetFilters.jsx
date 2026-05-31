import { Icon } from '../common/Icon';

function FilterControlGroup({ children, label, labelId }) {
  return (
    <div className="fleet-filters__control">
      <span className="fleet-filters__control-label" id={labelId}>
        {label}
      </span>
      {children}
    </div>
  );
}

export function FleetFilters({
  className = '',
  controlIdPrefix = 'fleet',
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onDateRangeChange,
  onSortOrderChange,
  onViewModeChange,
  search,
  searchPlaceholder = 'Buscar por placa, modelo ou tipo...',
  selectedStatus,
  selectedType = 'Todos',
  selectedDateRange,
  selectedSortOrder,
  selectedViewMode,
  showSearch = true,
  sortOrderTabs,
  statusTabs,
  vehicleTypeTabs,
  dateRangeTabs,
  viewModeTabs,
  statusSelectMode = false,
}) {
  const searchId = `${controlIdPrefix}-search`;
  const typeId = `${controlIdPrefix}-type`;
  const statusId = `${controlIdPrefix}-status`;
  const dateRangeId = `${controlIdPrefix}-date-range`;
  const sortOrderId = `${controlIdPrefix}-sort-order`;
  const viewModeId = `${controlIdPrefix}-view-mode`;

  const hasControls = Boolean(
    vehicleTypeTabs?.length ||
      dateRangeTabs?.length ||
      sortOrderTabs?.length ||
      viewModeTabs?.length ||
      (statusSelectMode && statusTabs?.length),
  );

  return (
    <div className={`fleet-filters ${className}`.trim()}>
      {showSearch ? (
        <label className="search-field fleet-filters__search" htmlFor={searchId}>
          <Icon className="search-field__icon" name="search" />
          <input
            id={searchId}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            type="search"
            value={search}
          />
        </label>
      ) : null}

      <div className={`fleet-filters__toolbar${statusSelectMode ? ' fleet-filters__toolbar--selects' : ''}`.trim()}>
        {!statusSelectMode && statusTabs?.length ? (
          <FilterControlGroup label="Status" labelId={`${controlIdPrefix}-status-label`}>
            <div aria-labelledby={`${controlIdPrefix}-status-label`} className="filter-tabs" role="tablist">
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
          </FilterControlGroup>
        ) : null}

        {hasControls ? (
        <div className="fleet-filters__controls">
          {statusSelectMode && statusTabs?.length ? (
            <FilterControlGroup label="Status" labelId={`${controlIdPrefix}-status-label`}>
              <label className="select-field fleet-filters__select" htmlFor={statusId}>
                <select
                  aria-labelledby={`${controlIdPrefix}-status-label`}
                  id={statusId}
                  onChange={(event) => onStatusChange?.(event.target.value)}
                  value={selectedStatus}
                >
                  {statusTabs.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </FilterControlGroup>
          ) : null}

          {vehicleTypeTabs?.length ? (
            <FilterControlGroup label="Tipo" labelId={`${controlIdPrefix}-type-label`}>
              <label className="select-field fleet-filters__select" htmlFor={typeId}>
                <select
                  aria-labelledby={`${controlIdPrefix}-type-label`}
                  id={typeId}
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
            </FilterControlGroup>
          ) : null}

          {dateRangeTabs?.length ? (
            <FilterControlGroup label="Período" labelId={`${controlIdPrefix}-date-range-label`}>
              <label className="select-field fleet-filters__select" htmlFor={dateRangeId}>
                <select
                  aria-labelledby={`${controlIdPrefix}-date-range-label`}
                  id={dateRangeId}
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
            </FilterControlGroup>
          ) : null}

          {sortOrderTabs?.length ? (
            <FilterControlGroup label="Ordenação" labelId={`${controlIdPrefix}-sort-order-label`}>
              <label className="select-field fleet-filters__select" htmlFor={sortOrderId}>
                <select
                  aria-labelledby={`${controlIdPrefix}-sort-order-label`}
                  id={sortOrderId}
                  onChange={(event) => onSortOrderChange?.(event.target.value)}
                  value={selectedSortOrder}
                >
                  {sortOrderTabs.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </FilterControlGroup>
          ) : null}

          {viewModeTabs?.length ? (
            <FilterControlGroup label="Exibição" labelId={`${controlIdPrefix}-view-mode-label`}>
              <label className="select-field fleet-filters__select" htmlFor={viewModeId}>
                <select
                  aria-labelledby={`${controlIdPrefix}-view-mode-label`}
                  id={viewModeId}
                  onChange={(event) => onViewModeChange?.(event.target.value)}
                  value={selectedViewMode}
                >
                  {viewModeTabs.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </FilterControlGroup>
          ) : null}
        </div>
        ) : null}
      </div>
    </div>
  );
}
