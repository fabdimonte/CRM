import { apiClient } from './api-client'
import type { Interaction, ApiResponse } from '@/types'

export const interactionsApi = {
  getInteractions: async (params?: Record<string, string>): Promise<ApiResponse<Interaction>> => {
    const searchParams = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiClient.get<ApiResponse<Interaction>>(`/interactions/${searchParams}`)
  },

  getInteraction: async (id: number): Promise<Interaction> => {
    return apiClient.get<Interaction>(`/interactions/${id}/`)
  },

  createInteraction: async (data: Partial<Interaction>): Promise<Interaction> => {
    return apiClient.post<Interaction>('/interactions/', data)
  },

  updateInteraction: async (id: number, data: Partial<Interaction>): Promise<Interaction> => {
    return apiClient.patch<Interaction>(`/interactions/${id}/`, data)
  },

  deleteInteraction: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/interactions/${id}/`)
  },
}