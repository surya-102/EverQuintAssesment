# Team Workflow Board

A simple task board (like a tiny Trello) built with React + TypeScript + Vite.
Tasks are grouped into **Backlog / In Progress / Done**, can be created, edited, moved between columns, filtered and sorted, and are saved in the browser's localStorage.

## How to run

Requires Node 18+.

```bash
npm install
npm run dev     # open http://localhost:5173
npm test        # run the tests (Vitest + React Testing Library)
npm run build   # type-check with tsc, then build into dist/
```

## Project structure

```
├── index.html            # the HTML page React renders into
├── vite.config.ts        # Vite + test settings
├── tsconfig.json         # TypeScript settings (strict mode)
└── src/
    ├── main.tsx              # starts the app
    ├── types.ts              # Task, Status, Priority, TaskFilters types
    ├── App.tsx               # the page: board, columns, opens the form
    ├── styles.css            # all styles + theme variables
    ├── components/
    │   ├── ui/               # reusable components (the "design system")
    │   │   ├── Button.tsx    # variants: primary/secondary/destructive, sizes: sm/md/lg
    │   │   ├── TextInput.tsx
    │   │   ├── TextArea.tsx
    │   │   ├── Select.tsx
    │   │   ├── Tag.tsx
    │   │   ├── Card.tsx
    │   │   ├── Modal.tsx
    │   │   └── Toast.tsx
    │   ├── TaskCard.tsx      # one task on the board
    │   ├── TaskForm.tsx      # create / edit form (inside a Modal)
    │   └── Filters.tsx       # search, status, priority, sort
    ├── hooks/
    │   ├── useTasks.ts       # task list + saving to localStorage
    │   └── useFilters.ts     # filters stored in the URL
    ├── utils/
    │   ├── storage.ts        # load/save + schema migration
    │   └── tasks.ts          # filter/sort + "3 hours ago"
    ├── test-setup.ts         # resets storage and URL between tests
    └── App.test.tsx          # tests
```

## Component hierarchy

```
App                (container: holds all state)
├── Filters        → TextInput, Select, Button
├── column (×3)
│   └── TaskCard   → Card, Tag, Select
├── TaskForm       → Modal, TextInput, TextArea, Select, Button
└── Toast
```

Data flows down as props, changes flow up through callbacks:

```
localStorage ⇄ storage.ts ⇄ useTasks ─┐
                                      ├─► App ─► filterAndSortTasks ─► columns ─► TaskCard
         URL ⇄ useFilters ────────────┘    ├─► Filters  (changes filters)
                                           ├─► TaskForm (create / edit)
                                           └─► Toast
```

## Key decisions

- **State:** plain `useState` inside two custom hooks. There is one page and one list, so no Redux/Zustand is needed.
  - `useTasks` holds the tasks and saves them to localStorage whenever they change.
  - `useFilters` reads filters from the URL and writes them back, so a filtered view survives refresh and can be shared.
- **Container vs presentational:** `App` is the only component that holds state. `Filters`, `TaskCard` and `TaskForm` receive data through props and report changes through callbacks.
- **Composition:** `Select` takes `<option>` children, `Card` and `Modal` wrap any content, instead of many configuration props.
- **TypeScript:** all data shapes live in `types.ts`. `Status` and `Priority` are union types (`'Backlog' | 'In Progress' | 'Done'`), so a typo is a compile error. Every component has typed props, and the old v1 storage shape has its own type so the migration is type-checked. No `any`.
- **Styling:** one CSS file. Colours and spacing are CSS variables at the top, so everything looks consistent.
- **Moving tasks:** a status dropdown on each card. It's simpler than drag-and-drop and works with the keyboard.
- **No extra libraries:** relative time uses the built-in `Intl.RelativeTimeFormat`; no date, drag-and-drop or state library was needed.
- **Accessibility:** every input has a `<label>`; errors use `aria-invalid` + `aria-describedby`, and focus moves to the invalid field. The modal has `role="dialog"`, `aria-modal`, is labelled by its title, focuses the first field, keeps Tab inside, closes on Escape or backdrop click, and gives focus back when closed. Toasts are in an `aria-live` area.

## Filters in the URL

Example: `?status=Backlog,Done&priority=High&q=login&sort=priority`

Only non-default values are written. Values that aren't valid (e.g. `?sort=abc` or `?priority=urgent`) are ignored and the default is used, so a hand-edited link can't break the page.

## Storage & migration

Data is saved in localStorage under the key `workflow-board` as `{ schemaVersion, tasks }`.

- **v1 (old):** status was `todo/doing/done`, tags were one string (`"bug, ui"`), no `updatedAt`.
- **v2 (current):** status is `Backlog/In Progress/Done`, tags are an array, `updatedAt` added.

When the app loads v1 data, `migrateV1toV2` converts it, the new shape is saved straight away, and a toast says the data was upgraded. Adding a v3 later means writing one more migration function and bumping `SCHEMA_VERSION`.

**Try it:** paste this into the browser console, then reload:

```js
localStorage.setItem('workflow-board', JSON.stringify({ schemaVersion: 1, tasks: [
  { id: '1', title: 'Old task', description: '', status: 'doing', priority: 'High', assignee: 'Sam', tags: 'bug, ui', createdAt: new Date().toISOString() }
]}))
```

**Errors:** if storage is blocked, the saved data isn't valid JSON, or it doesn't contain a `tasks` list, a red message is shown at the top and the app keeps working in memory.

## Performance fix

**Problem:** typing in the search box re-rendered every task card, even cards that didn't change.

**Fix:** `TaskCard` is wrapped in `memo`, and the functions passed to it are stable: `updateTask` uses `useCallback` and `onEdit` is a `useState` setter. The filtered list uses `useMemo`. Now unchanged cards are skipped.

To check: React DevTools → Profiler → record while typing in search.

## Refactor examples

1. **Simplifying the app.** The first version had a reducer, separate container/presentational files, a shared `Field` wrapper and a toast context. These became `useState` in two hooks, one `App` component, and a `Toast` that just takes a `message` prop. It's easier to read and change, and still covers every requirement.
2. **Validating URL filters.** `useFilters` originally cast URL values straight to their types (`params.get('sort') as SortField`). A hand-edited link like `?sort=abc` made the sort read a field that doesn't exist and crashed the page. Each value is now checked against the allowed list and falls back to the default.
3. **Checking the stored data shape.** `loadTasks` trusted any JSON with a `schemaVersion`. Data without a `tasks` array crashed the board, so it now throws and shows the storage error instead.
4. **Making Modal reusable.** The modal title used a fixed `id="modal-title"`, which would clash if two modals existed. It now uses `useId()` for a unique id.

## Tests

`App.test.tsx`:
1. Creating a task (including the validation error) and seeing it on the board — the core workflow.
2. Moving a task to another column with the status dropdown.
3. Search + status filters, the URL updating, the "no matches" message, and clearing filters.
4. Migrating v1 data.
5. Restoring filters from the URL (invalid values like `?sort=abc` are ignored).
6. Showing an error when storage is unavailable.

## Known limitations

- No drag-and-drop (moving is done with the dropdown).
- No delete (not part of the requirements).
- "updated X ago" refreshes when the card changes, not on a timer.
- Two open tabs can overwrite each other's changes.
- The unsaved-changes warning uses the browser's built-in `confirm()` box.
- Search is a simple case-insensitive text match.

## AI assistance

Built with help from Claude Code to create component and certain function which made the development faster
