import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) return <div className="text-center py-24 text-muted-foreground">Verificando sesión...</div>
  if (!session) return <Navigate to="/admin/login" replace />

  return <Outlet />
}
