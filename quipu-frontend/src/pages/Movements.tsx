import { useState, useEffect, useRef } from 'react'
import { Wallet, User, LogOut, Search, Plus, LayoutGrid, CreditCard, Target, Settings, Trash2, Edit2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

const CATEGORY_ICONS: { [key: string]: string } = {
  'system-food': '🍽',
  'system-transport': '🚗',
  'system-health': '💊',
  'system-housing': '🏠',
  'system-education': '📚',
  'system-entertainment': '🎬',
  'system-clothing': '👕',
  'system-services': '💡',
  'system-income': '💰',
  'system-other': '📦'
}

export default function Movements() {
  const navigate = useNavigate()
  const [movements, setMovements] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [movementToDelete, setMovementToDelete] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMovements()
    fetchCategories()
  }, [])

  const fetchMovements = async () => {
    try {
      const response = await api.get('/movements')
       console.log("analisis del error: ",response.data)
      const movementsData = response.data.data ?? []
      setMovements(Array.isArray(movementsData) ? movementsData : [])
    } catch (err) {
      console.error('Error fetching movements:', err)
      setMovements([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const handleDelete = async () => {
    if (!movementToDelete) return
    
    try {
      await api.delete(`/movements/${movementToDelete.id}`)
      setMovements(movements.filter(m => m.id !== movementToDelete.id))
      setShowDeleteModal(false)
      setMovementToDelete(null)
    } catch (err) {
      console.error('Error deleting movement:', err)
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


  console.log(movements);
console.log(typeof movements);
console.log(Array.isArray(movements));
  // Filter movements
  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          movement.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || movement.categoryId === selectedCategory
    const matchesType = !selectedType || movement.type === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  })

  // Group by date
  const groupedMovements = filteredMovements.reduce((groups: any, movement) => {
    const [year, month, day] = movement.movementDate.split('-'); const date = new Date(parseInt(year), parseInt(month)-1, parseInt(day)).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(movement)
    return groups
  }, {})

  const getCategoryIcon = (categoryId: string) => {
    return CATEGORY_ICONS[categoryId] || '📦'
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Sin categoría'
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
          <Link to="/movimientos" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-600/20 text-emerald-400">
            <CreditCard className="w-5 h-5" />
            <span className="font-medium">Movimientos</span>
          </Link>
          <Link to="/metas" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <Target className="w-5 h-5" />
            <span>Metas</span>
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
              <h1 className="text-2xl font-medium text-white">Movimientos</h1>
              <p className="text-gray-400 text-sm">Historial de transacciones</p>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                to="/movimientos/nuevo"
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo movimiento</span>
              </Link>
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
          {/* Search and Filters */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar movimientos"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-gray-700 text-white placeholder-gray-400"
                />
              </div>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-10 px-3 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-gray-700 text-white"
              >
                <option value="">Todos los meses</option>
                <option value="2026-05">Mayo 2026</option>
                <option value="2026-04">Abril 2026</option>
                <option value="2026-03">Marzo 2026</option>
              </select>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 px-3 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-gray-700 text-white"
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-10 px-3 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-gray-700 text-white"
              >
                <option value="">Todos los tipos</option>
                <option value="EXPENSE">Gastos</option>
                <option value="INCOME">Ingresos</option>
              </select>
            </div>
          </div>

          {/* Movements List */}
          {loading ? (
            <div className="text-center text-gray-400 py-8">Cargando movimientos...</div>
          ) : Object.keys(groupedMovements).length === 0 ? (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
              <p className="text-gray-400">No se encontraron movimientos</p>
            </div>
          ) : (
            Object.entries(groupedMovements).map(([date, dayMovements]: [string, any]) => (
              <div key={date} className="bg-gray-800 rounded-xl border border-gray-700 mb-4">
                <div className="p-4 border-b border-gray-700">
                  <p className="text-sm font-medium text-white">{date}</p>
                </div>
                <div className="divide-y divide-gray-700">
                  {dayMovements.map((movement: any) => (
                    <div key={movement.id} className="p-4 flex justify-between items-center hover:bg-gray-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor: movement.category?.color ? movement.category.color + "33" : movement.type === "INCOME" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}}>
                          <span className="text-lg">{movement.category?.icon || getCategoryIcon(movement.categoryId)}</span>
                        </div>
                        <div>
                          <p className="text-sm text-white">{movement.description}</p>
                          <p className="text-xs text-gray-400">{getCategoryName(movement.categoryId)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={`text-sm font-medium ${movement.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {movement.type === 'INCOME' ? '+' : '-'}S/ {movement.amount}
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/movimientos/${movement.id}/editar`)}
                            className="text-gray-400 hover:text-white"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setMovementToDelete(movement)
                              setShowDeleteModal(true)
                            }}
                            className="text-gray-400 hover:text-red-400"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && movementToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
            <h2 className="text-lg font-medium text-white mb-4">¿Eliminar este movimiento?</h2>
            <p className="text-sm text-gray-400 mb-2">{movementToDelete.description}</p>
            <p className="text-sm text-gray-400 mb-6">
              S/ {movementToDelete.amount} · {new Date(movementToDelete.movementDate).toLocaleDateString('es-ES')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setMovementToDelete(null)
                }}
                className="flex-1 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
