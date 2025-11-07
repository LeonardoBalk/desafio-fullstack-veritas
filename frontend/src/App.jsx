import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import KanbanBoard from './components/KanbanBoard.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='App'>
     <KanbanBoard />
    </div>
  )
}

export default App
