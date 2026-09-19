import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

import { useAuth } from './AuthContext'

const SpaceContext = createContext(null)

export function SpaceProvider({ children }) {
  const { token, user } = useAuth()

  const [institutions, setInstitutions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchInstitutions = async () => {
    if (!token || !user?.accountType) {
      setInstitutions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      let endpoint = ''

      if (user.accountType === 'learner') {
        endpoint =
          'http://localhost:5000/api/membership/my-institutions'
      }

      if (user.accountType === 'teacher') {
        endpoint =
          'http://localhost:5000/api/membership/teacher/batches'
      }

      if (!endpoint) {
        setInstitutions([])
        setLoading(false)
        return
      }

      const response = await fetch(
        endpoint,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to load institutions'
        )
      }

      if (user.accountType === 'learner') {
        setInstitutions(
          data.institutions || []
        )
      }

      if (user.accountType === 'teacher') {
        const approvedBatches =
          (data.batches || []).filter(
            batch =>
              batch.status === 'approved'
          )

        const institutionMap = {}

        approvedBatches.forEach(batch => {
          const institutionId =
            batch.institutionId

          if (!institutionId) {
            return
          }

          if (!institutionMap[institutionId]) {
            institutionMap[institutionId] = {
              id: institutionId,
              instituteName:
                batch.instituteName || '',
              instituteType:
                batch.instituteType || ''
            }
          }
        })

        setInstitutions(
          Object.values(institutionMap)
        )
      }
    } catch (error) {
      console.error(
        'Failed to load spaces:',
        error
      )

      setError(error.message)
      setInstitutions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstitutions()
  }, [token, user])

  return (
    <SpaceContext.Provider
      value={{
        institutions,
        loading,
        error,
        refreshInstitutions:
          fetchInstitutions
      }}
    >
      {children}
    </SpaceContext.Provider>
  )
}

export function useSpaces() {
  return useContext(SpaceContext)
}

