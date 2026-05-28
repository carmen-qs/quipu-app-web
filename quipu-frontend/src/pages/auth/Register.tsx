import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <Wallet className="w-7 h-7 text-emerald-600" />
            <span className="ml-2 text-[28px] font-medium text-stone-800">Quipu</span>
          </div>
          <p className="text-sm text-stone-500">Tus finanzas, en orden</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-stone-200">
          {error && (
            <div className="mb-4 p-3 bg-orange-50 text-orange-600 text-sm rounded-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] text-stone-500 mb-2">Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
                placeholder="María Quispe"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-[13px] text-stone-500 mb-2">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
                placeholder="maria@ejemplo.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-[13px] text-stone-500 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800"
                  disabled={loading}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] text-stone-500 mb-2">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800"
                  disabled={loading}
                >
                  {showConfirmPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[13px] text-stone-500">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-emerald-600 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
