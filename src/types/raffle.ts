// Tipos e interfaces para rifas
export interface RaffleCreationData {
  title: string
  prize: string
  maxNumbers: number
  files: string[]
  startAt: string // ISO 8601 format
  endAt: string   // ISO 8601 format
}

export interface RaffleResponse {
  id: string
  title: string
  prize: string
  description?: string
  maxNumbers: number
  files: string[]
  startAt: string
  endAt: string
  createdAt: string
  updatedAt: string
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED'
  active: boolean
  soldNumbers: number
  createdBy: string
  numbersCreated: number
}

export interface CreateRaffleResponse {
  success: boolean
  data?: RaffleResponse
  error?: string
  message?: string
}

export interface RafflePageResponse {
  content: RaffleResponse[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
  first: boolean
  last: boolean
  numberOfElements: number
}

// Validações para criação de rifa
export const validateRaffleData = (data: RaffleCreationData): string[] => {
  const errors: string[] = []

  if (!data.title || data.title.trim().length < 3) {
    errors.push('Título deve ter pelo menos 3 caracteres')
  }

  if (!data.prize || data.prize.trim().length < 5) {
    errors.push('Descrição do prêmio deve ter pelo menos 5 caracteres')
  }

  if (!data.maxNumbers || data.maxNumbers < 10 || data.maxNumbers > 10000) {
    errors.push('Número máximo deve estar entre 10 e 10.000')
  }

  const startDate = new Date(data.startAt)
  const endDate = new Date(data.endAt)
  const now = new Date()

  if (startDate < now) {
    errors.push('Data de início deve ser no futuro')
  }

  if (endDate <= startDate) {
    errors.push('Data de fim deve ser após a data de início')
  }

  const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays < 1) {
    errors.push('Rifa deve durar pelo menos 1 dia')
  }

  return errors
}

// Tipos para números da rifa
export enum RaffleNumberStatus {
  ACTIVE = 'ACTIVE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD'
}

export interface RaffleNumberItemResponse {
  id: string
  raffleId: string
  number: string
  status: RaffleNumberStatus
  winner: boolean
  reservedAt: string | null
  reservedBy: string | null
  soldAt: string | null
  soldBy: string | null
  owner: string | null
  buyerName?: string
  buyerPhone?: string
}

export interface RaffleNumbersResponse {
  rafflesNumbers: RaffleNumberItemResponse[]
  pageNumber: number | null
  pageSize: number | null
  totalElements: number | null
  totalPages: number | null
  hasNext: boolean
  hasPrevious: boolean
  first: boolean
  last: boolean
}

export interface RaffleNumbersPageResponse {
  success: boolean
  data?: RaffleNumbersResponse
  error?: string
  message?: string
}
