import React, { useEffect, useMemo, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column.jsx';

const statusByCol = {
  todo: 'A Fazer',
  doing: 'Em Progresso',
  done: 'Concluída',
};

const colByStatus = {
  'A Fazer': 'todo',
  'Em Progresso': 'doing',
  'Concluída': 'done',
};

const API_URL = 'http://localhost:8080';

export default function KanbanBoard() {
  const [columns, setColumns] = useState({ todo: [], doing: [], done: [] });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const flatTasks = useMemo(
    () => [...columns.todo, ...columns.doing, ...columns.done],
    [columns]
  );

  useEffect(() => {
    // carrega tasks do backend
    async function fetchTasks() {
      setLoading(true);
      setErr('');
      try {
        const res = await fetch(`${API_URL}/tasks`);
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        const grouped = { todo: [], doing: [], done: [] };
        for (const t of list) {
          const col = colByStatus[t.status] || 'todo';
          grouped[col].push(t);
        }
        setColumns(grouped);
      } catch (e) {
        setErr('erro ao carregar tarefas');
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  function reorder(list, start, end) {
    // reordena lista dentro da mesma coluna
    const arr = Array.from(list);
    const [removed] = arr.splice(start, 1);
    arr.splice(end, 0, removed);
    return arr;
  }

  async function persistStatus(id, newStatus) {
    // salva status no backend
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!json?.success) {
        console.warn('falha ao atualizar status');
      }
    } catch (e) {
      console.warn('erro de rede ao atualizar status');
    }
  }

  // drag and drop
  function handleDragEnd(result) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const fromCol = source.droppableId;
    const toCol = destination.droppableId;

    if (fromCol === toCol) {
      setColumns((prev) => ({
        ...prev,
        [fromCol]: reorder(prev[fromCol], source.index, destination.index),
      }));
      return;
    }

    setColumns((prev) => {
      const start = Array.from(prev[fromCol]);
      const finish = Array.from(prev[toCol]);
      const [moved] = start.splice(source.index, 1);
      const updated = { ...moved, status: statusByCol[toCol] || moved.status };
      finish.splice(destination.index, 0, updated);
      return { ...prev, [fromCol]: start, [toCol]: finish };
    });

    const newStatus = statusByCol[toCol];
    if (newStatus) persistStatus(draggableId, newStatus);
  }

  // deletar tarefa
  function handleDeleteTask(task) {
    try {
      setColumns((prev) => {
        const col = colByStatus[task.status] || 'todo';
        const arr = Array.from(prev[col]);
        const idx = arr.findIndex((t) => String(t.id) === String(task.id));
        if (idx >= 0) arr.splice(idx, 1);
        return { ...prev, [col]: arr };
      });
      fetch(`${API_URL}/tasks/${task.id}`, { method: 'DELETE' }).catch(() => {});
    } catch (e) {
      console.warn('erro ao excluir');
    }
  }

  // editar tarefa
  function handleEditTask(task) {
    const novoTitulo = window.prompt('novo titulo:', task.title || '');
    if (!novoTitulo) return;
    setColumns((prev) => {
      const col = colByStatus[task.status] || 'todo';
      const arr = Array.from(prev[col]);
      const idx = arr.findIndex((t) => String(t.id) === String(task.id));
      if (idx >= 0) arr[idx] = { ...arr[idx], title: novoTitulo };
      return { ...prev, [col]: arr };
    });
    fetch(`${API_URL}/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: novoTitulo }),
    }).catch(() => {});
  }

  async function handleAddTask(colId, title) {
    // cria task no backend com status da coluna
    const status = statusByCol[colId] || 'A Fazer';
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, status }),
      });
      const json = await res.json();
      if (json?.success && json?.data) {
        setColumns((prev) => {
          const arr = Array.from(prev[colId] || []);
          arr.push(json.data);
          return { ...prev, [colId]: arr };
        });
      } else {
        console.warn('falha ao criar tarefa');
      }
    } catch (e) {
      console.warn('erro de rede ao criar tarefa');
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">kanban</h2>

      {loading && <div className="text-sm text-gray-600 mb-2">carregando...</div>}
      {err && <div className="text-sm text-red-600 mb-2">{err}</div>}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex items-start justify-between gap-4">
          <Column
            title="A Fazer"
            tasks={columns.todo}
            id="todo"
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
          />
          <Column
            title="Em Progresso"
            tasks={columns.doing}
            id="doing"
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
          />
          <Column
            title="Concluídas"
            tasks={columns.done}
            id="done"
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
          />
        </div>
      </DragDropContext>
    </div>
  );
}