/** Rótulo relativo em português (ex.: "há 12 segundos"). */
export function formatRelativeTime(fromDate, now = Date.now()) {
  if (!fromDate) return 'nunca';

  const timestamp = fromDate instanceof Date ? fromDate.getTime() : new Date(fromDate).getTime();
  if (!Number.isFinite(timestamp)) return 'nunca';

  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (diffSec < 5) return 'agora';
  if (diffSec < 60) return `há ${diffSec} segundo${diffSec === 1 ? '' : 's'}`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin} minuto${diffMin === 1 ? '' : 's'}`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `há ${diffHour} hora${diffHour === 1 ? '' : 's'}`;

  const diffDay = Math.floor(diffHour / 24);
  return `há ${diffDay} dia${diffDay === 1 ? '' : 's'}`;
}
