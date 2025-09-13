import { authApiClient } from './api-client'
import type { LoginCredentials, AuthTokens, User } from '@/types'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    return authApiClient.post<AuthTokens>('/login/', credentials)
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    return authApiClient.post<AuthTokens>('/refresh/', { refresh: refreshToken })
  },

  getCurrentUser: async (accessToken: string): Promise<User> => {
    // Create a temporary client with the access token for this request
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/users/me/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get current user')
    }

    return response.json()
  },
}
</btml:function_calls>

I'll create a complete M&A CRM application following all your specifications. This will include the complete backend, frontend, Docker setup, and all required functionality.