import { memo } from 'react';
import Card from './ui/Card';
import Select from './ui/Select';
import Tag from './ui/Tag';
import type { Status, Task, TaskInput } from '../types';
import { STATUSES, timeAgo } from '../utils/tasks';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onUpdate: (id: string, changes: Partial<TaskInput>) => void;
}

function TaskCard({ task, onEdit, onUpdate }: TaskCardProps) {
  return (
    <li>
      <Card>
        <button className="task-title" onClick={() => onEdit(task)}>
          {task.title}
        </button>

        <div className="task-row">
          <Tag color={task.priority.toLowerCase() as 'low' | 'medium' | 'high'}>{task.priority}</Tag>
          <span>{task.assignee || 'Unassigned'}</span>
        </div>

        {task.tags.length > 0 && (
          <div className="task-row">
            {task.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}

        <Select
          label="Status"
          value={task.status}
          onChange={(e) => onUpdate(task.id, { status: e.target.value as Status })}
        >
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>

        <small>updated {timeAgo(task.updatedAt)}</small>
      </Card>
    </li>
  );
}

export default memo(TaskCard);
