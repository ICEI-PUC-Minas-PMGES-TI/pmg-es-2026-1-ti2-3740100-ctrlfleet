import { inferVehicleImageType, resolveVehicleImageUrl } from '../../utils/vehicleImage';

function VehicleSvg({ type }) {
  if (type === 'van') {
    return (
      <svg aria-hidden="true" className="fleet-vehicle-card__svg" viewBox="0 0 120 48" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 30h84l-6-14H18l-4 8H8v6Zm12-18 4-6h36l8 10H20l-4 6H14l2-10Zm58 18a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-44 0a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
          fill="currentColor"
          opacity="0.92"
        />
      </svg>
    );
  }

  if (type === 'suv') {
    return (
      <svg aria-hidden="true" className="fleet-vehicle-card__svg" viewBox="0 0 120 48" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 30h80l-8-12h-8l-6 8H10v4Zm10-16 6-8h30l10 12H26l-6 8h-6l-4-12Zm52 16a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-42 0a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
          fill="currentColor"
          opacity="0.92"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="fleet-vehicle-card__svg" viewBox="0 0 120 48" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 30h76l-6-10H24l-4 6H12v4Zm8-14 4-6h28l8 10H24l-4 6h-8l-4-10Zm48 14a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm-38 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"
        fill="currentColor"
        opacity="0.92"
      />
    </svg>
  );
}

export function VehicleCardThumbnail({ vehicle }) {
  const imageType = inferVehicleImageType(vehicle);
  const imageUrl = resolveVehicleImageUrl(vehicle);
  const statusModifier = (vehicle?.status || 'Ativo')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();

  return (
    <div className={`fleet-vehicle-card__media fleet-vehicle-card__media--${statusModifier}`}>
      {imageUrl ? (
        <img
          alt={`${vehicle.marca} ${vehicle.model}`}
          className="fleet-vehicle-card__photo"
          loading="lazy"
          src={imageUrl}
        />
      ) : (
        <div className={`fleet-vehicle-card__illustration fleet-vehicle-card__illustration--${imageType}`}>
          <VehicleSvg type={imageType} />
        </div>
      )}
      <span className="fleet-vehicle-card__media-badge">{vehicle.marca || 'Veículo'}</span>
    </div>
  );
}
