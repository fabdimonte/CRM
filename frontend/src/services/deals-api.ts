import { apiClient } from './api-client'
import type { Deal, KanbanColumn, ApiResponse } from '@/types'

export const dealsApi = {
  getDeals: async (params?: Record<string, string>): Promise<ApiResponse<Deal>> => {
    const searchParams = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiClient.get<ApiResponse<Deal>>(`/deals/${searchParams}`)
  },

  getDeal: async (id: number): Promise<Deal> => {
    return apiClient.get<Deal>(`/deals/${id}/`)
  },

  createDeal: async (data: Partial<Deal>): Promise<Deal> => {
    return apiClient.post<Deal>('/deals/', data)
  },

  updateDeal: async (id: number, data: Partial<Deal>): Promise<Deal> => {
    return apiClient.patch<Deal>(`/deals/${id}/`, data)
  },

  deleteDeal: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/deals/${id}/`)
  },

  getKanbanData: async (): Promise<KanbanColumn[]> => {
    return apiClient.get<KanbanColumn[]>('/deals/kanban/')
  },

  moveStage: async (id: number, stageId: number, updateProbability = false): Promise<Deal> => {
    return apiClient.patch<Deal>(`/deals/${id}/move_stage/`, {
      stage_id: stageId,
      update_probability: updateProbability
    })
  },
}