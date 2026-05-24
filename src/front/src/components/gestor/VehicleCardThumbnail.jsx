import {
  inferVehicleImageType,
  resolveVehicleImageUrl,
  usesVehicleTypePlaceholderImage,
} from '../../utils/vehicleImage';

export function VehicleCardThumbnail({ vehicle }) {
  const imageUrl = resolveVehicleImageUrl(vehicle);
  const imageType = inferVehicleImageType(vehicle);
  const isTypeImage = usesVehicleTypePlaceholderImage(vehicle);
  const statusModifier = (vehicle?.status || 'Ativo')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
  const badgeLabel = vehicle.vehicleTypeLabel || vehicle.marca || 'Veículo';

  return (
    <div className={`fleet-vehicle-card__media fleet-vehicle-card__media--${statusModifier}`}>
      <img
        alt={`${vehicle.vehicleTypeLabel || 'Veículo'} ${vehicle.marca} ${vehicle.model}`.trim()}
        className={[
          'fleet-vehicle-card__photo',
          isTypeImage ? 'fleet-vehicle-card__photo--tipo' : '',
          `fleet-vehicle-card__photo--${imageType}`,
        ]
          .filter(Boolean)
          .join(' ')}
        loading="lazy"
        src={imageUrl}
      />
      <span className="fleet-vehicle-card__media-badge">{badgeLabel}</span>
    </div>
  );
}
