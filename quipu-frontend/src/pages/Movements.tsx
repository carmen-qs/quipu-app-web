import { useState } from 'react'
import { Wallet, User, LogOut, Search, X, Sparkles, LayoutGrid, CreditCard, Target, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Movements() {
  const navigate = useNavigate()
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiParsed, setAiParsed] = useState<any>(null)
  const [aiError, setAiError] = useState('')


  const handleParseText = async () => {
    setAiError('')
    setAiLoading(true)
    
    try {
      const response = await api.post('/movements/parse', { text: aiText })
      setAiParsed(response.data)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Error al procesar texto')
    } finally {
      setAiLoading(false)
    }
  }

  const handleCreateMovement = async () => {
    if (!aiParsed) return
    
    try {
      // Get category ID from category name (simplified - in real app would fetch categories)
      const categoryMap: { [key: string]: string } = {
        'Alimentación': 'system-food',
        'Transporte': 'system-transport',
        'Salud': 'system-health',
        'Educación': 'system-education',
        'Entretenimiento': 'system-entertainment',
        'Vivienda': 'system-housing',
        'Ropa': 'system-clothing',
        'Otros': 'system-other'
      }
      
      const categoryId = categoryMap[aiParsed.category] || 'system-other'
      
      await api.post('/movements', {
        type: aiParsed.type,
        amount: aiParsed.amount,
        description: aiParsed.description,
        categoryId: categoryId,
        source: 'AI_PARSED',
        originalText: aiText
      })
      
      // Close modal and refresh
      setShowAIModal(false)
      setAiText('')
      setAiParsed(null)
      window.location.reload()
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Error al crear movimiento')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    navigate('/login')
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
        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors w-full">
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium text-white">Movimientos</h1>
              <p className="text-gray-400 text-sm">Gestiona tus transacciones</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAIModal(true)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Registrar con IA</span>
              </button>
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
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
                className="w-full h-10 pl-10 pr-3 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-gray-700 text-white placeholder-gray-400"
              />
            </div>
            <select className="h-10 px-3 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-gray-700 text-white">
              <option>Mayo 2026</option>
            </select>
            <select className="h-10 px-3 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-gray-700 text-white">
              <option>Todas las categorías</option>
            </select>
            <select className="h-10 px-3 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-gray-700 text-white">
              <option>Tipo</option>
            </select>
          </div>
        </div>

        {/* Movements List */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <p className="text-sm font-medium text-white">27 de mayo</p>
          </div>
          <div className="divide-y divide-gray-700">
            <div className="p-4 flex justify-between items-center hover:bg-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">💊</span>
                </div>
                <div>
                  <p className="text-sm text-white">Medicamentos gripe</p>
                  <p className="text-xs text-gray-400">Salud · 15:30</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-red-400">-S/ 45</p>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-white">✏️</button>
                  <button className="text-gray-400 hover:text-red-400">🗑</button>
                </div>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center hover:bg-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🍽</span>
                </div>
                <div>
                  <p className="text-sm text-white">Almuerzo menú día</p>
                  <p className="text-xs text-gray-400">Alimentación · 13:00</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-red-400">-S/ 12</p>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-white">✏️</button>
                  <button className="text-gray-400 hover:text-red-400">🗑</button>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-gray-700">
            <p className="text-sm text-gray-400 text-center">Mostrando 2 de 47 · Cargar más</p>
          </div>
        </div>
        </main>
      </div>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Registrar con IA
              </h2>
              <button onClick={() => setShowAIModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!aiParsed ? (
              <>
                <p className="text-sm text-gray-400 mb-4">
                  Describe tu movimiento en lenguaje natural, por ejemplo: "gasté 35 soles en almuerzo"
                </p>
                <textarea
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="Escribe tu movimiento aquí..."
                  className="w-full h-32 p-3 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-gray-700 text-white placeholder-gray-400 resize-none"
                  maxLength={500}
                />
                {aiError && (
                  <p className="text-sm text-red-400 mt-2">{aiError}</p>
                )}
                <button
                  onClick={handleParseText}
                  disabled={aiLoading || !aiText.trim()}
                  className="w-full mt-4 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? 'Procesando...' : 'Procesar con IA'}
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-4">
                  La IA interpretó tu movimiento. Confirma o edita antes de guardar:
                </p>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-400">Tipo:</span>
                    <span className={`text-sm font-medium ${aiParsed.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {aiParsed.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-400">Monto:</span>
                    <span className="text-sm font-medium text-white">S/ {aiParsed.amount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-400">Descripción:</span>
                    <span className="text-sm font-medium text-white">{aiParsed.description}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-400">Categoría:</span>
                    <span className="text-sm font-medium text-white">{aiParsed.category}</span>
                  </div>
                </div>
                {aiError && (
                  <p className="text-sm text-red-400 mb-4">{aiError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setAiParsed(null)}
                    className="flex-1 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-white"
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleCreateMovement}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
