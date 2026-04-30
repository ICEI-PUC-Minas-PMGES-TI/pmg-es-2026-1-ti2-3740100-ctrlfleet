import { Icon } from '../common/Icon';

export function UserFilters({
  onRoleChange,
  onSearchChange,
  onStatusChange,
  role,
  roleOptions,
  search,
  selectedStatus,
  statusTabs,
}) {
  return (
    <div className="fleet-filters">
      <label className="search-field">
        <Icon className="search-field__icon" name="search" />
        <span className="sr-only">Buscar usuário</span>
        <input
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nome, e-mail ou secretaria"
          type="search"
          value={search}
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
