// src/services/auth-api.ts
import axios from "axios"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

export interface TokenPair {
  access: string
  refresh: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  async login(payload: LoginPayload): Promise<TokenPair> {
    const { data } = await axios.post<TokenPair>(
      `${API_BASE}/auth/login/`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: false,
      }
    )
    return data
  },

  async refresh(refresh: string): Promise<{ access: string }> {
    const { data } = await axios.post<{ access: string }>(
      `${API_BASE}/auth/refresh/`,
      { refresh },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: false,
      }
    )
    return data
  },
}
