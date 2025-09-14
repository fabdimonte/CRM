import { useAuthStore } from "@/stores/auth-store"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"
const AUTH_URL = import.meta.env.VITE_AUTH_URL || "http://localhost:8000/auth"

type Json = Record<string, unknown> | Array<unknown> | string | number | boolean | null

function normalizeHeaders(h?: HeadersInit): Record<string, string> {
  if (!h) return {}
  if (h instanceof Headers) return Object.fromEntries(h.entries())
  if (Array.isArray(h)) return Object.fromEntries(h as Array<[string, string]>)
  return h as Record<string, string>
}

function ensureJsonHeader(h: Record<string, string>) {
  const ct = h["Content-Type"] || h["content-type"]
  if (!ct) h["Content-Type"] = "application/json"
  return h
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "")
  }

  private async buildAuthHeaders(): Promise<Record<string, string>> {
    const { tokens, refreshToken } = useAuthStore.getState()

    if (!tokens?.access) {
      return { "Content-Type": "application/json" }
    }
    // Bearer présent
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.access}`,
    }
  }

  private mergeHeaders(
    base: Record<string, string>,
    extra?: HeadersInit
  ): Record<string, string> {
    return { ...base, ...normalizeHeaders(extra) }
  }

  private buildUrl(endpoint: string) {
    return `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = this.buildUrl(endpoint)

    // Construire headers sans duplication
    const authHeaders = await this.buildAuthHeaders()
    let headers = this.mergeHeaders(authHeaders, options.headers)

    // Si body objet et pas FormData/Blob, envoyer JSON
    const body = options.body as any
    const isFormLike =
      body instanceof FormData ||
      body instanceof Blob ||
      (body && typeof body === "object" && typeof body.arrayBuffer === "function")

    let finalBody = options.body
    if (body && typeof body === "object" && !isFormLike) {
      headers = ensureJsonHeader(headers)
      finalBody = JSON.stringify(body)
    }

    const config: RequestInit = {
      ...options,
      headers, // une seule fois
      body: finalBody,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const ct = response.headers.get("content-type") || ""
        if (ct.includes("application/json")) {
          const data = await response.json()
          errorMessage =
            (data as any).detail || (data as any).message || JSON.stringify(data)
        } else {
          errorMessage = response.statusText || errorMessage
        }
      } catch {
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    const ct = response.headers.get("content-type") || ""
    if (!ct.includes("application/json")) return {} as T
    try {
      return (await response.json()) as T
    } catch {
      return {} as T
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: Json): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body: data as any })
  }

  async put<T>(endpoint: string, data?: Json): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body: data as any })
  }

  async patch<T>(endpoint: string, data?: Json): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body: data as any })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const { tokens } = useAuthStore.getState()
    const headers: Record<string, string> = {}

    if (tokens?.access) headers.Authorization = `Bearer ${tokens.access}`

    const response = await fetch(this.buildUrl(endpoint), {
      method: "POST",
      headers, // pas de Content-Type pour FormData
      body: formData,
    })

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const ct = response.headers.get("content-type") || ""
        if (ct.includes("application/json")) {
          const data = await response.json()
          errorMessage =
            (data as any).detail || (data as any).message || JSON.stringify(data)
        } else {
          errorMessage = response.statusText || errorMessage
        }
      } catch {
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    const ct = response.headers.get("content-type") || ""
    if (!ct.includes("application/json")) return {} as T
    return (await response.json()) as T
  }
}

// Instances
export const apiClient = new ApiClient(API_URL)     // ex: /api/v1/companies/
export const authApiClient = new ApiClient(AUTH_URL) // /auth/login/, /auth/refresh/
