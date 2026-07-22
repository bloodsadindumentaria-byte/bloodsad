import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { SITE_NAME } from '@/lib/constants'

export function Login() {
  const { signIn, session, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Si ya hay sesión activa, redirigir al admin
  if (!loading && session) return <Navigate to="/admin" replace />

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signIn(email, password)
    if (error) {
      setError('Credenciales incorrectas')
    } else {
      navigate('/admin')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt={SITE_NAME} className="h-20 w-auto mx-auto" />
          <p className="text-[#888888] text-sm mt-2">Panel de administración</p>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[#888888] text-xs uppercase tracking-wider">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="
                  w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-sm
                  px-3 py-2.5 text-[#e0e0e0] text-sm
                  placeholder:text-[#444444]
                  focus:outline-none focus:border-[#6B5CE7]
                  transition-colors duration-200
                "
                placeholder="admin@romanwrestdistro.com"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[#888888] text-xs uppercase tracking-wider">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="
                  w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-sm
                  px-3 py-2.5 text-[#e0e0e0] text-sm
                  placeholder:text-[#444444]
                  focus:outline-none focus:border-[#6B5CE7]
                  transition-colors duration-200
                "
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-[#c0392b] text-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="
                w-full bg-[#6B5CE7] hover:bg-[#4a3eb5]
                disabled:opacity-50 disabled:cursor-not-allowed
                text-white text-sm font-medium
                py-2.5 rounded-sm
                transition-colors duration-200
              "
            >
              {submitting ? 'Entrando...' : 'Iniciar sesión'}
            </button>

          </form>
        </div>

      </div>
    </div>
  )
}
