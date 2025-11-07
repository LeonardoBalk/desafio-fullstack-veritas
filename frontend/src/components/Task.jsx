import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

export default function Task({ task, index, onEdit, onDelete }) {
  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white border border-gray-300 rounded-md p-2 mb-2 shadow-sm transition
            ${snapshot.isDragging ? 'bg-pink-50 border-pink-300' : ''}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{task.title}</p>
              {task.description ? (
                <p className="text-xs text-gray-600 mt-1">{task.description}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit?.(task)}
                className="text-xs px-2 py-1 rounded bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(task)}
                className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}