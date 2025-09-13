import { apiClient } from './api-client'
import type { Document, NDA, ApiResponse } from '@/types'

export const documentsApi = {
  getDocuments: async (params?: Record<string, string>): Promise<ApiResponse<Document>> => {
    const searchParams = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiClient.get<ApiResponse<Document>>(`/documents/${searchParams}`)
  },

  getDocument: async (id: number): Promise<Document> => {
    return apiClient.get<Document>(`/documents/${id}/`)
  },

  uploadDocument: async (file: File, dealId?: number): Promise<Document> => {
    const formData = new FormData()
    formData.append('file', file)
    if (dealId) {
      formData.append('deal', dealId.toString())
    }
    return apiClient.upload<Document>('/documents/upload/', formData)
  },

  deleteDocument: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/documents/${id}/`)
  },
}

export const ndasApi = {
  getNDAs: async (params?: Record<string, string>): Promise<ApiResponse<NDA>> => {
    const searchParams = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiClient.get<ApiResponse<NDA>>(`/ndas/${searchParams}`)
  },

  getNDA: async (id: number): Promise<NDA> => {
    return apiClient.get<NDA>(`/ndas/${id}/`)
  },

  createNDA: async (data: Partial<NDA>): Promise<NDA> => {
    return apiClient.post<NDA>('/ndas/', data)
  },

  updateNDA: async (id: number, data: Partial<NDA>): Promise<NDA> => {
    return apiClient.patch<NDA>(`/ndas/${id}/`, data)
  },

  deleteNDA: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/ndas/${id}/`)
  },
}