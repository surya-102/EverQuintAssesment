import type { Priority, Status, Task, TaskFilters } from '../types';

export const STATUSES: Status[] = ['Backlog', 'In Progress', 'Done'];
export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

export function filterAndSortTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const search = filters.search.toLowerCase();
  const sort = filters.sort;

  return tasks
    .filter((t) => filters.statuses.length === 0 || filters.statuses.includes(t.status))
    .filter((t) => !filters.priority || t.priority === filters.priority)
    .filter((t) => `${t.title} ${t.description}`.toLowerCase().includes(search))
    .sort((a, b) =>
      sort === 'priority'
        ? PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority) // high first
        : b[sort].localeCompare(a[sort]), // newest first
    );
}

// "3 hours ago", "yesterday", ...
export function timeAgo(isoDate: string): string {
  const seconds = (new Date(isoDate).getTime() - Date.now()) / 1000;
  const format = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(seconds) < 60) return 'just now';
  if (Math.abs(seconds) < 3600) return format.format(Math.round(seconds / 60), 'minute');
  if (Math.abs(seconds) < 86400) return format.format(Math.round(seconds / 3600), 'hour');
  return format.format(Math.round(seconds / 86400), 'day');
}
