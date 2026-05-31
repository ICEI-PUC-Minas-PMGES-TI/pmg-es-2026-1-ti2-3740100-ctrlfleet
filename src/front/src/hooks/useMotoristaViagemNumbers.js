import { useEffect, useState } from 'react';
import { listarHistoricoMotorista } from '../services/motoristaApi';
import {
  buildMotoristaViagemNumbers,
  getUserReservaNumber,
} from '../utils/userReservaNumbers';

export function useMotoristaViagemNumbers(motoristaId) {
  const [numbers, setNumbers] = useState(() => new Map());

  useEffect(() => {
    if (!motoristaId) {
      setNumbers(new Map());
      return undefined;
    }

    const controller = new AbortController();

    listarHistoricoMotorista(motoristaId, { signal: controller.signal })
      .then((items) => setNumbers(buildMotoristaViagemNumbers(items || [])))
      .catch((error) => {
        if (error.name !== 'AbortError') setNumbers(new Map());
      });

    return () => controller.abort();
  }, [motoristaId]);

  return numbers;
}

export function useMotoristaViagemNumber(motoristaId, idReserva) {
  const numbers = useMotoristaViagemNumbers(motoristaId);
  return getUserReservaNumber(numbers, idReserva);
}
