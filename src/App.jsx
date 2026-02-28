import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PageLoader } from './components/ui/LoadingSpinner'
import Layout from './components/layout/Layout'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import Subscriptions from './pages/Subscriptions'
import Settings from './pages/Settings'
import Reconcile from './pages/Reconcile'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/"              element={<Dashboard />} />
                <Route path="/accounts"      element={<Accounts />} />
                <Route path="/transactions"  element={<Transactions />} />
                <Route path="/budget"        element={<Budget />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/settings"     element={<Settings />} />
                <Route path="/reconcile"    element={<Reconcile />} />
                <Route path="*"             element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
