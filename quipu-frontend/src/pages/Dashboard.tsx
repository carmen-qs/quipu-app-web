import { useState, useEffect } from 'react'
import { Wallet, User, LogOut, TrendingUp, TrendingDown, CreditCard, ShoppingBag, Utensils, Home, Car, Heart, Briefcase, Coffee, LayoutGrid, Target, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

interface Movement {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
}

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  status: 'active' | 'completed' | 'archived'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')
  const [movements, setMovements] = useState<Movement[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserName(user.name || 'Usuario')
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          navigate('/login')
          return
        }

        // Fetch movements
        const movementsRes = await api.get('/movements')
        setMovements(movementsRes.data.data || [])

        // Fetch goals
        const goalsRes = await api.get('/goals')
        setGoals(goalsRes.data.data || [])
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Error al cargar los datos')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    navigate('/login')
  }

  // Calculate metrics from movements
  const calculateMetrics = () => {
    const income = movements
      .filter(m => m.type === 'income')
      .reduce((sum, m) => sum + m.amount, 0)
    const expenses = movements
      .filter(m => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0)
    const balance = income - expenses
    return { balance, income, expenses }
  }

  const { balance, income, expenses } = calculateMetrics()

  // Get recent movements (last 5)
  const recentMovements = movements.slice(-5).reverse()

  // Get active goals
  const activeGoals = goals.filter(g => g.status === 'active')

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      'Alimentación': Utensils,
      'Transporte': Car,
      'Salud': Heart,
      'Educación': Briefcase,
      'Entretenimiento': Coffee,
      'Vivienda': Home,
      'Ropa': ShoppingBag,
      'Otros': CreditCard
    }
    return iconMap[category] || CreditCard
  }

  // Calculate category distribution for donut chart
  const getCategoryDistribution = () => {
    const expenses = movements.filter(m => m.type === 'expense')
    const distribution: { [key: string]: number } = {}
    expenses.forEach(m => {
      distribution[m.category] = (distribution[m.category] || 0) + m.amount
    })
    return distribution
  }

  const categoryDistribution = getCategoryDistribution()
  const totalExpenses = Object.values(categoryDistribution).reduce((sum, val) => sum + val, 0)

  // Get colors for categories
  const categoryColors: { [key: string]: string } = {
    'Alimentación': '#10B981',
    'Transporte': '#3B82F6',
    'Salud': '#EF4444',
    'Educación': '#8B5CF6',
    'Entretenimiento': '#F59E0B',
    'Vivienda': '#EC4899',
    'Ropa': '#6366F1',
    'Otros': '#6B7280'
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
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-600/20 text-emerald-400">
            <LayoutGrid className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link to="/movimientos" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <CreditCard className="w-5 h-5" />
            <span>Movimientos</span>
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
              <h1 className="text-2xl font-medium text-white">{getGreeting()}, {userName}</h1>
              <p className="text-gray-400 text-sm">Aquí está tu resumen financiero</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-auto">

        {loading ? (
          <p className="text-gray-400">Cargando datos...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Balance mes</p>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${balance >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    {balance >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
                <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  S/ {balance.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Ingresos</p>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-emerald-400">S/ {income.toFixed(2)}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Gastos</p>
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-red-400">S/ {expenses.toFixed(2)}</p>
              </div>
            </div>

            {/* Distribution and Recent Movements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-base font-medium text-white mb-4">Distribución de gastos</h2>
                {totalExpenses > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(categoryDistribution).map(([category, amount]) => {
                      const percentage = (amount / totalExpenses) * 100
                      const Icon = getCategoryIcon(category)
                      return (
                        <div key={category} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: categoryColors[category] + '20' }}>
                            <Icon className="w-4 h-4" style={{ color: categoryColors[category] }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-300">{category}</span>
                              <span className="text-sm text-gray-400">{percentage.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: categoryColors[category] }}></div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-400">No hay gastos registrados</p>
                  </div>
                )}
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-base font-medium text-white mb-4">Movimientos recientes</h2>
                <div className="space-y-3">
                  {recentMovements.length === 0 ? (
                    <p className="text-sm text-gray-400">No hay movimientos recientes</p>
                  ) : (
                    recentMovements.map((movement) => {
                      const Icon = getCategoryIcon(movement.category)
                      return (
                        <div key={movement.id} className="flex justify-between items-center py-3 border-b border-gray-700 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-700">
                              <Icon className="w-5 h-5 text-gray-300" />
                            </div>
                            <div>
                              <p className="text-sm text-white">{movement.description}</p>
                              <p className="text-xs text-gray-400">{movement.category}</p>
                            </div>
                          </div>
                          <p className={`text-sm font-semibold ${movement.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {movement.type === 'income' ? '+' : '-'}S/ {movement.amount.toFixed(2)}
                          </p>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Goals Summary */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-medium text-white">Metas activas</h2>
                <Link to="/metas" className="text-sm text-emerald-400 hover:underline">Ver todas</Link>
              </div>
              <div className="space-y-4">
                {activeGoals.length === 0 ? (
                  <p className="text-sm text-gray-400">No hay metas activas</p>
                ) : (
                  activeGoals.map((goal) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100
                    return (
                      <div key={goal.id}>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-white">{goal.name}</p>
                          <p className="text-sm text-gray-400">
                            S/ {goal.currentAmount.toFixed(2)} / S/ {goal.targetAmount.toFixed(2)}
                          </p>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{progress.toFixed(0)}%</p>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </>
        )}
        </main>
      </div>
    </div>
  )
}
