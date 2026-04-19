import React, { useEffect, useMemo, useState } from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  closestCorners
} from 'https://esm.sh/@dnd-kit/core@6.3.1';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from 'https://esm.sh/@dnd-kit/sortable@10.0.0';
import { CSS } from 'https://esm.sh/@dnd-kit/utilities@3.2.2';

const STORAGE_KEY = 'ai-project-dashboard-kanban-v1';

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', description: 'Captured but not yet committed' },
  { id: 'this_week', label: 'This Week', description: 'Planned for the current cycle' },
  { id: 'in_progress', label: 'In Progress', description: 'Actively being worked' },
  { id: 'waiting', label: 'Waiting', description: 'Blocked or awaiting input' },
  { id: 'done', label: 'Done', description: 'Completed and retained for traceability' }
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function loadTasks() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalizeSeed(window.KANBAN_SEED || []);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return normalizeSeed(window.KANBAN_SEED || []);
    return normalizeSeed(parsed);
  } catch {
    return normalizeSeed(window.KANBAN_SEED || []);
  }
}

function normalizeSeed(tasks) {
  return tasks.map((task, index) => ({
    id: task.id || `task-${index + 1}`,
    title: task.title || 'Untitled task',
    group: task.group || 'General',
    status: validColumn(task.status) ? task.status : 'backlog',
    priority: ['high', 'medium', 'low'].includes(task.priority) ? task.priority : 'medium',
    notes: task.notes || '',
    tags: Array.isArray(task.tags) ? task.tags : []
  }));
}

function validColumn(status) {
  return COLUMNS.some((column) => column.id === status);
}

function saveTasks(tasks) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function App() {
  const [tasks, setTasks] = useState(() => loadTasks());
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [activeId, setActiveId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const groups = useMemo(() => {
    return ['all', ...new Set(tasks.map((task) => task.group).sort())];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const groupMatch = groupFilter === 'all' || task.group === groupFilter;
      const text = [task.title, task.group, task.notes, ...(task.tags || [])].join(' ').toLowerCase();
      const searchMatch = !searchValue || text.includes(searchValue);
      return groupMatch && searchMatch;
    });
  }, [tasks, search, groupFilter]);

  const tasksByColumn = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map((column) => [column.id, []]));
    filteredTasks
      .slice()
      .sort((a, b) => {
        const priorityDelta = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDelta !== 0) return priorityDelta;
        return a.title.localeCompare(b.title);
      })
      .forEach((task) => {
        if (!map[task.status]) map[task.status] = [];
        map[task.status].push(task);
      });
    return map;
  }, [filteredTasks]);

  const summary = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'done').length;
    const active = tasks.filter((task) => task.status === 'in_progress').length;
    const week = tasks.filter((task) => task.status === 'this_week').length;
    return { total, completed, active, week };
  }, [tasks]);

  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : null;
  const editingTask = editingTaskId ? tasks.find((task) => task.id === editingTaskId) : null;

  function moveTask(taskId, nextStatus, overIndex = null) {
    setTasks((currentTasks) => {
      const nextTasks = [...currentTasks];
      const taskIndex = nextTasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) return currentTasks;

      const [task] = nextTasks.splice(taskIndex, 1);
      const updatedTask = { ...task, status: nextStatus };

      const targetIndexes = nextTasks
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.status === nextStatus)
        .map(({ index }) => index);

      let insertionIndex;
      if (overIndex === null || overIndex >= targetIndexes.length) {
        insertionIndex = targetIndexes.length ? targetIndexes[targetIndexes.length - 1] + 1 : nextTasks.length;
      } else {
        insertionIndex = targetIndexes[overIndex];
      }

      nextTasks.splice(insertionIndex, 0, updatedTask);
      return nextTasks;
    });
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeTaskRecord = tasks.find((task) => task.id === active.id);
    if (!activeTaskRecord) return;

    const overId = String(over.id);
    const overTaskRecord = tasks.find((task) => task.id === overId);

    if (overTaskRecord) {
      const targetColumn = overTaskRecord.status;
      const visibleColumnTasks = tasksByColumn[targetColumn] || [];
      const overIndex = visibleColumnTasks.findIndex((task) => task.id === overTaskRecord.id);
      moveTask(activeTaskRecord.id, targetColumn, overIndex);
      return;
    }

    if (validColumn(overId)) {
      moveTask(activeTaskRecord.id, overId, null);
    }
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function resetBoard() {
    const seed = normalizeSeed(window.KANBAN_SEED || []);
    setTasks(seed);
  }

  function updateTask(taskId, patch) {
    setTasks((currentTasks) => currentTasks.map((task) => task.id === taskId ? { ...task, ...patch } : task));
  }

  function deleteTask(taskId) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    setEditingTaskId(null);
  }

  function createTask() {
    const id = `task-${Date.now()}`;
    const task = {
      id,
      title: 'New task',
      group: groupFilter !== 'all' ? groupFilter : 'General',
      status: 'backlog',
      priority: 'medium',
      notes: '',
      tags: []
    };
    setTasks((currentTasks) => [task, ...currentTasks]);
    setEditingTaskId(id);
  }

  return React.createElement(
    'div',
    { className: 'kanban-shell' },
    React.createElement('div', { className: 'kanban-summary' },
      React.createElement(SummaryCard, { label: 'Total Tasks', value: summary.total, sub: 'Entire board footprint' }),
      React.createElement(SummaryCard, { label: 'This Week', value: summary.week, sub: 'Current planned cycle' }),
      React.createElement(SummaryCard, { label: 'In Progress', value: summary.active, sub: 'Active execution load' }),
      React.createElement(SummaryCard, { label: 'Completed', value: summary.completed, sub: 'Closed tasks retained' })
    ),
    React.createElement('div', { className: 'kanban-toolbar' },
      React.createElement('div', { className: 'kanban-toolbar-left' },
        React.createElement('div', { className: 'kanban-field' },
          React.createElement('label', null, 'Search'),
          React.createElement('input', {
            className: 'kanban-input',
            type: 'text',
            value: search,
            placeholder: 'Find task, group, note, or tag',
            onChange: (event) => setSearch(event.target.value)
          })
        ),
        React.createElement('div', { className: 'kanban-field' },
          React.createElement('label', null, 'Group'),
          React.createElement('select', {
            className: 'kanban-select',
            value: groupFilter,
            onChange: (event) => setGroupFilter(event.target.value)
          }, groups.map((group) => React.createElement('option', { key: group, value: group }, group === 'all' ? 'All Groups' : group)))
        )
      ),
      React.createElement('div', { className: 'kanban-toolbar-right' },
        React.createElement('button', { className: 'kanban-button-secondary', type: 'button', onClick: resetBoard }, 'Reset Board'),
        React.createElement('button', { className: 'kanban-button', type: 'button', onClick: createTask }, 'Add Task')
      )
    ),
    React.createElement('div', { className: 'kanban-board-wrap' },
      React.createElement(DndContext, {
        sensors,
        collisionDetection: closestCorners,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDragCancel: handleDragCancel
      },
        React.createElement('div', { className: 'kanban-board' },
          COLUMNS.map((column) => React.createElement(Column, {
            key: column.id,
            column,
            tasks: tasksByColumn[column.id] || [],
            onEdit: setEditingTaskId
          }))
        ),
        React.createElement(DragOverlay, null,
          activeTask ? React.createElement(TaskCardOverlay, { task: activeTask }) : null
        )
      )
    ),
    editingTask ? React.createElement(EditModal, {
      task: editingTask,
      groups,
      onClose: () => setEditingTaskId(null),
      onSave: updateTask,
      onDelete: deleteTask
    }) : null
  );
}

function SummaryCard({ label, value, sub }) {
  return React.createElement('div', { className: 'kanban-summary-card' },
    React.createElement('div', { className: 'kanban-summary-label' }, label),
    React.createElement('div', { className: 'kanban-summary-value' }, String(value)),
    React.createElement('div', { className: 'kanban-summary-sub' }, sub)
  );
}

function Column({ column, tasks, onEdit }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return React.createElement('div', { className: `kanban-column${isOver ? ' is-over' : ''}` },
    React.createElement('div', { className: 'kanban-column-header' },
      React.createElement('div', { className: 'kanban-column-label' }, column.label),
      React.createElement('div', { className: 'kanban-column-meta' },
        React.createElement('div', { className: 'kanban-count' }, String(tasks.length)),
        React.createElement('div', { className: 'kanban-column-desc' }, column.description)
      )
    ),
    React.createElement(SortableContext, { items: tasks.map((task) => task.id), strategy: verticalListSortingStrategy },
      React.createElement('div', { ref: setNodeRef, className: 'kanban-column-body' },
        tasks.length === 0
          ? React.createElement('div', { className: 'kanban-empty' }, 'Drop tasks here')
          : tasks.map((task) => React.createElement(TaskCard, { key: task.id, task, onEdit }))
      )
    )
  );
}

function TaskCard({ task, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return React.createElement('div', {
    ref: setNodeRef,
    style,
    className: `kanban-card${isDragging ? ' dragging' : ''}`,
    ...attributes,
    ...listeners
  },
    React.createElement('div', { className: 'kanban-card-header' },
      React.createElement('div', { className: 'kanban-card-title' }, task.title),
      React.createElement('div', { className: `kanban-card-priority ${task.priority}` }, task.priority)
    ),
    React.createElement('div', { className: 'kanban-group' }, task.group),
    task.notes ? React.createElement('div', { className: 'kanban-notes' }, task.notes) : null,
    Array.isArray(task.tags) && task.tags.length
      ? React.createElement('div', { className: 'kanban-tags' }, task.tags.map((tag) => React.createElement('span', { key: tag, className: 'kanban-tag' }, tag)))
      : null,
    React.createElement('div', { className: 'kanban-card-actions' },
      React.createElement('button', {
        className: 'kanban-link-button',
        type: 'button',
        onPointerDown: (event) => event.stopPropagation(),
        onClick: (event) => {
          event.stopPropagation();
          onEdit(task.id);
        }
      }, 'Edit')
    )
  );
}

function TaskCardOverlay({ task }) {
  return React.createElement('div', { className: 'kanban-card' },
    React.createElement('div', { className: 'kanban-card-header' },
      React.createElement('div', { className: 'kanban-card-title' }, task.title),
      React.createElement('div', { className: `kanban-card-priority ${task.priority}` }, task.priority)
    ),
    React.createElement('div', { className: 'kanban-group' }, task.group),
    task.notes ? React.createElement('div', { className: 'kanban-notes' }, task.notes) : null,
    Array.isArray(task.tags) && task.tags.length
      ? React.createElement('div', { className: 'kanban-tags' }, task.tags.map((tag) => React.createElement('span', { key: tag, className: 'kanban-tag' }, tag)))
      : null
  );
}

function EditModal({ task, groups, onClose, onSave, onDelete }) {
  const [draft, setDraft] = useState({
    title: task.title,
    group: task.group,
    status: task.status,
    priority: task.priority,
    notes: task.notes || '',
    tags: Array.isArray(task.tags) ? task.tags.join(', ') : ''
  });

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  function save() {
    onSave(task.id, {
      title: draft.title.trim() || 'Untitled task',
      group: draft.group.trim() || 'General',
      status: validColumn(draft.status) ? draft.status : 'backlog',
      priority: ['high', 'medium', 'low'].includes(draft.priority) ? draft.priority : 'medium',
      notes: draft.notes.trim(),
      tags: draft.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    });
    onClose();
  }

  return React.createElement('div', {
    className: 'kanban-modal-backdrop',
    onClick: (event) => {
      if (event.target === event.currentTarget) onClose();
    }
  },
    React.createElement('div', { className: 'kanban-modal' },
      React.createElement('div', { className: 'kanban-modal-header' },
        React.createElement('div', { className: 'kanban-modal-title' }, 'Edit Task'),
        React.createElement('button', { className: 'kanban-button-secondary', type: 'button', onClick: onClose }, 'Close')
      ),
      React.createElement('div', { className: 'kanban-modal-body' },
        React.createElement('div', { className: 'kanban-field' },
          React.createElement('label', null, 'Title'),
          React.createElement('input', {
            className: 'kanban-input',
            type: 'text',
            value: draft.title,
            onChange: (event) => setDraft((current) => ({ ...current, title: event.target.value }))
          })
        ),
        React.createElement('div', { className: 'kanban-modal-grid' },
          React.createElement('div', { className: 'kanban-field' },
            React.createElement('label', null, 'Group'),
            React.createElement('input', {
              className: 'kanban-input',
              list: 'kanban-group-options',
              type: 'text',
              value: draft.group,
              onChange: (event) => setDraft((current) => ({ ...current, group: event.target.value }))
            }),
            React.createElement('datalist', { id: 'kanban-group-options' },
              groups.filter((group) => group !== 'all').map((group) => React.createElement('option', { key: group, value: group }))
            )
          ),
          React.createElement('div', { className: 'kanban-field' },
            React.createElement('label', null, 'Status'),
            React.createElement('select', {
              className: 'kanban-select',
              value: draft.status,
              onChange: (event) => setDraft((current) => ({ ...current, status: event.target.value }))
            }, COLUMNS.map((column) => React.createElement('option', { key: column.id, value: column.id }, column.label)))
          ),
          React.createElement('div', { className: 'kanban-field' },
            React.createElement('label', null, 'Priority'),
            React.createElement('select', {
              className: 'kanban-select',
              value: draft.priority,
              onChange: (event) => setDraft((current) => ({ ...current, priority: event.target.value }))
            }, ['high', 'medium', 'low'].map((value) => React.createElement('option', { key: value, value }, value)))
          ),
          React.createElement('div', { className: 'kanban-field' },
            React.createElement('label', null, 'Tags'),
            React.createElement('input', {
              className: 'kanban-input',
              type: 'text',
              value: draft.tags,
              placeholder: 'Comma separated',
              onChange: (event) => setDraft((current) => ({ ...current, tags: event.target.value }))
            })
          )
        ),
        React.createElement('div', { className: 'kanban-field' },
          React.createElement('label', null, 'Notes'),
          React.createElement('textarea', {
            className: 'kanban-textarea',
            value: draft.notes,
            onChange: (event) => setDraft((current) => ({ ...current, notes: event.target.value }))
          })
        )
      ),
      React.createElement('div', { className: 'kanban-modal-footer' },
        React.createElement('button', {
          className: 'kanban-button-danger',
          type: 'button',
          onClick: () => {
            const confirmed = window.confirm('Delete this task?');
            if (confirmed) onDelete(task.id);
          }
        }, 'Delete'),
        React.createElement('div', { className: 'kanban-modal-footer-right' },
          React.createElement('button', { className: 'kanban-button-secondary', type: 'button', onClick: onClose }, 'Cancel'),
          React.createElement('button', { className: 'kanban-button', type: 'button', onClick: save }, 'Save Task')
        )
      )
    )
  );
}

const rootElement = document.getElementById('kanban-root');
if (rootElement) {
  createRoot(rootElement).render(React.createElement(App));
}
