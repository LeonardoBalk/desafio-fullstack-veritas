import { DragDropContext } from '@hello-pangea/dnd';
import React, { useState } from 'react';
import Column from './Column.jsx';

export default function KanbanBoard(){
    const [completed, setCompleted] = useState([]);
    const [inComplete, setInComplete] = useState([]);


    return ( 
    <DragDropContext>
        <h2 className='align-center'>Em progresso</h2>
        <div className='flex items-center justify-between flex-row'>
            
             <Column title="Em progresso" tasks={inComplete} id="incomplete" id={"1"} />
            </div>

           



    </DragDropContext>
    );
}