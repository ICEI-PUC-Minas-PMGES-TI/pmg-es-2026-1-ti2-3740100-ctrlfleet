import L from 'leaflet';

export function createFleetCarIcon({ bearing = 0, isSelected, placeType, plate, showPlate = true }) {
  const modifier =
    placeType === 'driving'
      ? 'driving'
      : placeType === 'garage'
        ? 'garage'
        : 'trip';

  const rotation = placeType === 'driving' ? bearing : 0;
  const plateHtml = showPlate
    ? `<span class="fleet-leaflet-marker__plate">${plate}</span>`
    : '';

  return L.divIcon({
    className: 'fleet-leaflet-marker-wrap',
    html: `
      <div class="fleet-leaflet-marker fleet-leaflet-marker--${modifier}${isSelected ? ' fleet-leaflet-marker--selected' : ''}">
        <span
          class="fleet-leaflet-marker__icon"
          style="transform: rotate(${rotation}deg);"
          aria-hidden="true"
        >🚗</span>
        ${plateHtml}
      </div>
    `,
    iconSize: showPlate ? [72, 46] : [36, 36],
    iconAnchor: showPlate ? [36, 22] : [18, 18],
    popupAnchor: [0, -20],
  });
}

export function createGarageIcon() {
  return L.divIcon({
    className: 'fleet-leaflet-marker-wrap',
    html: `
      <div class="fleet-leaflet-garage">
        <span class="fleet-leaflet-garage__icon" aria-hidden="true">🏢</span>
        <span class="fleet-leaflet-garage__label">Garagem</span>
      </div>
    `,
    iconSize: [80, 40],
    iconAnchor: [40, 40],
  });
}
