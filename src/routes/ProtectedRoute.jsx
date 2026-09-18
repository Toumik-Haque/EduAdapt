import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, allowedAccountType }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (
    allowedAccountType &&
    user?.accountType !== allowedAccountType
  ) {
    if (user?.accountType === 'learner') {
      return <Navigate to="/learner" replace />
    }

    if (user?.accountType === 'teacher') {
      return <Navigate to="/teacher" replace />
    }

    if (user?.accountType === 'institute') {
      return <Navigate to="/institute" replace />
    }

    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute