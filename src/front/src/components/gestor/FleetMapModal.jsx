import { useMemo } from 'react';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';
import { Modal } from '../common/Modal';
import { FleetMapView } from './FleetMapView';

export function FleetMapModal({ onClose, open, vehicles = [] }) {
  const vehicleCount = vehicles.length;

  const subtitle = useMemo(() => {
    const base = `${vehicleCount} veículo(s) · OpenStreetMap`;
    return `${base} · veículos em corrida aparecem em tempo real no mapa`;
  }, [vehicleCount]);

  return (
    <Modal
      footer={
        <>
          <span className="fleet-map-modal-footer__hint">
            <Icon name="map" />
            Clique nos veículos para ver detalhes
          </span>
          <ActionButton onClick={onClose} variant="secondary">
            Fechar
          </ActionButton>
        </>
      }
      onClose={onClose}
      open={open}
      size="map"
      subtitle={subtitle}
      title="Mapa da frota"
    >
      <FleetMapView variant="modal" vehicles={vehicles} />
    </Modal>
  );
}
