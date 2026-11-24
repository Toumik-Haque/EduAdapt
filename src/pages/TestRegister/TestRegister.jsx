import { API_BASE_URL } from '../../config/api'
import { useState } from 'react'

function TestRegister() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testRegistration = async () => {
    setLoading(true)
    setResult('Registering...')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'Test Learner',
            email: `learner${Date.now()}@eduadapt.com`,
            password: 'test123456',
            accountType: 'learner'
          })
        }
      )

      const data = await response.json()

      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <h1>Registration API Test</h1>

      <button
        className="btn btn-primary mt-3"
        onClick={testRegistration}
        disabled={loading}
      >
        {loading ? 'Registering...' : 'Test Registration'}
      </button>

      {result && (
        <pre className="bg-light border rounded p-3 mt-4">
          {result}
        </pre>
      )}
    </div>
  )
}

export default TestRegister