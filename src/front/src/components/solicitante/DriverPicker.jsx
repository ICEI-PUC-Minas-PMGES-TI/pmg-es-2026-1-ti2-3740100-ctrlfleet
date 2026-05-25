import { Icon } from '../common/Icon';

function formatDriverOption(driver) {
  const veiculos =
    driver.veiculosVinculados === 1
      ? '1 veículo'
      : `${driver.veiculosVinculados} veículos`;
  return `${driver.name} · ${veiculos}`;
}

export function DriverPicker({ disabled, drivers = [], onSelect, selectedId }) {
  if (!drivers.length) {
    return (
      <div className="driver-picker driver-picker--empty">
        <Icon name="users" />
        <p>Nenhum motorista disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="driver-picker">
      <select
        aria-label="Selecionar motorista"
        className="driver-picker__select"
        disabled={disabled}
        onChange={(event) => onSelect?.(event.target.value)}
        value={selectedId ?? ''}
      >
        <option value="">Selecione um motorista</option>
        {drivers.map((driver) => (
          <option key={driver.id} value={driver.id}>
            {formatDriverOption(driver)}
          </option>
        ))}
      </select>
    </div>
  );
}
