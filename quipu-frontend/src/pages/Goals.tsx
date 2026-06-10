import { useState, useEffect, useRef } from 'react'
import { Wallet, User, LogOut, Plus, LayoutGrid, CreditCard, Target, Settings, Edit2, Trash2, Archive } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  status: 'active' | 'completed' | 'archived'
  createdAt: string
}

export default function Goals() {
  const navigate = useNavigate()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showContributionModal, setShowContributionModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [contributionAmount, setContributionAmount] = useState('')
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', deadline: '' })
  const [editGoal, setEditGoal] = useState({ name: '', targetAmount: '', deadline: '' })
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals')
      setGoals(response.data.data || [])
    } catch (err) {
      console.error('Error fetching goals:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    navigate('/login')
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCreateGoal = async () => {
    try {
      await api.post('/goals', {
        name: newGoal.name,
        targetAmount: parseFloat(newGoal.targetAmount),
        currentAmount: 0,
        targetDate: newGoal.deadline + 'T12:00:00.000Z',
        status: 'active'
      })
      setShowAddModal(false)
      setNewGoal({ name: '', targetAmount: '', deadline: '' })
      fetchGoals()
    } catch (err) {
      console.error('Error creating goal:', err)
    }
  }

  const handleAddContribution = async () => {
    if (!selectedGoal) return
    try {
      await api.post(`/goals/${selectedGoal.id}/contributions`, {
        amount: parseFloat(contributionAmount)
      })
      setShowContributionModal(false)
      setContributionAmount('')
      setSelectedGoal(null)
      fetchGoals()
    } catch (err) {
      console.error('Error adding contribution:', err)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta meta?')) return
    try {
      await api.delete(`/goals/${goalId}`)
      fetchGoals()
    } catch (err) {
      console.error('Error deleting goal:', err)
    }
  }

  const handleArchiveGoal = async (goalId: string) => {
    try {
      await api.post(`/goals/${goalId}/archive`)
      fetchGoals()
    } catch (err) {
      console.error('Error archiving goal:', err)
    }
  }

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal)
    setEditGoal({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      deadline: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : ''
    })
    setShowEditModal(true)
  }

  const handleUpdateGoal = async () => {
    if (!selectedGoal) return
    try {
      await api.patch(`/goals/${selectedGoal.id}`, {
        name: editGoal.name,
        targetAmount: parseFloat(editGoal.targetAmount),
        targetDate: editGoal.deadline + 'T12:00:00.000Z'
      })
      setShowEditModal(false)
      setEditGoal({ name: '', targetAmount: '', deadline: '' })
      setSelectedGoal(null)
      fetchGoals()
    } catch (err) {
      console.error('Error updating goal:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-emerald-400" />
            <span className="text-xl font-semibold text-white">Quipu</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <LayoutGrid className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/movimientos" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <CreditCard className="w-5 h-5" />
            <span>Movimientos</span>
          </Link>
          <Link to="/metas" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-600/20 text-emerald-400">
            <Target className="w-5 h-5" />
            <span className="font-medium">Metas</span>
          </Link>
          <Link to="/perfil" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
            <span>Perfil</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium text-white">Metas de ahorro</h1>
              <p className="text-gray-400 text-sm">Alcanza tus objetivos financieros</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva meta</span>
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center hover:bg-emerald-500 transition-colors focus:outline-none"
                >
                  <User className="w-5 h-5 text-white" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-medium text-white">{JSON.parse(localStorage.getItem('user') || '{}').name || 'Usuario'}</p>
                      <p className="text-xs text-gray-400 truncate">{JSON.parse(localStorage.getItem('user') || '{}').email || ''}</p>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { setShowUserMenu(false); navigate('/perfil') }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                        <User className="w-4 h-4" />Mi perfil
                      </button>
                      <div className="border-t border-gray-700 mt-1 pt-1">
                        <button onClick={() => { setShowUserMenu(false); handleLogout() }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                          <LogOut className="w-4 h-4" />Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-auto">
          {loading ? (
            <p className="text-gray-400">Cargando metas...</p>
          ) : (
            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
                  <p className="text-gray-400">No tienes metas de ahorro aún</p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Crear primera meta
                  </button>
                </div>
              ) : (
                goals.map((goal) => {
                  const currentAmount = Number(goal.currentAmount) || 0
                  const targetAmount = Number(goal.targetAmount) || 0
                  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
                  const [gy, gm, gd] = (goal.targetDate || '').split('T')[0].split('-'); const deadlineDate = goal.targetDate ? new Date(parseInt(gy), parseInt(gm)-1, parseInt(gd)) : new Date('invalid')
                  const isValidDate = !isNaN(deadlineDate.getTime())
                  const daysRemaining = isValidDate ? Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
                  const isCompleted = progress >= 100
                  
                  return (
                    <div key={goal.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-base font-medium text-white">{goal.name}</h3>
                          <p className="text-sm text-gray-400">
                            {isCompleted 
                              ? `Completada el ${isValidDate ? deadlineDate.toLocaleDateString('es-PE') : 'Fecha no disponible'}`
                              : `Vence el ${isValidDate ? deadlineDate.toLocaleDateString('es-PE') : 'Fecha no disponible'} · ${daysRemaining > 0 ? `${daysRemaining} días` : 'Vencida'}`
                            }
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          isCompleted 
                            ? 'bg-emerald-600/20 text-emerald-400' 
                            : goal.status === 'archived'
                            ? 'bg-gray-600/20 text-gray-400'
                            : 'bg-emerald-600/20 text-emerald-400'
                        }`}>
                          {isCompleted ? '✓ Completada' : goal.status === 'archived' ? 'Archivada' : 'Activa'}
                        </span>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-white">S/ {currentAmount.toFixed(0)} de S/ {targetAmount.toFixed(0)}</p>
                          <p className="text-sm font-medium text-emerald-400">{progress.toFixed(0)}%</p>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!isCompleted && goal.status !== 'archived' && (
                          <button 
                            onClick={() => {
                              setSelectedGoal(goal)
                              setShowContributionModal(true)
                            }}
                            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                          >
                            + Agregar aporte
                          </button>
                        )}
                        <button 
                          onClick={() => handleEditGoal(goal)}
                          className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-sm text-white flex items-center gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="px-4 py-2 text-gray-400 hover:text-red-400 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {isCompleted && (
                          <button 
                            onClick={() => handleArchiveGoal(goal.id)}
                            className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-sm text-white flex items-center gap-1"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </main>

        {/* Add Goal Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-white mb-4">Nueva meta de ahorro</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    className="w-full h-12 px-4 border border-gray-600 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-700 text-white"
                    placeholder="Ej: Viaje a Cusco"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Monto objetivo (S/)</label>
                  <input
                    type="number"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    className="w-full h-12 px-4 border border-gray-600 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-700 text-white"
                    placeholder="1500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Fecha límite</label>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="w-full h-12 px-4 border border-gray-600 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateGoal}
                  disabled={!newGoal.name || !newGoal.targetAmount || !newGoal.deadline}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crear meta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Contribution Modal */}
        {showContributionModal && selectedGoal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-white mb-4">Agregar aporte a {selectedGoal.name}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Monto del aporte (S/)</label>
                  <input
                    type="number"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="w-full h-12 px-4 border border-gray-600 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-700 text-white"
                    placeholder="100"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowContributionModal(false)
                    setContributionAmount('')
                    setSelectedGoal(null)
                  }}
                  className="flex-1 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddContribution}
                  disabled={!contributionAmount}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Goal Modal */}
        {showEditModal && selectedGoal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-white mb-4">Editar meta</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={editGoal.name}
                    onChange={(e) => setEditGoal({ ...editGoal, name: e.target.value })}
                    className="w-full h-12 px-4 border border-gray-600 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Monto objetivo (S/)</label>
                  <input
                    type="number"
                    value={editGoal.targetAmount}
                    onChange={(e) => setEditGoal({ ...editGoal, targetAmount: e.target.value })}
                    className="w-full h-12 px-4 border border-gray-600 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Fecha límite</label>
                  <input
                    type="date"
                    value={editGoal.deadline}
                    onChange={(e) => setEditGoal({ ...editGoal, deadline: e.target.value })}
                    className="w-full h-12 px-4 border border-gray-600 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditGoal({ name: '', targetAmount: '', deadline: '' })
                    setSelectedGoal(null)
                  }}
                  className="flex-1 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateGoal}
                  disabled={!editGoal.name || !editGoal.targetAmount || !editGoal.deadline}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
