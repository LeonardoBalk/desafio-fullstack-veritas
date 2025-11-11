import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Task from './Task.jsx';

export default function Column({ title, tasks, id, onAddTask, onOpenTask }) {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  // define cor do titulo conforme a coluna
  const headerColor = {
    todo: 'bg-blue-500',
    doing: 'bg-rose-600',
    done: 'bg-emerald-600',
  }[id] || 'bg-neutral-800';

  function handleOpenForm() {
    // abre form pequeno
    setShowForm(true);
  }

  function handleCancel() {
    // fecha e limpa
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
      await onAddTask?.(id, t);
      setNewTitle('');
      setShowForm(false);
    } catch (e) {
      setErr('erro ao criar');
    } finally {
      setSending(false);
    }
  }

  // evita valores indefinidos
  const safeTasks = Array.isArray(tasks) ? tasks.filter(t => t && t.id != null) : [];

  return (
    <div className="w-[320px] h-[500px] flex flex-col rounded-md border bg-neutral-950 border-neutral-800 shadow">
      <h3 className={`text-center px-3 py-2 mb-2 text-sm font-semibold text-white rounded-t-md ${headerColor}`}>
        {title}
      </h3>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={[
              'flex-1 p-3 overflow-y-auto transition-colors min-h-[120px]',
              snapshot.isDraggingOver ? 'bg-neutral-900/50' : 'bg-transparent'
            ].join(' ')}
          >
            {safeTasks.map((task, index) => (
              <Task
                key={task.id}
                task={task}
                index={index}
                onOpen={onOpenTask}
              />
            ))}

            {provided.placeholder}

            {safeTasks.length === 0 && (
              <div className="text-[11px] text-neutral-500 px-1 text-center">Sem tarefas</div>
            )}
          </div>
        )}
      </Droppable>

      <div className="border-t border-neutral-800 p-2 bg-neutral-950 rounded-b-md">
        {!showForm && (
          <button
            type="button"
            onClick={handleOpenForm}
            className="cursor-pointer w-full text-xs px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-100 transition-all duration-200 hover:scale-[1.02] hover:shadow-md"

          >
            + Adicionar tarefa
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Título da tarefa"
              className="border rounded-md px-2 py-1 text-xs bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-600"
              disabled={sending}
              autoFocus
            />
            {err && <div className="text-[10px] text-rose-400">{err}</div>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={sending}
                className="flex-1 text-xs px-3 py-1 rounded-md bg-neutral-200 hover:bg-neutral-300 text-neutral-900 disabled:opacity-60 transition"
              >
                {sending ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={sending}
                className="text-xs px-3 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}