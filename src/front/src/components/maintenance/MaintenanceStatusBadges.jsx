import { StatusBadge } from '../common/StatusBadge';

export function MaintenanceStatusBadges({ item }) {
  return (
    <div className="maintenance-status-badges">
      <StatusBadge label={item.statusLabel} />
      {item.atrasada ? <StatusBadge label="Atrasada" /> : null}
    </div>
  );
}
