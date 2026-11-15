import Button from './ui/Button';
import Select from './ui/Select';
import TextInput from './ui/TextInput';
import type { Priority, SortField, Status, TaskFilters } from '../types';
import { PRIORITIES, STATUSES } from '../utils/tasks';

interface FiltersProps {
  filters: TaskFilters;
  onChange: (changes: Partial<TaskFilters>) => void;
  onClear: () => void;
}

export default function Filters({ filters, onChange, onClear }: FiltersProps) {
  function toggleStatus(status: Status) {
    const statuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onChange({ statuses });
  }

  return (
    <div className="filters">
      <TextInput
        label="Search"
        type="search"
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
      />

      <fieldset>
        <legend>Status</legend>
        {STATUSES.map((s) => (
          <label key={s} className="checkbox">
            <input type="checkbox" checked={filters.statuses.includes(s)} onChange={() => toggleStatus(s)} />
            {s}
          </label>
        ))}
      </fieldset>

      <Select label="Priority" value={filters.priority} onChange={(e) => onChange({ priority: e.target.value as Priority | '' })}>
        <option value="">All</option>
        {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
      </Select>

      <Select label="Sort by" value={filters.sort} onChange={(e) => onChange({ sort: e.target.value as SortField })}>
        <option value="updatedAt">Updated date</option>
        <option value="createdAt">Created date</option>
        <option value="priority">Priority</option>
      </Select>

      <Button variant="secondary" size="sm" onClick={onClear}>Clear filters</Button>
    </div>
  );
}
