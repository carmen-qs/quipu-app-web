import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Movements from './pages/Movements'
import Goals from './pages/Goals'
import Profile from './pages/Profile'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/movimientos" element={<Movements />} />
      <Route path="/metas" element={<Goals />} />
      <Route path="/perfil" element={<Profile />} />
    </Routes>
  )
}

export default App
