import { useState, useEffect, useRef } from 'react'
import { Wallet, User, LogOut, TrendingUp, TrendingDown, CreditCard, ShoppingBag, Utensils, Home, Car, Heart, Briefcase, Coffee, LayoutGrid, Target, Settings } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'

interface Movement {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: {
    id: string
    name: string
    icon: string
    color: string
    type: string
  }
  movementDate: string
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
  const location = useLocation()
  const [userName, setUserName] = useState('')
  const [movements, setMovements] = useState<Movement[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserName(user.name || 'Usuario')
    }
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        navigate('/login')
        return
      }

      // Fetch movements
      const movementsRes = await api.get('/movements')
      console.log('Movements response:', movementsRes.data)
      setMovements(movementsRes.data.data || [])

      // Fetch goals (optional - don't fail if this errors)
      try {
        const goalsRes = await api.get('/goals')
        setGoals(goalsRes.data.data || [])
      } catch (goalsErr) {
        console.warn('Goals endpoint not available:', goalsErr)
        setGoals([])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [navigate])

  // Re-fetch data when user navigates back to Dashboard
  useEffect(() => {
    fetchData()
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    navigate('/login')
  }

  // Calculate metrics from movements
  const calculateMetrics = () => {
    const income = movements
      .filter(m => m.type === 'INCOME')
      .reduce((sum, m) => sum + (m.amount || 0), 0)
    const expenses = movements
      .filter(m => m.type === 'EXPENSE')
      .reduce((sum, m) => sum + (m.amount || 0), 0)
    const balance = income - expenses
    return { balance, income, expenses }
  }

  const { balance, income, expenses } = calculateMetrics()

  // Get recent movements (last 5)
  const recentMovements = movements.slice(-5).reverse()

  // Get active goals
  const activeGoals = goals.filter(g => {
    const currentAmount = Number(g.currentAmount) || 0
    const targetAmount = Number(g.targetAmount) || 0
    const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
    const isCompleted = progress >= 100
    return (g.status === 'active' || (!g.status && !isCompleted)) && !isCompleted
  })

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  // Get category icon
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: any } = {
      'Alimentación': Utensils,
      'Transporte': Car,
      'Salud': Heart,
      'Educación': Briefcase,
      'Entretenimiento': Coffee,
      'Vivienda': Home,
      'Ropa': ShoppingBag,
      'Otros gastos': CreditCard,
      'Otros ingresos': CreditCard
    }
    return iconMap[categoryName] || CreditCard
  }

  // Calculate category distribution for donut chart
  const getCategoryDistribution = () => {
    const expenses = movements.filter(m => m.type === 'EXPENSE')
    const distribution: { [key: string]: number } = {}
    expenses.forEach(m => {
      distribution[m.category.name] = (distribution[m.category.name] || 0) + m.amount
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
    'Vestimenta': '#F59E0B',
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
            <div className="flex items-center gap-3 relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center hover:bg-emerald-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <User className="w-5 h-5 text-white" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">{userName}</p>
                      <p className="text-xs text-gray-400 truncate">{JSON.parse(localStorage.getItem('user') || '{}').email || ''}</p>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { setShowUserMenu(false); navigate('/perfil') }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                      <User className="w-4 h-4" />Mi perfil
                    </button>
                    <button onClick={() => { setShowUserMenu(false); navigate('/perfil') }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                      <Settings className="w-4 h-4" />Configuración
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
                  <div className="flex items-center gap-6">
                    {/* Pie Chart */}
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {(() => {
                          let cumulativePercent = 0
                          return Object.entries(categoryDistribution).map(([category, amount]) => {
                            const percentage = (amount / totalExpenses) * 100
                            const startPercent = cumulativePercent
                            cumulativePercent += percentage
                            const endPercent = cumulativePercent
                            
                            const startAngle = (startPercent / 100) * 2 * Math.PI
                            const endAngle = (endPercent / 100) * 2 * Math.PI
                            
                            const x1 = 50 + 40 * Math.cos(startAngle)
                            const y1 = 50 + 40 * Math.sin(startAngle)
                            const x2 = 50 + 40 * Math.cos(endAngle)
                            const y2 = 50 + 40 * Math.sin(endAngle)
                            
                            const largeArcFlag = percentage > 50 ? 1 : 0
                            
                            const pathData = percentage === 100
                              ? `M 50 50 m -40 0 a 40 40 0 1 0 80 0 a 40 40 0 1 0 -80 0`
                              : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
                            
                            return (
                              <path
                                key={category}
                                d={pathData}
                                fill={categoryColors[category]}
                                className="hover:opacity-80 transition-opacity"
                              />
                            )
                          })
                        })()}
                      </svg>
                      {/* Center hole for donut effect */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                          <span className="text-sm text-gray-400">S/ {totalExpenses.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex-1 space-y-2">
                      {Object.entries(categoryDistribution).map(([category, amount]) => {
                        const percentage = (amount / totalExpenses) * 100
                        return (
                          <div key={category} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: categoryColors[category] }}
                            />
                            <span className="text-sm text-gray-300 flex-1">{category}</span>
                            <span className="text-sm text-gray-400">{percentage.toFixed(0)}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-400">No hay gastos registrados</p>
                  </div>
                )}
              </div>

              {/* Monthly Trend Chart */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-medium text-white">Tendencia mensual</h2>
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                      <span className="text-gray-400">Ingresos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-gray-400">Gastos</span>
                    </div>
                  </div>
                </div>
                {movements.length > 0 ? (
                  <div className="h-48">
                    {(() => {
                      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
                      const today = new Date()
                      const last6Months = []
                      for (let i = 5; i >= 0; i--) {
                        const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
                        last6Months.push({
                          key: `${d.getFullYear()}-${d.getMonth()}`,
                          name: monthNames[d.getMonth()],
                          isCurrent: d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
                        })
                      }

                      const monthlyData = movements.reduce((acc: any, m) => {
                        const d = new Date(m.movementDate)
                        const key = `${d.getFullYear()}-${d.getMonth()}`
                        if (!acc[key]) acc[key] = { income: 0, expense: 0 }
                        if (m.type === 'INCOME') acc[key].income += m.amount
                        if (m.type === 'EXPENSE') acc[key].expense += m.amount
                        return acc
                      }, {})

                      const allValues = last6Months.map(m => {
                        const data = monthlyData[m.key] || { income: 0, expense: 0 }
                        return Math.max(data.income, data.expense)
                      })
                      const maxValue = Math.max(...allValues, 1)

                      return (
                        <div className="h-full flex items-end justify-between gap-2">
                          {last6Months.map((month) => {
                            const data = monthlyData[month.key] || { income: 0, expense: 0 }
                            const hasData = data.income > 0 || data.expense > 0
                            const incomeHeight = (data.income / maxValue) * 100
                            const expenseHeight = (data.expense / maxValue) * 100
                            
                            return (
                              <div key={month.key} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex gap-1 items-end h-32">
                                  <div 
                                    className={`flex-1 rounded-t transition-all relative group ${
                                      hasData 
                                        ? 'bg-emerald-500 hover:bg-emerald-400' 
                                        : 'bg-gray-700'
                                    }`}
                                    style={{ height: `${Math.max(incomeHeight, hasData ? 2 : 0)}%`, minHeight: hasData ? '4px' : '2px' }}
                                  >
                                    {hasData && (
                                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        S/ {data.income.toFixed(0)}
                                      </div>
                                    )}
                                  </div>
                                  <div 
                                    className={`flex-1 rounded-t transition-all relative group ${
                                      hasData 
                                        ? 'bg-red-500 hover:bg-red-400' 
                                        : 'bg-gray-700'
                                    }`}
                                    style={{ height: `${Math.max(expenseHeight, hasData ? 2 : 0)}%`, minHeight: hasData ? '4px' : '2px' }}
                                  >
                                    {hasData && (
                                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        S/ {data.expense.toFixed(0)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <span className={`text-xs font-medium ${month.isCurrent ? 'text-emerald-400' : 'text-gray-400'}`}>
                                  {month.name}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-400">No hay datos suficientes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Movements */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
              <h2 className="text-base font-medium text-white mb-4">Movimientos recientes</h2>
              <div className="space-y-3">
                {recentMovements.length === 0 ? (
                  <p className="text-sm text-gray-400">No hay movimientos recientes</p>
                ) : (
                  recentMovements.map((movement) => {
                    const Icon = getCategoryIcon(movement.category.name)
                    return (
                      <div key={movement.id} className="flex justify-between items-center py-3 border-b border-gray-700 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-700">
                            <Icon className="w-5 h-5 text-gray-300" />
                          </div>
                          <div>
                            <p className="text-sm text-white">{movement.description}</p>
                            <p className="text-xs text-gray-400">{movement.category.name}</p>
                          </div>
                        </div>
                        <p className={`text-sm font-semibold ${movement.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {movement.type === 'INCOME' ? '+' : '-'}S/ {movement.amount.toFixed(2)}
                        </p>
                      </div>
                    )
                  })
                )}
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
