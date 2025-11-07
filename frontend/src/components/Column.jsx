import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Task from './Task.jsx';

export default function Column({ title, tasks, id, onEditTask, onDeleteTask, onAddTask }) {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  function handleOpenForm() {
    // abre o form
    setShowForm(true);
  }

  function handleCancel() {
    // cancela e limpa
    setShowForm(false);
    setNewTitle('');
    setErr('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const t = newTitle.trim();
    if (!t) {
      setErr('titulo obrigatorio');
      return;
    }
    setErr('');
    setSending(true);
    try {
      // chama callback para criar tarefa na coluna
      await onAddTask?.(id, t);
      // limpa e fecha
      setNewTitle('');
      setShowForm(false);
    } catch (e) {
      setErr('erro ao criar');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-gray-100 border border-gray-400 rounded-sm w-[300px] h-[475px] flex flex-col">
      <h3 className="bg-pink-300 text-center p-2 mb-2 font-semibold">{title}</h3>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-2 transition-colors duration-200 flex-1 overflow-y-auto min-h-[100px] ${
              snapshot.isDraggingOver ? 'bg-pink-100' : 'bg-white'
            }`}
          >
            {tasks?.map((task, index) => (
              <Task
                key={task.id}
                task={task}
                index={index}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="border-t border-gray-300 p-2 bg-gray-50">
        {!showForm && (
            <button
              type="button"
              onClick={handleOpenForm}
              className="w-full text-xs px-3 py-2 rounded bg-pink-400 hover:bg-pink-500 text-white"
            >
              add
            </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="titulo da tarefa"
              className="border border-gray-300 rounded px-2 py-1 text-xs"
              disabled={sending}
              autoFocus
            />
            {err && <div className="text-[10px] text-red-600">{err}</div>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={sending}
                className="flex-1 text-xs px-3 py-1 rounded bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-60"
              >
                {sending ? 'salvando...' : 'salvar'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={sending}
                className="text-xs px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}