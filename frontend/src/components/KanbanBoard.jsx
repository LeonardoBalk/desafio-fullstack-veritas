import React, { useEffect, useMemo, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column.jsx';
import TaskModal from './taskModal.jsx';
import Logo from '../assets/logo.svg';

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function KanbanBoard() {
  // estado principal
  const [columns, setColumns] = useState({ todo: [], doing: [], done: [] });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  // modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const flatTasks = useMemo(
    () => [...columns.todo, ...columns.doing, ...columns.done],
    [columns]
  );

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      setErr('');
      try {
        const res = await fetch(`${API_URL}/tasks`);
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        const grouped = { todo: [], doing: [], done: [] };
        for (const t of list) {
          if (!t || t.id == null) continue;
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
    const arr = Array.from(list);
    const [removed] = arr.splice(start, 1);
    arr.splice(end, 0, removed);
    return arr;
  }

  async function persistStatus(id, newStatus) {
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

  function handleDragEnd(result) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const fromCol = source.droppableId;
    const toCol = destination.droppableId;

    if (fromCol === toCol) {
      setColumns(prev => ({
        ...prev,
        [fromCol]: reorder(prev[fromCol], source.index, destination.index),
      }));
      return;
    }

    setColumns(prev => {
      const start = Array.from(prev[fromCol]);
      const finish = Array.from(prev[toCol]);
      const [moved] = start.splice(source.index, 1);
      if (!moved) return prev;
      const updated = { ...moved, status: statusByCol[toCol] || moved.status };
      finish.splice(destination.index, 0, updated);
      return { ...prev, [fromCol]: start, [toCol]: finish };
    });

    const newStatus = statusByCol[toCol];
    if (newStatus) persistStatus(draggableId, newStatus);
  }

  async function handleAddTask(colId, title) {
    const status = statusByCol[colId] || 'A Fazer';
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, status }),
    });
    const json = await res.json();
    if (json?.success && json?.data) {
      setColumns(prev => {
        const arr = Array.from(prev[colId] || []);
        arr.push(json.data);
        return { ...prev, [colId]: arr };
      });
    } else {
      throw new Error('falha ao criar');
    }
  }

  function openTask(task) {
    if (!task) return;
    setSelectedTask(task);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedTask(null);
  }

  async function saveTaskFromModal(fields) {
    if (!selectedTask) return;

    // faz request primeiro para ter dados atualizados (ex updated_at)
    let updatedData = {
      title: fields.title,
      description: fields.description,
      status: fields.status
    };

    try {
      const res = await fetch(`${API_URL}/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const json = await res.json();
      if (json?.success && json.data) {
        updatedData = json.data; // usa dado oficial do backend
      }
    } catch (e) {
      console.warn('erro ao salvar');
      return;
    }

    setColumns(prev => {
      const oldStatus = selectedTask.status;
      const newStatus = updatedData.status || oldStatus;
      const oldCol = colByStatus[oldStatus] || 'todo';
      const newCol = colByStatus[newStatus] || oldCol;

      const next = { ...prev };

      if (oldCol === newCol) {
        // atualiza em place
        next[oldCol] = next[oldCol].map(t =>
          String(t.id) === String(selectedTask.id)
            ? { ...t, ...updatedData }
            : t
        );
      } else {
        // move entre colunas
        const fromArr = Array.from(next[oldCol]);
        const idx = fromArr.findIndex(t => String(t.id) === String(selectedTask.id));
        if (idx >= 0) fromArr.splice(idx, 1);
        next[oldCol] = fromArr;
        const toArr = Array.from(next[newCol]);
        toArr.push({ ...selectedTask, ...updatedData });
        next[newCol] = toArr;
      }

      return next;
    });

    closeModal();
  }

  async function deleteTaskFromModal() {
    if (!selectedTask) return;
    setColumns(prev => {
      const col = colByStatus[selectedTask.status] || 'todo';
      const arr = Array.from(prev[col]);
      const idx = arr.findIndex(t => t && String(t.id) === String(selectedTask.id));
      if (idx >= 0) arr.splice(idx, 1);
      return { ...prev, [col]: arr };
    });
    try {
      await fetch(`${API_URL}/tasks/${selectedTask.id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('erro ao excluir');
    }
    closeModal();
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-center gap-3">
        <img src={Logo} alt="kanban logo" className="h-7 w-7" />
        <h2 className="text-2xl font-bold tracking-tight text-neutral-100">Tarea</h2>
      </div>

      {loading && <div className="text-sm text-neutral-300 mb-2 text-center">carregando...</div>}
      {err && <div className="text-sm text-rose-400 mb-2 text-center">{err}</div>}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex items-start justify-center gap-5">
          <Column
            title="A fazer"
            tasks={columns.todo}
            id="todo"
            onAddTask={handleAddTask}
            onOpenTask={openTask}
          />
          <Column
            title="Em progresso"
            tasks={columns.doing}
            id="doing"
            onAddTask={handleAddTask}
            onOpenTask={openTask}
          />
          <Column
            title="Concluídas"
            tasks={columns.done}
            id="done"
            onAddTask={handleAddTask}
            onOpenTask={openTask}
          />
        </div>
      </DragDropContext>

      <TaskModal
        open={showModal}
        task={selectedTask}
        onClose={closeModal}
        onSave={saveTaskFromModal}
        onDelete={deleteTaskFromModal}
      />
    </div>
  );
}