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

export function MaintenanceGestorFilters({
  controlIdPrefix = 'gestor-manutencao',
  onSearchChange,
  onStatusChange,
  onPrioridadeChange,
  onTipoChange,
  onVeiculoChange,
  prioridadeOptions,
  search,
  searchPlaceholder,
  selectedPrioridade,
  selectedStatus,
  selectedTipo,
  selectedVeiculoId,
  showStatusFilter,
  statusTabs,
  tipoOptions,
  veiculoOptions,
}) {
  const searchId = `${controlIdPrefix}-search`;
  const statusSelectId = `${controlIdPrefix}-status`;
  const prioridadeSelectId = `${controlIdPrefix}-prioridade`;
  const tipoSelectId = `${controlIdPrefix}-tipo`;
  const veiculoSelectId = `${controlIdPrefix}-veiculo`;

  return (
    <div className="fleet-filters fleet-filters--gestor fleet-filters--maintenance">
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

      <div className="fleet-filters__controls fleet-filters__controls--maintenance">
        {showStatusFilter && statusTabs?.length ? (
          <FilterControlGroup label="Status" labelId={`${controlIdPrefix}-status-label`}>
            <label className="select-field fleet-filters__select" htmlFor={statusSelectId}>
              <select
                aria-labelledby={`${controlIdPrefix}-status-label`}
                id={statusSelectId}
                onChange={(event) => onStatusChange(event.target.value)}
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

        {prioridadeOptions?.length ? (
          <FilterControlGroup label="Prioridade" labelId={`${controlIdPrefix}-prioridade-label`}>
            <label className="select-field fleet-filters__select" htmlFor={prioridadeSelectId}>
              <select
                aria-labelledby={`${controlIdPrefix}-prioridade-label`}
                id={prioridadeSelectId}
                onChange={(event) => onPrioridadeChange(event.target.value)}
                value={selectedPrioridade}
              >
                {prioridadeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </FilterControlGroup>
        ) : null}

        {tipoOptions?.length ? (
          <FilterControlGroup label="Tipo" labelId={`${controlIdPrefix}-tipo-label`}>
            <label className="select-field fleet-filters__select" htmlFor={tipoSelectId}>
              <select
                aria-labelledby={`${controlIdPrefix}-tipo-label`}
                id={tipoSelectId}
                onChange={(event) => onTipoChange(event.target.value)}
                value={selectedTipo}
              >
                {tipoOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </FilterControlGroup>
        ) : null}

        {veiculoOptions?.length ? (
          <FilterControlGroup label="Veículo" labelId={`${controlIdPrefix}-veiculo-label`}>
            <label className="select-field fleet-filters__select" htmlFor={veiculoSelectId}>
              <select
                aria-labelledby={`${controlIdPrefix}-veiculo-label`}
                id={veiculoSelectId}
                onChange={(event) => onVeiculoChange(event.target.value)}
                value={selectedVeiculoId}
              >
                {veiculoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </FilterControlGroup>
        ) : null}
      </div>
    </div>
  );
}
