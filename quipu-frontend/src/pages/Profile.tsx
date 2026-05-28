import { Wallet, User, LogOut, LayoutGrid, CreditCard, Target, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Profile() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserName(user.name || 'Usuario')
      setUserEmail(user.email || '')
    }
  }, [])

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
          <Link to="/metas" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <Target className="w-5 h-5" />
            <span>Metas</span>
          </Link>
          <Link to="/perfil" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-600/20 text-emerald-400">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Perfil</span>
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
              <h1 className="text-2xl font-medium text-white">Perfil</h1>
              <p className="text-gray-400 text-sm">Configura tu cuenta</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-white">{userName}</h2>
                <p className="text-sm text-gray-400">{userEmail}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nombre completo</label>
                <input
                  type="text"
                  defaultValue={userName}
                  className="w-full h-10 px-3 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Correo electrónico</label>
                <input
                  type="email"
                  defaultValue={userEmail}
                  disabled
                  className="w-full h-10 px-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">El correo no puede modificarse</p>
              </div>

              <button className="w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors">
                Guardar cambios
              </button>
            </div>

            <div className="border-t border-gray-700 mt-6 pt-6">
              <h3 className="text-base font-medium text-white mb-4">Cambiar contraseña</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Contraseña actual</label>
                  <input
                    type="password"
                    className="w-full h-10 px-3 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nueva contraseña</label>
                  <input
                    type="password"
                    className="w-full h-10 px-3 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    className="w-full h-10 px-3 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-gray-700 text-white"
                  />
                </div>
                <button className="w-full border border-gray-600 py-2.5 rounded-lg hover:bg-gray-700 transition-colors text-white">
                  Cambiar contraseña
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
