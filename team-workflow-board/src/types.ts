export type Status = 'Backlog' | 'In Progress' | 'Done';
export type Priority = 'Low' | 'Medium' | 'High';
export type SortField = 'updatedAt' | 'createdAt' | 'priority';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// The fields a user fills in; id and dates are added by the app.
export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

export interface TaskFilters {
  statuses: Status[];
  priority: Priority | '';
  search: string;
  sort: SortField;
}
