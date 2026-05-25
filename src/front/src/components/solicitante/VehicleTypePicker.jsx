import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../common/Icon';
import { TIPO_VEICULO_LABELS } from '../../services/veiculoMappers';

const TYPE_ORDER = ['SUV', 'SEDAN', 'HATCH', 'VAN', 'CAMINHONETE', 'ONIBUS'];

function resolveTypeKey(vehicle) {
  return vehicle.tipoVeiculo || 'OUTROS';
}

function resolveTypeLabel(key) {
  return TIPO_VEICULO_LABELS[key] || 'Outros';
}

export function VehicleTypePicker({ disabled, onSelect, selectedId, vehicles = [] }) {
  const groups = useMemo(() => {
    const map = new Map();

    vehicles.forEach((vehicle) => {
      const key = resolveTypeKey(vehicle);
      if (!map.has(key)) {
        map.set(key, { key, label: resolveTypeLabel(key), items: [] });
      }
      map.get(key).items.push(vehicle);
    });

    return TYPE_ORDER.filter((key) => map.has(key))
      .map((key) => map.get(key))
      .concat(
        [...map.values()].filter((group) => !TYPE_ORDER.includes(group.key)).sort((a, b) => a.label.localeCompare(b.label)),
      );
  }, [vehicles]);

  const [activeType, setActiveType] = useState(groups[0]?.key ?? '');

  useEffect(() => {
    if (!groups.length) {
      setActiveType('');
      return;
    }
    if (!groups.some((group) => group.key === activeType)) {
      setActiveType(groups[0].key);
    }
  }, [activeType, groups]);

  const activeGroup = groups.find((group) => group.key === activeType) ?? groups[0];

  if (!vehicles.length) {
    return (
      <div className="vehicle-type-picker vehicle-type-picker--empty">
        <Icon name="fleet" />
        <p>Nenhum veículo disponível no momento.</p>
        <span>Aguarde liberação pela frota ou escolha outro período.</span>
      </div>
    );
  }

  return (
    <div className="vehicle-type-picker">
      <div className="vehicle-type-picker__tabs" role="tablist" aria-label="Categoria do veículo">
        {groups.map((group) => (
          <button
            key={group.key}
            className={`vehicle-type-picker__tab${activeType === group.key ? ' is-active' : ''}`}
            disabled={disabled}
            onClick={() => setActiveType(group.key)}
            type="button"
          >
            {group.label}
            <span className="vehicle-type-picker__count">{group.items.length}</span>
          </button>
        ))}
      </div>

      <div className="vehicle-type-picker__grid" role="listbox" aria-label={`Veículos ${activeGroup?.label ?? ''}`}>
        {activeGroup?.items.map((vehicle) => {
          const isSelected = String(vehicle.id) === String(selectedId);

          return (
            <button
              key={vehicle.id}
              className={`vehicle-type-picker__card${isSelected ? ' is-selected' : ''}`}
              disabled={disabled}
              onClick={() => onSelect?.(vehicle.id)}
              type="button"
            >
              <span className="vehicle-type-picker__card-type">{vehicle.vehicleTypeLabel}</span>
              <strong>{vehicle.plate}</strong>
              <span>{vehicle.model}</span>
              <small>{vehicle.year !== '-' ? `Ano ${vehicle.year}` : 'Ano não informado'}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
