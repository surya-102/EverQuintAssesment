import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Select from './ui/Select';
import TextArea from './ui/TextArea';
import TextInput from './ui/TextInput';
import type { Priority, Status, Task, TaskInput } from '../types';
import { PRIORITIES, STATUSES } from '../utils/tasks';

interface FormValues {
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: string;
  tags: string;
}

interface TaskFormProps {
  task: Task | null;
  onSave: (values: TaskInput) => void;
  onClose: () => void;
}

const EMPTY: FormValues = { title: '', description: '', status: 'Backlog', priority: 'Medium', assignee: '', tags: '' };

export default function TaskForm({ task, onSave, onClose }: TaskFormProps) {
  const [initial] = useState<FormValues>(() => (task ? { ...task, tags: task.tags.join(', ') } : EMPTY));
  const [values, setValues] = useState(initial);
  const [titleError, setTitleError] = useState('');

  const isDirty = JSON.stringify(values) !== JSON.stringify(initial);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  function change(field: keyof FormValues) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues({ ...values, [field]: e.target.value });
  }

  function close() {
    if (!isDirty || window.confirm('You have unsaved changes. Discard them?')) onClose();
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = values.title.trim();
    if (!title || title.length > 80) {
      setTitleError(!title ? 'Title is required.' : 'Title must be 80 characters or less.');
      (e.currentTarget.elements.namedItem('title') as HTMLInputElement).focus();
      return;
    }
    onSave({
      title,
      description: values.description.trim(),
      status: values.status,
      priority: values.priority,
      assignee: values.assignee.trim(),
      tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
  }

  return (
    <Modal title={task ? 'Edit task' : 'New task'} onClose={close}>
      <form onSubmit={handleSubmit} noValidate className="form">
        <TextInput name="title" label="Title *" value={values.title} onChange={change('title')} error={titleError} />
        <TextArea label="Description" value={values.description} onChange={change('description')} />
        <Select label="Status" value={values.status} onChange={change('status')}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </Select>
        <Select label="Priority" value={values.priority} onChange={change('priority')}>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </Select>
        <TextInput label="Assignee" value={values.assignee} onChange={change('assignee')} />
        <TextInput label="Tags (comma separated)" value={values.tags} onChange={change('tags')} />

        <div className="form-actions">
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button type="submit">{task ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
}
