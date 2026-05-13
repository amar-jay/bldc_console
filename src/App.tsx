import { Routes, Route} from 'react-router-dom'
import './App.css'
import Settings from './windows/settings'
import Main from './windows/main'
import { Toaster } from "@/components/ui/sonner"
import Console from './windows/console'


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/settings" element={<Settings />} />
				<Route path="/console" element={<Console/>} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
