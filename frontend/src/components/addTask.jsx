import React, { useState } from 'react';

const API_URL = 'http://localhost:8080';

export default function AddTask({ onCreated }) {
  // estado local do form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setErr('titulo obrigatorio');
      return;
    }
    setErr('');
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          status: 'A Fazer',
        }),
      });
      const json = await res.json();
      if (!json?.success) {
        setErr(json?.error || 'erro ao criar');
      } else {
        onCreated?.(json.data);
        setTitle('');
        setDescription('');
      }
    } catch (e) {
      setErr('erro de rede');
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 bg-white border border-gray-300 p-3 rounded-md shadow-sm w-full max-w-[600px]">
      <h4 className="text-sm font-semibold mb-2">nova tarefa</h4>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="titulo"
          className="border border-gray-300 rounded px-2 py-1 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={sending}
        />
        <textarea
          placeholder="descricao (opcional)"
          className="border border-gray-300 rounded px-2 py-1 text-sm resize-none h-16"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={sending}
        />
        {err && <div className="text-xs text-red-600">{err}</div>}
        <button
          type="submit"
          disabled={sending}
          className="bg-pink-400 hover:bg-pink-500 text-white text-xs font-semibold px-3 py-2 rounded disabled:opacity-60"
        >
          {sending ? 'enviando...' : 'adicionar'}
        </button>
      </div>
    </form>
  );
}