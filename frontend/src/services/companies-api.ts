import { apiClient } from './api-client'
import type { Company, Contact, ApiResponse } from '@/types'

export const companiesApi = {
  getCompanies: async (params?: Record<string, string>): Promise<ApiResponse<Company>> => {
    const searchParams = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiClient.get<ApiResponse<Company>>(`/companies/${searchParams}`)
  },

  getCompany: async (id: number): Promise<Company> => {
    return apiClient.get<Company>(`/companies/${id}/`)
  },

  createCompany: async (data: Partial<Company>): Promise<Company> => {
    return apiClient.post<Company>('/companies/', data)
  },

  updateCompany: async (id: number, data: Partial<Company>): Promise<Company> => {
    return apiClient.patch<Company>(`/companies/${id}/`, data)
  },

  deleteCompany: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/companies/${id}/`)
  },
}

export const contactsApi = {
  getContacts: async (params?: Record<string, string>): Promise<ApiResponse<Contact>> => {
    const searchParams = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiClient.get<ApiResponse<Contact>>(`/contacts/${searchParams}`)
  },

  getContact: async (id: number): Promise<Contact> => {
    return apiClient.get<Contact>(`/contacts/${id}/`)
  },

  createContact: async (data: Partial<Contact>): Promise<Contact> => {
    return apiClient.post<Contact>('/contacts/', data)
  },

  updateContact: async (id: number, data: Partial<Contact>): Promise<Contact> => {
    return apiClient.patch<Contact>(`/contacts/${id}/`, data)
  },

  deleteContact: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/contacts/${id}/`)
  },
}