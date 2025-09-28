# Sistema de Tratamento de Mensagens de Erro

Este documento descreve como usar o sistema de tratamento de mensagens de erro implementado no projeto.

## Componentes Principais

### 1. `errorMessages.ts` - Utilitários de Mensagens

```typescript
import { getErrorMessage, isAuthenticationError, isValidationError, isConflictError } from '@/utils/errorMessages'

// Obter mensagem amigável do erro
const errorMessage = getErrorMessage(error)

// Verificar tipo de erro
if (isAuthenticationError(error)) {
  // Redirecionar para login
}

if (isValidationError(error)) {
  // Mostrar erros de validação
}

if (isConflictError(error)) {
  // Mostrar conflito (já reservado/vendido)
}
```

### 2. `useErrorHandler.ts` - Hook para Tratamento de Erros

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler'

function MyComponent() {
  const { errorMessage, isLoading, executeWithErrorHandling, clearError } = useErrorHandler({
    onAuthError: () => {
      // Redirecionar para login
      router.push('/login')
    },
    onValidationError: (message) => {
      // Mostrar erros de validação específicos
      console.log('Erro de validação:', message)
    },
    onConflictError: (message) => {
      // Mostrar conflito
      console.log('Conflito:', message)
    }
  })

  const handleReserve = async () => {
    await executeWithErrorHandling(
      () => raffleService.reserveRaffleNumber(raffleId, number),
      (result) => {
        // Sucesso
        console.log('Reserva realizada:', result)
      }
    )
  }

  return (
    <div>
      {errorMessage && <div className="error">{errorMessage}</div>}
      <button onClick={handleReserve} disabled={isLoading}>
        {isLoading ? 'Reservando...' : 'Reservar'}
      </button>
    </div>
  )
}
```

### 3. `Toast.tsx` - Componente de Notificação

```typescript
import { Toast } from '@/components/Toast'

function MyComponent() {
  const [toast, setToast] = useState(null)

  const showSuccess = () => {
    setToast({
      message: 'Operação realizada com sucesso!',
      type: 'success'
    })
  }

  const showError = () => {
    setToast({
      message: 'Erro ao realizar operação',
      type: 'error'
    })
  }

  return (
    <div>
      {/* Seu conteúdo */}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
```

## Mapeamento de Erros do Backend

### Status HTTP e Mensagens

| Status | Condição | Mensagem Amigável |
|--------|----------|-------------------|
| 400 | Required header | "Erro de autenticação. Faça login novamente" |
| 400 | Invalid data | "Dados inválidos para esta operação" |
| 401 | Unauthorized | "Não autorizado. Faça login novamente" |
| 403 | Forbidden | "Acesso negado" |
| 404 | Active raffle not found | "Esta rifa não está ativa ou foi removida" |
| 404 | Number not found | "Número não encontrado nesta rifa" |
| 409 | Already reserved | "Este número já foi reservado por outro usuário" |
| 409 | Already sold | "Este número já foi vendido" |
| 410 | Gone | "Este número já foi vendido" |
| 500 | Internal Server Error | "Erro interno do servidor. Tente novamente" |

### Prioridade de Mensagens

1. **userMessage** - Mensagem específica para o usuário (maior prioridade)
2. **message** - Mensagem geral do backend
3. **Status HTTP** - Mapeamento baseado no status e detalhes
4. **detail** - Detalhes técnicos do erro
5. **title** - Título do erro
6. **Fallback** - "Erro inesperado"

## Exemplo Completo

```typescript
'use client'

import { useState } from 'react'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { Toast } from '@/components/Toast'
import { raffleService } from '@/services/raffleService'

export function ReserveNumberButton({ raffleId, number }) {
  const [toast, setToast] = useState(null)
  
  const { executeWithErrorHandling, isLoading } = useErrorHandler({
    onAuthError: () => {
      setToast({
        message: 'Sessão expirada. Faça login novamente.',
        type: 'warning'
      })
    },
    onConflictError: (message) => {
      setToast({
        message,
        type: 'error'
      })
    }
  })

  const handleReserve = async () => {
    await executeWithErrorHandling(
      () => raffleService.reserveRaffleNumber(raffleId, number),
      () => {
        setToast({
          message: `Número ${number} reservado com sucesso!`,
          type: 'success'
        })
      }
    )
  }

  return (
    <>
      <button 
        onClick={handleReserve} 
        disabled={isLoading}
        className="btn btn-primary"
      >
        {isLoading ? 'Reservando...' : 'Reservar'}
      </button>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
```

## Benefícios

1. **Consistência**: Mensagens padronizadas em toda a aplicação
2. **Reutilização**: Hooks e componentes reutilizáveis
3. **Manutenibilidade**: Centralização da lógica de tratamento de erros
4. **UX**: Mensagens amigáveis e específicas para cada situação
5. **Debugging**: Logs detalhados para desenvolvimento
6. **Flexibilidade**: Callbacks personalizáveis para diferentes tipos de erro



