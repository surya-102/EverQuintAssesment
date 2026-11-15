import type { Status, Task } from '../types';

const STORAGE_KEY = 'workflow-board';
export const SCHEMA_VERSION = 2;

/*
  Schema history
  v1: status was 'todo' | 'doing' | 'done', tags was one string like "bug, ui", no updatedAt
  v2: status is 'Backlog' | 'In Progress' | 'Done', tags is an array, updatedAt added
*/
interface TaskV1 extends Omit<Task, 'status' | 'tags' | 'updatedAt'> {
  status: 'todo' | 'doing' | 'done';
  tags: string;
}

type StoredData = { schemaVersion: 1; tasks: TaskV1[] } | { schemaVersion: 2; tasks: Task[] };

interface LoadResult {
  tasks: Task[];
  migrated: boolean;
  error: string | null;
}

const V1_STATUS: Record<TaskV1['status'], Status> = { todo: 'Backlog', doing: 'In Progress', done: 'Done' };

function migrateV1toV2(tasks: TaskV1[]): Task[] {
  return tasks.map((task) => ({
    ...task,
    status: V1_STATUS[task.status] || 'Backlog',
    tags: task.tags ? task.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    updatedAt: task.createdAt,
  }));
}

export function loadTasks(): LoadResult {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { tasks: [], migrated: false, error: null };

    const data: StoredData = JSON.parse(saved);
    if (!Array.isArray(data.tasks)) throw new Error('Unknown data shape');
    if (data.schemaVersion === 1) {
      return { tasks: migrateV1toV2(data.tasks), migrated: true, error: null };
    }
    return { tasks: data.tasks, migrated: false, error: null };
  } catch {
    return { tasks: [], migrated: false, error: 'Could not read saved tasks from storage.' };
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, tasks }));
}
