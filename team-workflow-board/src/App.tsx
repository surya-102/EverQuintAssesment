import { useMemo, useState } from 'react';
import Button from './components/ui/Button';
import Toast from './components/ui/Toast';
import Filters from './components/Filters';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import { useFilters } from './hooks/useFilters';
import { useTasks } from './hooks/useTasks';
import type { Task, TaskInput } from './types';
import { STATUSES, filterAndSortTasks } from './utils/tasks';

export default function App() {
  const { tasks, addTask, updateTask, error, migrated } = useTasks();
  const { filters, updateFilters, clearFilters } = useFilters();
  const [editing, setEditing] = useState<Task | 'new' | null>(null);
  const [toast, setToast] = useState(migrated ? 'Your saved tasks were upgraded to the new format.' : '');

  const visibleTasks = useMemo(() => filterAndSortTasks(tasks, filters), [tasks, filters]);
  const columns = filters.statuses.length ? STATUSES.filter((s) => filters.statuses.includes(s)) : STATUSES;

  function handleSave(values: TaskInput) {
    if (editing === 'new') {
      addTask(values);
      setToast('Task created');
    } else if (editing) {
      updateTask(editing.id, values);
      setToast('Task saved');
    }
    setEditing(null);
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Team Workflow Board</h1>
        <Button onClick={() => setEditing('new')}>New task</Button>
      </header>

      {error && <p role="alert" className="alert">{error}</p>}

      <Filters filters={filters} onChange={updateFilters} onClear={clearFilters} />

      {tasks.length === 0 ? (
        <p className="empty">No tasks yet. Click "New task" to create one.</p>
      ) : visibleTasks.length === 0 ? (
        <p className="empty">No tasks match your filters.</p>
      ) : (
        <div className="board">
          {columns.map((status) => {
            const columnTasks = visibleTasks.filter((t) => t.status === status);
            return (
              <section key={status} className="column" aria-label={status}>
                <h2>{status} ({columnTasks.length})</h2>
                {columnTasks.length === 0 && <p className="empty">No tasks</p>}
                <ul>
                  {columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={setEditing} onUpdate={updateTask} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {editing && (
        <TaskForm task={editing === 'new' ? null : editing} onSave={handleSave} onClose={() => setEditing(null)} />
      )}

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
