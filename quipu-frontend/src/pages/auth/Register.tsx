import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wallet, Eye, EyeOff, BarChart3, Shield, Zap } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    // Password validation
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (!/[A-Z]/.test(password)) {
      setError('La contraseña debe tener al menos una mayúscula')
      return
    }
    if (!/[a-z]/.test(password)) {
      setError('La contraseña debe tener al menos una minúscula')
      return
    }
    if (!/[0-9]/.test(password)) {
      setError('La contraseña debe tener al menos un número')
      return
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError('La contraseña debe tener al menos un carácter especial')
      return
    }

    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones')
      return
    }

    setLoading(true)

    try {
      console.log('Enviando registro a:', '/api/auth/register')
      console.log('Datos:', { name, email, password: '***' })
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      })

      console.log('Response status:', response.status)
      
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrarse')
      }

      // Registration successful, redirect to login
      navigate('/login')
    } catch (err) {
      console.error('Error en registro:', err)
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-40 py-12 bg-[#020817]">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Wallet className="w-8 h-8 text-emerald-500" />
          <span className="ml-2 text-3xl font-semibold text-white">Quipu</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">Crea tu cuenta</h1>
          <p className="text-gray-400">Regístrate para comenzar a gestionar tus finanzas</p>
        </div>  

        {/* Google Button */}
        <button className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl border border-white/20 transition-all mb-6">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-medium">Continuar con Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="text-sm text-gray-400">O CONTINÚA CON EMAIL</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* Form */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 text-white placeholder-gray-500 transition-all"
              placeholder="María Quispe"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 text-white placeholder-gray-500 transition-all"
              placeholder="maria@ejemplo.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 pr-12 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 text-white placeholder-gray-500 transition-all"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 px-4 pr-12 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 text-white placeholder-gray-500 transition-all"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 mt-1 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
              disabled={loading}
            />
            <span className="text-sm text-gray-400">
              Acepto los <Link to="/terms" className="text-emerald-400 hover:text-emerald-300">términos y condiciones</Link> y la <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300">política de privacidad</Link>
            </span>
          </label>

          <button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column - Info Cards */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-lg mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4">Únete a miles de usuarios</h2>
          <p className="text-gray-400 text-lg mb-12">Comienza tu viaje hacia el control financiero con herramientas poderosas y fáciles de usar.</p>

          <div className="space-y-6">
            {/* Card 1 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Seguridad bancaria</h3>
                  <p className="text-gray-400 text-sm">Tus datos están protegidos con encriptación de nivel militar y autenticación JWT.</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Configuración rápida</h3>
                  <p className="text-gray-400 text-sm">Regístrate en menos de 2 minutos y comienza a usar la app de inmediato.</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Insights inteligentes</h3>
                  <p className="text-gray-400 text-sm">Obtén recomendaciones personalizadas basadas en tus hábitos de gasto.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
