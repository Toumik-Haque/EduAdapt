import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

import { getCurrentUser } from '../services/authService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token')
  })

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user')

    return storedUser ? JSON.parse(storedUser) : null
  })

  const [loading, setLoading] = useState(true)

  // Login
  const login = (loginData) => {
    const currentUser = {
      ...loginData.user,
      profile: loginData.profile
    }

    localStorage.setItem('token', loginData.token)

    localStorage.setItem(
      'user',
      JSON.stringify(currentUser)
    )

    setToken(loginData.token)
    setUser(currentUser)
  }

  // Update user in frontend state
  const updateUser = (fields) => {
    setUser(currentUser => {
      if (!currentUser) return currentUser
      const updatedUser = {
        ...currentUser,
        ...fields
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return updatedUser
    })
  }

  // Update profile in frontend state
  const updateProfile = (updatedProfile) => {
    setUser(currentUser => {
      if (!currentUser) {
        return currentUser
      }

      const updatedUser = {
        ...currentUser,
        profile: {
          ...currentUser.profile,
          ...updatedProfile
        }
      }

      localStorage.setItem(
        'user',
        JSON.stringify(updatedUser)
      )

      return updatedUser
    })
  }

  // Logout
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setToken(null)
    setUser(null)
  }

  // Restore session after page refresh
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('token')

      // No saved token
      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const data = await getCurrentUser(storedToken)

        const currentUser = {
          ...data.user,
          profile: data.profile
        }

        setToken(storedToken)
        setUser(currentUser)

        localStorage.setItem(
          'user',
          JSON.stringify(currentUser)
        )
      } catch (error) {
        console.error(
          'Session verification failed:',
          error
        )

        logout()
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [])

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        updateProfile,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}

