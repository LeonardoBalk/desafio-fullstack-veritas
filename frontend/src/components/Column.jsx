import { Droppable } from '@hello-pangea/dnd';
import React from 'react';

export default function Column({ title, tasks, id }) {
  return (
    <div className="bg-gray-100 border border-gray-400 rounded-sm w-[300px] h-[475px] overflow-y-auto scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent">
      <h3 className="bg-pink-300 text-center p-2 mb-2 font-semibold">{title}</h3>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-2 transition-colors duration-200 flex-grow min-h-[100px] ${
              snapshot.isDraggingOver ? 'bg-pink-100' : 'bg-white'
            }`}
          >
            {/* tasks */}
            {tasks?.map((task, index) => (
              <div
                key={task.id}
                className="bg-white border border-gray-300 rounded-md p-2 mb-2 shadow-sm"
              >
                {task.content}
              </div>
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
