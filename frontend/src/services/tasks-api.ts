import { apiClient } from './api-client'
import type { Task, ApiResponse } from '@/types'

export const tasksApi = {
  getTasks: async (params?: Record<string, string>): Promise<ApiResponse<Task>> => {
    const searchParams = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiClient.get<ApiResponse<Task>>(`/tasks/${searchParams}`)
  },

  getTask: async (id: number): Promise<Task> => {
    return apiClient.get<Task>(`/tasks/${id}/`)
  },

  createTask: async (data: Partial<Task>): Promise<Task> => {
    return apiClient.post<Task>('/tasks/', data)
  },

  updateTask: async (id: number, data: Partial<Task>): Promise<Task> => {
    return apiClient.patch<Task>(`/tasks/${id}/`, data)
  },

  deleteTask: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/tasks/${id}/`)
  },

  getMyTasks: async (): Promise<ApiResponse<Task>> => {
    return apiClient.get<ApiResponse<Task>>('/tasks/my_tasks/')
  },
}