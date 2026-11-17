// Форматування часу подій. Час подається в UTC, як і в інших підсистемах пульта.
const TIME_LENGTH = 8; // "HH:MM:SS"
const UTC_PREFIX_INDEX = 11;

export function formatTime(ts) {
  if (!ts) return '—';
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toISOString().slice(UTC_PREFIX_INDEX, UTC_PREFIX_INDEX + TIME_LENGTH);
}

export function formatDateTime(ts) {
  if (!ts) return '—';
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.toISOString().slice(0, 10)} ${formatTime(ts)} UTC`;
}

export function formatClock(ts) {
  if (!ts) return '—';
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('uk-UA');
}
