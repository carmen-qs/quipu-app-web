import { useState, useEffect } from 'react'
import { Wallet, ArrowLeft, Calendar, DollarSign } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

const SYSTEM_CATEGORIES = [
  { id: 'system-food', name: 'Alimentación', icon: '🍽' },
  { id: 'system-transport', name: 'Transporte', icon: '🚗' },
  { id: 'system-health', name: 'Salud', icon: '💊' },
  { id: 'system-housing', name: 'Vivienda', icon: '🏠' },
  { id: 'system-education', name: 'Educación', icon: '📚' },
  { id: 'system-entertainment', name: 'Entretenimiento', icon: '🎬' },
  { id: 'system-clothing', name: 'Ropa', icon: '👕' },
  { id: 'system-services', name: 'Servicios', icon: '💡' },
  { id: 'system-income', name: 'Ingresos', icon: '💰' },
  { id: 'system-other', name: 'Otros', icon: '📦' }
]

export default function EditMovement() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchMovement()
    }
  }, [id])

  const fetchMovement = async () => {
    try {
      const response = await api.get(`/movements/${id}`)
      const movement = response.data
      
      setType(movement.type)
      setAmount(movement.amount.toString())
      setCategory(movement.category?.name || '')
      setDate(movement.movementDate || new Date().toISOString().split('T')[0])
      setDescription(movement.description || '')
    } catch (err) {
      setError('Error al cargar el movimiento')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setError('')
    setSaving(true)
    
    try {
      // Find category ID from name
      const categoryObj = SYSTEM_CATEGORIES.find(c => c.name === category)
      const categoryId = categoryObj?.id || 'system-other'
      
      await api.put(`/movements/${id}`, {
        type,
        amount: parseFloat(amount),
        description,
        categoryId,
        movementDate: date
      })
      
      navigate('/movimientos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar movimiento')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    )
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
            <span>Dashboard</span>
          </Link>
          <Link to="/movimientos" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-600/20 text-emerald-400">
            <span className="font-medium">Movimientos</span>
          </Link>
          <Link to="/metas" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <span>Metas</span>
          </Link>
          <Link to="/perfil" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <span>Perfil</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/movimientos" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-medium text-white">Editar movimiento</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-2xl mx-auto">
            {/* Form */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'EXPENSE' | 'INCOME')}
                    className="w-full h-12 px-4 border border-gray-600 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-800 text-white"
                  >
                    <option value="EXPENSE">Gasto</option>
                    <option value="INCOME">Ingreso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Monto (S/)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-12 pl-10 pr-4 border border-gray-600 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-800 text-white placeholder-gray-500"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-12 px-4 border border-gray-600 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-800 text-white"
                    required
                  >
                    <option value="">Seleccionar</option>
                    {SYSTEM_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Fecha</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 border border-gray-600 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-800 text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Descripción (opcional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Añade más detalles..."
                  className="w-full h-24 p-4 border border-gray-600 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-800 text-white placeholder-gray-500 resize-none"
                  maxLength={200}
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !amount || !category}
              className="w-full h-12 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
