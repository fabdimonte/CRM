import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginCredentials, AuthTokens } from '@/types'
import { authApi } from '@/services/auth-api'

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  refreshToken: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true })
        try {
          const tokens = await authApi.login(credentials)
          const user = await authApi.getCurrentUser(tokens.access)
          set({ user, tokens, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({ user: null, tokens: null })
      },

      setUser: (user: User) => {
        set({ user })
      },

      refreshToken: async () => {
        const { tokens } = get()
        if (!tokens?.refresh) {
          throw new Error('No refresh token available')
        }
        
        try {
          const newTokens = await authApi.refreshToken(tokens.refresh)
          set({ tokens: newTokens })
        } catch (error) {
          // If refresh fails, logout user
          set({ user: null, tokens: null })
          throw error
        }
      },
    }),
    {
      name: 'ma-crm-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
      }),
    }
  )
)