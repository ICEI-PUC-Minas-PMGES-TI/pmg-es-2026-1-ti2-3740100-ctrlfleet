import { apiFetch, parseApiResponse } from './apiBase';
import { getHomePathForSession, saveAuthSession } from './authSession';

/**
 * @param {{ email: string, senha: string }} credentials
 */
export async function login(credentials) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email.trim(),
      senha: credentials.senha,
    }),
  });

  const session = await parseApiResponse(res);
  saveAuthSession(session);
  return {
    session,
    homePath: getHomePathForSession(session),
  };
}
