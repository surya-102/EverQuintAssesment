import { useEffect, useState } from 'react';
import type { Priority, SortField, Status, TaskFilters } from '../types';
import { PRIORITIES, STATUSES } from '../utils/tasks';

const DEFAULT_SORT: SortField = 'updatedAt';
const SORT_FIELDS: SortField[] = ['updatedAt', 'createdAt', 'priority'];

// Invalid values in the URL (e.g. ?sort=abc) are ignored.
function readFiltersFromUrl(): TaskFilters {
  const params = new URLSearchParams(window.location.search);
  const statuses = (params.get('status') || '').split(',') as Status[];
  const priority = params.get('priority') as Priority;
  const sort = params.get('sort') as SortField;
  return {
    statuses: statuses.filter((s) => STATUSES.includes(s)),
    priority: PRIORITIES.includes(priority) ? priority : '',
    search: params.get('q') || '',
    sort: SORT_FIELDS.includes(sort) ? sort : DEFAULT_SORT,
  };
}

// Filters live in the URL (?status=Done&priority=High&q=login&sort=priority),
// so they survive a refresh and can be shared as a link.
export function useFilters() {
  const [filters, setFilters] = useState(readFiltersFromUrl);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.statuses.length) params.set('status', filters.statuses.join(','));
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.search) params.set('q', filters.search);
    if (filters.sort !== DEFAULT_SORT) params.set('sort', filters.sort);

    const query = params.toString();
    window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
  }, [filters]);

  function updateFilters(changes: Partial<TaskFilters>) {
    setFilters((prev) => ({ ...prev, ...changes }));
  }

  function clearFilters() {
    setFilters((prev) => ({ statuses: [], priority: '', search: '', sort: prev.sort }));
  }

  return { filters, updateFilters, clearFilters };
}
