/**
 * Centralized API configuration for EduAdapt
 *
 * In development, defaults to 'http://localhost:5000'
 * In production (e.g. Render, Vercel), uses import.meta.env.VITE_API_URL
 */
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Ensure no trailing slash
export const API_BASE_URL = rawUrl.replace(/\/+$/, '')

export default API_BASE_URL
