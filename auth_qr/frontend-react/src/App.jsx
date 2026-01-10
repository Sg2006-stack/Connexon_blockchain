import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import UserPortal from './pages/UserPortal'
import AdminPortal from './pages/AdminPortal'
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="app">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<UserPortal />} />
          <Route path="/admin" element={<AdminPortal />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App
