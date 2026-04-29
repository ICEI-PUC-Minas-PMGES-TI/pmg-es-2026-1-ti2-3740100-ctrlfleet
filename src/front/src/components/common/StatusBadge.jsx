function normalize(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

export function StatusBadge({ label }) {
  return <span className={`status-badge status-badge--${normalize(label)}`}>{label}</span>;
}
