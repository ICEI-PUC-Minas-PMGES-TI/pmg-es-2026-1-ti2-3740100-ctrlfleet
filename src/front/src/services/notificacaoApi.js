import { buildApiUrl } from './apiBase';

export async function listarNotificacoesPendentes({ horas = 24 } = {}) {
    try {
        const res = await fetch(buildApiUrl(`/notificacoes/pendentes?horas=${horas}`), {
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