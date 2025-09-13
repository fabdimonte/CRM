import { useAuthStore } from '@/stores/auth-store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000/auth'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const { tokens, refreshToken } = useAuthStore.getState()
    
    if (!tokens?.access) {
      return {
        'Content-Type': 'application/json',
      }
    }

    try {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.access}`,
      }
    } catch (error) {
      // Try to refresh token
      try {
        await refreshToken()
        const { tokens: newTokens } = useAuthStore.getState()
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newTokens?.access}`,
        }
      } catch (refreshError) {
        // Refresh failed, user will be logged out
        return {
          'Content-Type': 'application/json',
        }
      }
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = await this.getAuthHeaders()

    const config: RequestInit = {
      headers,
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData)
      } catch {
        // If we can't parse JSON, use status text
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return {} as T
    }

    try {
      return await response.json()
    } catch {
      return {} as T
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const { tokens, refreshToken } = useAuthStore.getState()
    
    let headers: HeadersInit = {}
    
    if (tokens?.access) {
      headers.Authorization = `Bearer ${tokens.access}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData)
      } catch {
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    return response.json()
  }
}

// Create singleton instances
export const apiClient = new ApiClient(API_URL)
export const authApiClient = new ApiClient(AUTH_URL)