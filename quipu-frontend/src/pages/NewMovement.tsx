import { useState } from 'react'
import { Wallet, ArrowLeft, Sparkles, Calendar, DollarSign } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

const SYSTEM_CATEGORIES = [
  { id: 'system-food', name: 'Alimentación', icon: '🍽', type: 'EXPENSE' },
  { id: 'system-transport', name: 'Transporte', icon: '🚗', type: 'EXPENSE' },
  { id: 'system-health', name: 'Salud', icon: '💊', type: 'EXPENSE' },
  { id: 'system-housing', name: 'Vivienda', icon: '🏠', type: 'EXPENSE' },
  { id: 'system-education', name: 'Educación', icon: '📚', type: 'EXPENSE' },
  { id: 'system-entertainment', name: 'Entretenimiento', icon: '🎬', type: 'EXPENSE' },
  { id: 'system-clothing', name: 'Ropa', icon: '👕', type: 'EXPENSE' },
  { id: 'system-services', name: 'Servicios', icon: '💡', type: 'EXPENSE' },
  { id: 'system-salary', name: 'Sueldo', icon: '💰', type: 'INCOME' },
  { id: 'system-freelance', name: 'Freelance', icon: '💻', type: 'INCOME' },
  { id: 'system-business', name: 'Negocio', icon: '🏪', type: 'INCOME' },
  { id: 'system-investments', name: 'Inversiones', icon: '📈', type: 'INCOME' },
  { id: 'system-transfers', name: 'Transferencias', icon: '💸', type: 'INCOME' },
  { id: 'system-other-income', name: 'Otros ingresos', icon: '�', type: 'INCOME' },
  { id: 'system-other', name: 'Otros', icon: '📦', type: 'EXPENSE' }
]

export default function NewMovement() {
  const navigate = useNavigate()
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiParsed, setAiParsed] = useState<any>(null)
  
  // Form fields
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const today = new Date(); const [date, setDate] = useState(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`)
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleParseText = async () => {
    setAiLoading(true)
    
    try {
      const response = await api.post('/movements/parse', { text: aiText })
      setAiParsed(response.data)
      
      // Pre-fill form with AI interpretation
      setType(response.data.type === 'INCOME' ? 'INCOME' : 'EXPENSE')
      setAmount(response.data.amount.toString())
      setCategory(response.data.category)
      setDescription(response.data.description)
      
      // Auto-save directly without requiring manual confirmation
      await handleAiSave(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar texto')
    } finally {
      setAiLoading(false)
    }
  }

  const handleAiSave = async (parsedData: any) => {
    setError('')
    setSaving(true)
    
    try {
      // Find category ID from name - match by type as well
      const categoryObj = SYSTEM_CATEGORIES.find(c => 
        c.name === parsedData.category && c.type === parsedData.type
      )
      const categoryId = categoryObj?.id || (parsedData.type === 'INCOME' ? 'system-other-income' : 'system-other')
      
      console.log('AI parsed data:', parsedData)
      console.log('Selected category:', categoryObj, 'categoryId:', categoryId)
      
      await api.post('/movements', {
        type: parsedData.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
        amount: parsedData.amount,
        description: parsedData.description,
        categoryId,
        source: 'AI_PARSED',
        originalText: aiText,
        movementDate: new Date().toISOString().split('T')[0]
      })
      
      navigate('/movimientos')
    } catch (err) {
      console.error('Error saving AI movement:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar movimiento')
      setSaving(false)
    }
  }

  const handleSave = async () => {
    setError('')
    
    // Validate required fields
    if (!description.trim()) {
      setError('La descripción es requerida')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }
    if (!category) {
      setError('Debes seleccionar una categoría')
      return
    }
    
    setSaving(true)
    
    try {
      // Find category ID from name - match by type as well
      const categoryObj = SYSTEM_CATEGORIES.find(c => c.name === category && c.type === type)
      const categoryId = categoryObj?.id || (type === 'INCOME' ? 'system-other-income' : 'system-other')
      
      console.log('Manual save - type:', type, 'category:', category, 'categoryId:', categoryId)
      
      await api.post('/movements', {
        type,
        amount: parseFloat(amount),
        description: description.trim(),
        categoryId,
        source: aiParsed ? 'AI_PARSED' : 'MANUAL',
        originalText: aiText,
        movementDate: date
      })
      
      navigate('/movimientos')
    } catch (err) {
      console.error('Error saving movement:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar movimiento')
    } finally {
      setSaving(false)
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
              <h1 className="text-2xl font-medium text-white">Nuevo movimiento</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-2xl mx-auto">
            {/* AI Input Section */}
            <div className="mb-8">
              <label className="block text-sm text-gray-400 mb-2">
                Describe tu movimiento en lenguaje natural (se guardará automáticamente)
              </label>
              <textarea
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder="Ej: gasté 45 soles en medicamentos para la gripe"
                className="w-full h-24 p-4 border border-gray-600 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-800 text-white placeholder-gray-500 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-2">
                Ej: "pagué 150 por internet", "cobré 3500 de sueldo"
              </p>
              <button
                onClick={handleParseText}
                disabled={aiLoading || !aiText.trim()}
                className="mt-4 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                {aiLoading ? 'Procesando...' : 'Guardar con IA'}
              </button>
            </div>

            {/* Manual Form */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-4">O ingresa manualmente</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value as 'EXPENSE' | 'INCOME')
                      setCategory('') // Reset category when type changes
                    }}
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
                    {SYSTEM_CATEGORIES.filter(cat => cat.type === type).map(cat => (
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
                <label className="block text-sm text-gray-400 mb-2">Descripción</label>
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
              {saving ? 'Guardando...' : 'Guardar movimiento'}
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
