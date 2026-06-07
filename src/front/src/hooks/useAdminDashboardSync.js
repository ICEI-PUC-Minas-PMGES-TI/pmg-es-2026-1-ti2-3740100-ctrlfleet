import { useCallback, useEffect, useRef, useState } from 'react';
import { listarAuditoria } from '../services/auditoriaApi';
import { listarUsuarios } from '../services/usuarioApi';
import { mapBackendUserToView } from '../services/usuarioMappers';

const AUTO_SYNC_MS = 60_000;
const RELATIVE_TICK_MS = 1_000;

export function useAdminDashboardSync({ autoSync = true } = {}) {
  const abortRef = useRef(null);
  const [now, setNow] = useState(() => Date.now());
  const [state, setState] = useState({
    loading: true,
    syncing: false,
    error: null,
    lastSyncedAt: null,
    users: [],
    audit: [],
  });

  const sync = useCallback(async ({ silent = false } = {}) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((current) => ({
      ...current,
      loading: silent ? current.loading : true,
      syncing: true,
      error: null,
    }));

    try {
      const [usersRaw, auditRaw] = await Promise.all([
        listarUsuarios({ signal: controller.signal }),
        listarAuditoria({ signal: controller.signal }),
      ]);

      if (controller.signal.aborted) return;

      setState({
        loading: false,
        syncing: false,
        error: null,
        lastSyncedAt: Date.now(),
        users: usersRaw.map(mapBackendUserToView),
        audit: auditRaw,
      });
    } catch (error) {
      if (error.name === 'AbortError') return;
      setState((current) => ({
        ...current,
        loading: false,
        syncing: false,
        error: error.message || 'Falha ao sincronizar dados.',
      }));
    }
  }, []);

  useEffect(() => {
    sync();
    return () => abortRef.current?.abort();
  }, [sync]);

  useEffect(() => {
    if (!autoSync) return undefined;

    const intervalId = window.setInterval(() => {
      sync({ silent: true });
    }, AUTO_SYNC_MS);

    return () => window.clearInterval(intervalId);
  }, [autoSync, sync]);

  useEffect(() => {
    const onUsersUpdated = () => sync({ silent: true });
    window.addEventListener('ctrlfleet:usuarios-updated', onUsersUpdated);
    return () => window.removeEventListener('ctrlfleet:usuarios-updated', onUsersUpdated);
  }, [sync]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), RELATIVE_TICK_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  return {
    ...state,
    now,
    refresh: () => sync(),
    silentRefresh: () => sync({ silent: true }),
  };
}
