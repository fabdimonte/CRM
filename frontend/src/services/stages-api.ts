import { apiClient } from './api-client'
import type { Stage, ApiResponse } from '@/types'

export const stagesApi = {
  getStages: async (): Promise<ApiResponse<Stage>> => {
    return apiClient.get<ApiResponse<Stage>>('/stages/')
  },

  getStage: async (id: number): Promise<Stage> => {
    return apiClient.get<Stage>(`/stages/${id}/`)
  },

  createStage: async (data: Partial<Stage>): Promise<Stage> => {
    return apiClient.post<Stage>('/stages/', data)
  },

  updateStage: async (id: number, data: Partial<Stage>): Promise<Stage> => {
    return apiClient.patch<Stage>(`/stages/${id}/`, data)
  },

  deleteStage: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/stages/${id}/`)
  },
}