import { apiFetch, parseApiResponse } from './apiBase';

async function request(path, options = {}) {
  const res = await apiFetch(path, options);
  return parseApiResponse(res);
}

export async function buscarPerfilAtual(options = {}) {
  return request('/auth/me', { signal: options.signal });
}

export async function atualizarPerfil(payload) {
  return request('/auth/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function alterarSenha(payload) {
  const res = await apiFetch('/auth/alterar-senha', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return parseApiResponse(res);
  }

  return null;
}
