// Чисті функції відбору та посторінкового поділу подій.
// Винесені з компонентів, щоб їх можна було перевіряти автотестами.

export const SEVERITY_GROUPS = {
  high: ['critical', 'high'],
  medium: ['warning', 'medium'],
  low: ['info', 'low'],
};

export const SEVERITY_OPTIONS = [
  { value: 'all', label: 'Усі рівні' },
  { value: 'high', label: 'High / Critical' },
  { value: 'medium', label: 'Medium / Warning' },
  { value: 'low', label: 'Low / Info' },
];

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Усі статуси' },
  { value: 'unacknowledged', label: 'Unacknowledged' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'in_fusion', label: 'In fusion' },
];

export const PAGE_SIZE = 10;

function matchesSeverity(event, severity) {
  if (severity === 'all') return true;
  const group = SEVERITY_GROUPS[severity];
  if (!group) return true;
  return group.includes(String(event.severity || '').toLowerCase());
}

function matchesQuery(event, query) {
  if (!query) return true;
  const haystack = [event.title, event.trackId, event.zoneId, event.id, event.type]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export function filterEvents(events, { query = '', severity = 'all', status = 'all' } = {}) {
  const normalizedQuery = query.trim().toLowerCase();

  return events.filter((event) => {
    if (!matchesSeverity(event, severity)) return false;
    if (status !== 'all' && event.status !== status) return false;
    return matchesQuery(event, normalizedQuery);
  });
}

export function paginate(items, page, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  return {
    page: currentPage,
    totalPages,
    items: items.slice(start, start + pageSize),
  };
}
