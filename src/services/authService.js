import { API_BASE_URL } from '../config/api'
const API_URL = `${API_BASE_URL}/api/auth`

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Login failed')
  }

  return data
}

export const getCurrentUser = async (token) => {
  const response = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Session verification failed')
  }

  return data
}