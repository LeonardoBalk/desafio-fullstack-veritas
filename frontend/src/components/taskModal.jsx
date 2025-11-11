import React, { useEffect, useState } from 'react';

export default function taskModal({ open, task, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('A Fazer');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (open && task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'A Fazer');
      setErr('');
      setSending(false);
    }
  }, [open, task]);

  if (!open || !task) return null;

  async function handleSave(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      setErr('titulo obrigatorio');
      return;
    }
    setErr('');
    setSending(true);
    try {
      await onSave?.({
        title: t,
        description: description.trim(),
        status
      });
    } catch (e) {
      setErr('erro ao salvar');
      setSending(false);
      return;
    }
    setSending(false);
  }

  async function handleDelete() {
    setSending(true);
    try {
      await onDelete?.();
    } catch (e) {
      setErr('erro ao excluir');
      setSending(false);
      return;
    }
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={sending ? undefined : onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-md border shadow-lg bg-neutral-950 border-neutral-800">
          <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-100">Detalhes da Tarefa</h3>
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="text-neutral-300 hover:text-neutral-100 text-sm"
            >
              Fechar
            </button>
          </div>

          <form onSubmit={handleSave} className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400">Título</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600"
                disabled={sending}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400">Descrição</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="border rounded-md px-2 py-2 text-sm bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 resize-y min-h-[80px] focus:outline-none focus:ring-1 focus:ring-neutral-600"
                disabled={sending}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm bg-neutral-900 border-neutral-800 text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-600"
                disabled={sending}
              >
                <option value="A Fazer">A Fazer</option>
                <option value="Em Progresso">Em Progresso</option>
                <option value="Concluída">Concluída</option>
              </select>
            </div>

            {err && <div className="text-[11px] text-rose-400">{err}</div>}

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleDelete}
                disabled={sending}
                className="text-xs px-3 py-2 rounded-md bg-rose-700/20 hover:bg-rose-700/30 text-rose-300 border border-rose-800/40"
              >
                Excluir
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={sending}
                  className="text-xs px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="text-xs px-3 py-2 rounded-md bg-neutral-200 hover:bg-neutral-300 text-neutral-900 disabled:opacity-60"
                >
                  {sending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}