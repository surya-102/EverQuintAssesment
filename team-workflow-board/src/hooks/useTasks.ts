import { useCallback, useEffect, useState } from 'react';
import type { Task, TaskInput } from '../types';
import { loadTasks, saveTasks } from '../utils/storage';

// Holds the task list and saves it to localStorage on every change.
export function useTasks() {
  const [initial] = useState(loadTasks); // read storage once
  const [tasks, setTasks] = useState<Task[]>(initial.tasks);
  const [error, setError] = useState(initial.error);

  useEffect(() => {
    try {
      saveTasks(tasks);
    } catch {
      setError('Storage is unavailable. Your changes will not be saved.');
    }
  }, [tasks]);

  function addTask(values: TaskInput) {
    const now = new Date().toISOString();
    setTasks((prev) => [...prev, { ...values, id: crypto.randomUUID(), createdAt: now, updatedAt: now }]);
  }

  // useCallback keeps the same function between renders, so memo(TaskCard) can skip re-renders.
  const updateTask = useCallback((id: string, changes: Partial<TaskInput>) => {
    const now = new Date().toISOString();
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes, updatedAt: now } : t)));
  }, []);

  return { tasks, addTask, updateTask, error, migrated: initial.migrated };
}
