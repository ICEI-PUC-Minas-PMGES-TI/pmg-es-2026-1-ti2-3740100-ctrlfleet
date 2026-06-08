import L from 'leaflet';

function createRoutePin(color, label) {
  return L.divIcon({
    className: 'route-map-marker-wrap',
    html: `<span class="route-map-marker__label route-map-marker__label--solo" style="--route-pin:${color}">${label}</span>`,
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export const ORIGIN_MAP_ICON = createRoutePin('#0d7a5f', 'A');
export const DESTINATION_MAP_ICON = createRoutePin('#c2410c', 'B');

export const ORIGIN_MAP_ICON_LABEL = ORIGIN_MAP_ICON;
export const DESTINATION_MAP_ICON_LABEL = DESTINATION_MAP_ICON;

export const VEHICLE_MAP_ICON = L.divIcon({
  className: 'route-map-marker-wrap route-map-marker-wrap--vehicle',
  html: `
    <div class="route-map-vehicle" aria-hidden="true">
      <span class="route-map-vehicle__emoji">🚗</span>
    </div>
  `,
  iconAnchor: [18, 18],
  popupAnchor: [0, -16],
});
