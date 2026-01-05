import { create } from 'zustand'
import api from '../lib/api'

interface User {
  id?: string
  email: string
  name?: string
  phone?: string
  role: string
  department_id?: number
  position?: string
  last_login_at?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      })
      
      if (response.data.success) {
        set({
          user: response.data.data || response.data.user,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        throw new Error(response.data.message || '로그인 실패')
      }
    } catch (error: any) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout')
    } catch (error) {
      console.error('로그아웃 오류:', error)
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  checkAuth: async () => {
    try {
      const response = await api.get('/api/auth/me')
      if (response.data.success) {
        set({
          user: response.data.data || response.data.user,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
}))
