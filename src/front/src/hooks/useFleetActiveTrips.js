import { useEffect, useState } from 'react';
import {
  getActiveFleetTrips,
  subscribeActiveFleetTrips,
} from '../utils/fleetActiveTripsStorage';

export function useFleetActiveTrips(pollIntervalMs = 250) {
  const [trips, setTrips] = useState(() => getActiveFleetTrips());

  useEffect(() => {
    const refresh = () => setTrips(getActiveFleetTrips());
    refresh();

    const unsubscribe = subscribeActiveFleetTrips(refresh);
    const intervalId = window.setInterval(refresh, pollIntervalMs);

    return () => {
      unsubscribe();
      window.clearInterval(intervalId);
    };
  }, [pollIntervalMs]);

  return trips;
}
