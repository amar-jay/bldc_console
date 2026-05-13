import { Routes, Route} from 'react-router-dom'
import './App.css'
import Settings from './windows/settings'
import Main from './windows/main'


function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

export default App
