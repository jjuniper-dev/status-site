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
  useSortable
} from 'https://esm.sh/@dnd-kit/sortable@10.0.0';
import { CSS } from 'https://esm.sh/@dnd-kit/utilities@3.2.2';

const STORAGE_KEY = 'ai-project-dashboard-kanban-v1';

const COLUMNS = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'this_week', label: 'This Week' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'done', label: 'Done' }
];

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : (window.KANBAN_SEED || []);
  } catch {
    return window.KANBAN_SEED || [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [todayMode, setTodayMode] = useState(false);

  useEffect(() => saveTasks(tasks), [tasks]);

  const sensors = useSensors(useSensor(PointerSensor));

  const visibleTasks = useMemo(() => {
    if (!todayMode) return tasks;
    return tasks.filter(t => t.status === 'this_week' || t.status === 'in_progress');
  }, [tasks, todayMode]);

  const byColumn = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map(c => [c.id, []]));
    visibleTasks.forEach(t => map[t.status]?.push(t));
    return map;
  }, [visibleTasks]);

  function move(id, status) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status } : t));
  }

  function onDragEnd(e) {
    if (!e.over) return;
    const status = e.over.id;
    move(e.active.id, status);
  }

  return React.createElement('div', { className: 'kanban-shell' },

    React.createElement('div', { className: 'kanban-toolbar' },
      React.createElement('button', {
        className: 'kanban-button',
        onClick: () => setTodayMode(v => !v)
      }, todayMode ? 'Exit Today Mode' : 'Today Mode')
    ),

    React.createElement(DndContext, { sensors, collisionDetection: closestCorners, onDragEnd },
      React.createElement('div', { className: 'kanban-board' },
        COLUMNS.map(col => React.createElement(Column, {
          key: col.id,
          column: col,
          tasks: byColumn[col.id]
        }))
      )
    )
  );
}

function Column({ column, tasks }) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return React.createElement('div', { className: 'kanban-column' },
    React.createElement('div', { className: 'kanban-column-header' }, column.label),
    React.createElement(SortableContext, { items: tasks.map(t => t.id), strategy: verticalListSortingStrategy },
      React.createElement('div', { ref: setNodeRef, className: 'kanban-column-body' },
        tasks.map(t => React.createElement(Card, { key: t.id, task: t }))
      )
    )
  );
}

function Card({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  return React.createElement('div', {
    ref: setNodeRef,
    style: { transform: CSS.Transform.toString(transform), transition },
    className: 'kanban-card',
    ...attributes,
    ...listeners
  }, task.title);
}

createRoot(document.getElementById('kanban-root')).render(React.createElement(App));