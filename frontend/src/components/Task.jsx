import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

export default function Task({ task, index, onOpen }) {
  // evita quebrar se task vier nula
  if (!task || task.id == null) return null;

  function handleClick() {
    onOpen?.(task);
  }

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleClick}
          className={[
            'rounded-md p-2 mb-2 border transition',
            'bg-neutral-900 border-neutral-800 shadow-sm',
            'hover:border-neutral-600 hover:bg-neutral-800 cursor-pointer',
            snapshot.isDragging ? 'bg-neutral-800 border-neutral-600' : ''
          ].join(' ')}
        >
          <p className="text-sm font-semibold text-neutral-100">{task.title || '(Sem Título)'}</p>
          {task.description ? (
            <p className="text-xs text-neutral-300 mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {task.description}
            </p>
          ) : null}
        </div>
      )}
    </Draggable>
  );
}