import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import type { Status, Task } from './types';

function saveTestTasks(tasks: Task[]) {
  localStorage.setItem('workflow-board', JSON.stringify({ schemaVersion: 2, tasks }));
}

const task = (id: string, title: string, status: Status): Task => ({
  id, title, status, description: '', priority: 'Medium', assignee: '', tags: [],
  createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z',
});

test('creates a task and shows it on the board', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'New task' }));
  const titleInput = screen.getByRole('textbox', { name: /title/i });
  expect(titleInput).toHaveFocus();

  await user.click(screen.getByRole('button', { name: 'Create' }));
  expect(screen.getByText('Title is required.')).toBeInTheDocument();
  expect(titleInput).toHaveAttribute('aria-invalid', 'true');

  await user.type(titleInput, 'Write tests');
  await user.type(screen.getByRole('textbox', { name: /tags/i }), 'qa, frontend');
  await user.click(screen.getByRole('button', { name: 'Create' }));

  const backlog = screen.getByRole('region', { name: 'Backlog' });
  expect(within(backlog).getByText('Write tests')).toBeInTheDocument();
  expect(within(backlog).getByText('qa')).toBeInTheDocument();
  expect(screen.getByText('Task created')).toBeInTheDocument();
});

test('moves a task to another column with the status dropdown', async () => {
  const user = userEvent.setup();
  saveTestTasks([task('1', 'Fix bug', 'Backlog')]);
  render(<App />);

  const backlog = screen.getByRole('region', { name: 'Backlog' });
  await user.selectOptions(within(backlog).getByRole('combobox', { name: 'Status' }), 'Done');

  expect(within(screen.getByRole('region', { name: 'Done' })).getByText('Fix bug')).toBeInTheDocument();
  expect(within(screen.getByRole('region', { name: 'Backlog' })).queryByText('Fix bug')).not.toBeInTheDocument();
});

test('filters tasks and keeps the filters in the URL', async () => {
  const user = userEvent.setup();
  saveTestTasks([task('1', 'Login page', 'Backlog'), task('2', 'Write docs', 'Done')]);
  render(<App />);

  await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'login');
  expect(screen.getByText('Login page')).toBeInTheDocument();
  expect(screen.queryByText('Write docs')).not.toBeInTheDocument();
  expect(window.location.search).toBe('?q=login');

  await user.click(screen.getByRole('checkbox', { name: 'Done' }));
  expect(screen.getByText(/no tasks match your filters/i)).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(screen.getByText('Write docs')).toBeInTheDocument();
});

test('migrates old v1 data to the new format', () => {
  localStorage.setItem('workflow-board', JSON.stringify({
    schemaVersion: 1,
    tasks: [{ id: '1', title: 'Old task', description: '', status: 'doing', priority: 'Low', assignee: '', tags: 'a, b', createdAt: '2024-01-01T00:00:00.000Z' }],
  }));
  render(<App />);

  expect(within(screen.getByRole('region', { name: 'In Progress' })).getByText('Old task')).toBeInTheDocument();
  expect(screen.getByText(/upgraded to the new format/i)).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem('workflow-board')!).schemaVersion).toBe(2);
});

test('restores filters from the URL and ignores invalid values', () => {
  saveTestTasks([task('1', 'Login page', 'Backlog'), task('2', 'Write docs', 'Done')]);
  window.history.replaceState(null, '', '/?status=Done&sort=abc');
  render(<App />);

  expect(screen.getByRole('checkbox', { name: 'Done' })).toBeChecked();
  expect(screen.getByText('Write docs')).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Backlog' })).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveValue('updatedAt');
});

test('shows an error when storage is unavailable', () => {
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  render(<App />);

  expect(screen.getByRole('alert')).toHaveTextContent(/storage is unavailable/i);
  spy.mockRestore();
});
