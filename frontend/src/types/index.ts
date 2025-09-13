export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  full_name: string
  role: 'admin' | 'associate' | 'analyst'
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Company {
  id: number
  name: string
  legal_id: string
  country: string
  website?: string
  sector: string
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  notes?: string
  contacts_count: number
  deals_count: number
  contacts?: ContactSummary[]
  created_at: string
  updated_at: string
}

export interface CompanySummary {
  id: number
  name: string
  sector: string
  country: string
}

export interface Contact {
  id: number
  company: number
  company_name: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone?: string
  role?: string
  seniority: 'junior' | 'mid' | 'senior' | 'director' | 'vp' | 'c_level'
  linkedin_url?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ContactSummary {
  id: number
  full_name: string
  email: string
  role?: string
}

export interface Stage {
  id: number
  name: string
  order: number
  is_closed: boolean
  is_won: boolean
  default_probability: number
  deals_count: number
  created_at: string
}

export interface Deal {
  id: number
  title: string
  company: number | CompanySummary
  company_name?: string
  owner: number | User
  owner_name?: string
  stage: number | Stage
  stage_name?: string
  amount_estimate?: number
  probability: number
  expected_value?: number
  next_action_at?: string
  is_overdue: boolean
  description?: string
  interactions_count?: number
  documents_count?: number
  tasks_count?: number
  created_at: string
  updated_at: string
}

export interface KanbanDeal {
  id: number
  title: string
  company_name: string
  owner_name: string
  amount_estimate?: number
  probability: number
  next_action_at?: string
  is_overdue: boolean
}

export interface KanbanColumn {
  stage: Stage
  deals: KanbanDeal[]
  count: number
}

export interface Task {
  id: number
  deal?: number
  deal_title?: string
  title: string
  description?: string
  due_at?: string
  status: 'todo' | 'doing' | 'done'
  assignee: number
  assignee_name: string
  created_by: number
  created_by_name: string
  is_overdue: boolean
  created_at: string
  updated_at: string
}

export interface Interaction {
  id: number
  deal?: number
  deal_title?: string
  company?: number
  company_name?: string
  contact?: number
  contact_name?: string
  type: 'email' | 'call' | 'meeting' | 'note'
  subject: string
  body: string
  occurred_at: string
  author: number
  author_name: string
  related_entity: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: number
  deal?: number
  deal_title?: string
  filename: string
  file: string
  file_url?: string
  size: number
  size_human: string
  content_type: string
  file_extension: string
  uploaded_by: number
  uploaded_by_name: string
  uploaded_at: string
}

export interface NDA {
  id: number
  deal: number
  deal_title: string
  counterparty: 'buyer' | 'seller' | 'target'
  status: 'draft' | 'sent' | 'signed'
  signed_at?: string
  file?: number
  file_details?: Document
  notes?: string
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  count: number
  next?: string
  previous?: string
  results: T[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  access: string
  refresh: string
}