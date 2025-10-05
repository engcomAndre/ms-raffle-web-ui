/**
 * Utilitários para tratamento de mensagens de erro do backend
 */

export interface BackendErrorResponse {
  status?: number
  detail?: string
  userMessage?: string
  message?: string
  title?: string
  type?: string
}

/**
 * Mapeia erros do backend para mensagens amigáveis ao usuário
 */
export function getErrorMessage(error: unknown): string {
  const errorResponse = error as { response?: { data?: BackendErrorResponse } }
  const errorData = errorResponse?.response?.data
  
  if (!errorData) {
    return 'Erro desconhecido'
  }
  
  const { status, detail, userMessage, message, title } = errorData
  
  // Prioridade 1: userMessage (mensagem específica para o usuário)
  if (userMessage) {
    return userMessage
  }
  
  // Prioridade 2: message (mensagem geral)
  if (message) {
    return message
  }
  
  // Prioridade 3: Tratamento por status HTTP
  if (status) {
    return getMessageByStatus(status, detail)
  }
  
  // Prioridade 4: detail (detalhes técnicos)
  if (detail) {
    return detail
  }
  
  // Prioridade 5: title (título do erro)
  if (title) {
    return title
  }
  
  // Fallback
  return 'Erro inesperado'
}

/**
 * Retorna mensagem baseada no status HTTP e detalhes
 */
function getMessageByStatus(status: number, detail?: string): string {
  switch (status) {
    case 400:
      if (detail?.includes('Required header')) {
        return 'Erro de autenticação. Faça login novamente'
      } else if (detail?.includes('Invalid')) {
        return 'Dados inválidos para esta operação'
      } else if (detail?.includes('Bad Request')) {
        return 'Dados inválidos'
      } else {
        return 'Dados inválidos'
      }
      
    case 401:
      return 'Não autorizado. Faça login novamente'
      
    case 403:
      return 'Acesso negado'
      
    case 404:
      if (detail?.includes('Active raffle')) {
        return 'Esta rifa não está ativa ou foi removida'
      } else if (detail?.includes('not found')) {
        return 'Recurso não encontrado'
      } else if (detail?.includes('Raffle')) {
        return 'Rifa não encontrada'
      } else {
        return 'Recurso não encontrado'
      }
      
    case 409:
      if (detail?.includes('Already reserved')) {
        return 'Este número já foi reservado por outro usuário'
      } else if (detail?.includes('Already sold')) {
        return 'Este número já foi vendido'
      } else if (detail?.includes('Conflict')) {
        return 'Conflito: Este recurso não está disponível'
      } else {
        return 'Conflito: Este número não está disponível'
      }
      
    case 410:
      return 'Este número já foi vendido'
      
    case 422:
      return 'Dados inválidos para processamento'
      
    case 500:
      return 'Erro interno do servidor. Tente novamente'
      
    case 502:
      return 'Serviço temporariamente indisponível'
      
    case 503:
      return 'Serviço temporariamente indisponível'
      
    default:
      return `Erro ${status}: ${detail || 'Erro desconhecido'}`
  }
}

/**
 * Verifica se o erro é de autenticação
 */
export function isAuthenticationError(error: unknown): boolean {
  const errorResponse = error as { response?: { data?: BackendErrorResponse } }
  const status = errorResponse?.response?.data?.status
  return status === 401 || status === 403
}

/**
 * Verifica se o erro é de validação
 */
export function isValidationError(error: unknown): boolean {
  const errorResponse = error as { response?: { data?: BackendErrorResponse } }
  const status = errorResponse?.response?.data?.status
  return status === 400 || status === 422
}

/**
 * Verifica se o erro é de conflito
 */
export function isConflictError(error: unknown): boolean {
  const errorResponse = error as { response?: { data?: BackendErrorResponse } }
  const status = errorResponse?.response?.data?.status
  return status === 409 || status === 410
}







