import { Wallet, User, LogOut, Plus, LayoutGrid, CreditCard, Target, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function Goals() {
  const navigate = useNavigate()

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
              <h1 className="text-2xl font-medium text-white">Metas de ahorro</h1>
              <p className="text-gray-400 text-sm">Alcanza tus objetivos financieros</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Nueva meta</span>
              </button>
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-auto">
          {/* Goals List */}
          <div className="space-y-4">
            {/* Active Goal */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-medium text-white">Viaje a Cusco</h3>
                  <p className="text-sm text-gray-400">Vence el 15/07/2026 · 45 días</p>
                </div>
                <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 text-xs rounded-full">Activa</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-white">S/ 930 de S/ 1,500</p>
                  <p className="text-sm font-medium text-emerald-400">62%</p>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm">
                  + Agregar aporte
                </button>
                <button className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-sm text-white">
                  ✏ Editar
                </button>
                <button className="px-4 py-2 text-gray-400 hover:text-red-400 text-sm">
                  🗑
                </button>
              </div>
            </div>

            {/* Another Active Goal */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-medium text-white">Laptop nueva</h3>
                  <p className="text-sm text-gray-400">Vence el 25/08/2026 · 90 días</p>
                </div>
                <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 text-xs rounded-full">Activa</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-white">S/ 560 de S/ 2,000</p>
                  <p className="text-sm font-medium text-emerald-400">28%</p>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm">
                  + Agregar aporte
                </button>
                <button className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-sm text-white">
                  ✏ Editar
                </button>
                <button className="px-4 py-2 text-gray-400 hover:text-red-400 text-sm">
                  🗑
                </button>
              </div>
            </div>

            {/* Completed Goal */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-medium text-white">Fondo de emergencia</h3>
                  <p className="text-sm text-gray-400">Completada el 10/04/2026</p>
                </div>
                <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 text-xs rounded-full">✓ Completada</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-white">S/ 1,000 de S/ 1,000</p>
                  <p className="text-sm font-medium text-emerald-400">100%</p>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <button className="w-full py-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-sm text-white">
                Archivar
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
