import { buildApiUrl } from './apiBase';

export async function listarAlertasPreventivos() {
    try {
        const res = await fetch(buildApiUrl('/manutencoes/alertas/preventivos'), {
            method: 'GET',
            headers: { Accept: 'application/json' },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

export async function verificarAlertas() {
    try {
        const res = await fetch(buildApiUrl('/manutencoes/alertas/verificar'), {
            method: 'POST',
            headers: { Accept: 'application/json' },
        });
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

export async function marcarAlertaComoLido(alertaId) {
    try {
        await fetch(buildApiUrl(`/manutencoes/alertas/${alertaId}/lido`), {
            method: 'PATCH',
        });
    } catch {
        // silencioso
    }
}