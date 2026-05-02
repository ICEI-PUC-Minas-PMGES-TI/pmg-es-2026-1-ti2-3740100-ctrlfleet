import { Icon } from '../common/Icon';

export function UserFilters({
  cpfSearch,
  nameSearch,
  onCpfSearchChange,
  onNameSearchChange,
  onRoleChange,
  onSecretariatChange,
  onStatusChange,
  role,
  roleOptions,
  secretariat,
  secretariats,
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
        <span className="sr-only">Buscar por CPF</span>
        <input
          inputMode="numeric"
          onChange={(event) => onCpfSearchChange(event.target.value)}
          placeholder="Buscar por CPF"
          type="search"
          value={cpfSearch}
        />
      </label>

      <label className="select-field admin-user-filters__secretariat">
        <span className="sr-only">Filtrar por secretaria</span>
        <select onChange={(event) => onSecretariatChange(event.target.value)} value={secretariat}>
          {secretariats.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
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
