import axios from 'axios'
import { env } from '@/config/env'

/**
 * Shared axios instance. Attaches the JWT (when present) and unwraps the
 * backend's { success, data } envelope. Features build their own api/ modules
 * on top of this; swap NEXT_PUBLIC_USE_MOCKS=false to hit the real backend.
 */
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => (res.data && 'data' in res.data ? res.data.data : res.data),
  (err) => Promise.reject(err),
)
