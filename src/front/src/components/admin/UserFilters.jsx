import { Icon } from '../common/Icon';

export function UserFilters({
  matriculaSearch,
  nameSearch,
  onMatriculaSearchChange,
  onNameSearchChange,
  onRoleChange,
  onStatusChange,
  role,
  roleOptions,
  selectedStatus,
  statusTabs,
}) {
  return (
    <div className="fleet-filters admin-user-filters">
      <label className="search-field">
        <Icon className="search-field__icon" name="search" />
        <span className="sr-only">Buscar por nome</span>
        <input
          onChange={(event) => onNameSearchChange(event.target.value)}
          placeholder="Buscar por nome"
          type="search"
          value={nameSearch}
        />
      </label>

      <label className="search-field">
        <Icon className="search-field__icon" name="document" />
        <span className="sr-only">Buscar por matrícula</span>
        <input
          onChange={(event) => onMatriculaSearchChange(event.target.value)}
          placeholder="Buscar por matrícula"
          type="search"
          value={matriculaSearch}
        />
      </label>

      <div className="filter-tabs" role="tablist">
        {statusTabs.map((status) => (
          <button
            className={`filter-tab ${selectedStatus === status ? 'is-active' : ''}`}
            key={status}
            onClick={() => onStatusChange(status)}
            type="button"
          >
            {status}
          </button>
        ))}
      </div>

      <label className="select-field">
        <span className="sr-only">Filtrar por perfil</span>
        <select onChange={(event) => onRoleChange(event.target.value)} value={role}>
          {roleOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
