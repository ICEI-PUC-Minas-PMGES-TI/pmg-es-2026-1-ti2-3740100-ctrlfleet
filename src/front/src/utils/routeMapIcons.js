import L from 'leaflet';

function createRoutePin(color, label) {
  return L.divIcon({
    className: 'route-map-marker-wrap',
    html: `
      <div class="route-map-marker" style="--route-pin:${color}">
        <span class="route-map-marker__dot" aria-hidden="true"></span>
        <span class="route-map-marker__label">${label}</span>
      </div>
    `,
    iconAnchor: [14, 36],
    popupAnchor: [0, -32],
  });
}

export const ORIGIN_MAP_ICON = createRoutePin('#0d7a5f', 'A');
export const DESTINATION_MAP_ICON = createRoutePin('#c2410c', 'B');
