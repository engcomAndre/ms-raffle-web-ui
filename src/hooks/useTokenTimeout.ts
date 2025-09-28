'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseTokenTimeoutReturn {
  isTokenExpired: boolean
  showTokenExpiredModal: boolean
  timeUntilExpiry: number
  handleTokenExpired: () => void
  handleCloseModal: () => void
  startTokenMonitoring: () => void
  stopTokenMonitoring: () => void
}

export function useTokenTimeout(): UseTokenTimeoutReturn {
  const [isTokenExpired, setIsTokenExpired] = useState(false)
  const [showTokenExpiredModal, setShowTokenExpiredModal] = useState(false)
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const getTokenExpiryTime = useCallback((): number | null => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) return null

      // Decodificar JWT para extrair exp
      const payload = token.split('.')[1]
      const decodedPayload = JSON.parse(atob(payload))
      
      // exp está em segundos, converter para milissegundos
      return decodedPayload.exp ? decodedPayload.exp * 1000 : null
    } catch (error) {
      console.error('❌ [TOKEN-TIMEOUT] Erro ao decodificar token:', error)
      return null
    }
  }, [])

  const calculateTimeUntilExpiry = useCallback((): number => {
    const expiryTime = getTokenExpiryTime()
    if (!expiryTime) return 0

    const now = Date.now()
    const timeLeft = Math.max(0, expiryTime - now)
    
    return Math.floor(timeLeft / 1000) // Retornar em segundos
  }, [getTokenExpiryTime])

  const handleTokenExpired = useCallback(() => {
    console.log('⏰ [TOKEN-TIMEOUT] Token expirado!')
    setIsTokenExpired(true)
    setShowTokenExpiredModal(true)
    setTimeUntilExpiry(0)
    
    // Limpar dados de autenticação
    localStorage.removeItem('auth-token')
    localStorage.removeItem('auth-username')
    localStorage.removeItem('auth-email')
    localStorage.removeItem('auth-provider')
    localStorage.removeItem('google-user-picture')
    localStorage.removeItem('auth-user-id')
    localStorage.removeItem('auth-user-username')
    localStorage.removeItem('auth-user-email')
    localStorage.removeItem('auth-user-roles')
    
    // Parar monitoramento
    stopTokenMonitoring()
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowTokenExpiredModal(false)
    setIsTokenExpired(false)
  }, [])

  const startTokenMonitoring = useCallback(() => {
    console.log('🔄 [TOKEN-TIMEOUT] Iniciando monitoramento de token...')
    
    // Limpar intervalos existentes
    stopTokenMonitoring()
    
    const checkToken = () => {
      const timeLeft = calculateTimeUntilExpiry()
      setTimeUntilExpiry(timeLeft)
      
      console.log(`⏱️ [TOKEN-TIMEOUT] Tempo restante: ${timeLeft} segundos`)
      
      if (timeLeft <= 0) {
        handleTokenExpired()
        return
      }
      
      // Se restam menos de 5 minutos, mostrar aviso
      if (timeLeft <= 300 && timeLeft > 0) {
        console.log(`⚠️ [TOKEN-TIMEOUT] Token expira em ${timeLeft} segundos`)
      }
    }
    
    // Verificar imediatamente
    checkToken()
    
    // Verificar a cada 30 segundos
    intervalRef.current = setInterval(checkToken, 30000)
    
    // Configurar timeout para expiração exata
    const expiryTime = getTokenExpiryTime()
    if (expiryTime) {
      const timeUntilExpiry = Math.max(0, expiryTime - Date.now())
      if (timeUntilExpiry > 0) {
        timeoutRef.current = setTimeout(() => {
          handleTokenExpired()
        }, timeUntilExpiry)
      }
    }
  }, [calculateTimeUntilExpiry, getTokenExpiryTime, handleTokenExpired])

  const stopTokenMonitoring = useCallback(() => {
    console.log('🛑 [TOKEN-TIMEOUT] Parando monitoramento de token...')
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Iniciar monitoramento quando o hook é montado
  useEffect(() => {
    const token = localStorage.getItem('auth-token')
    if (token) {
      startTokenMonitoring()
    }
    
    // Cleanup ao desmontar
    return () => {
      stopTokenMonitoring()
    }
  }, [startTokenMonitoring, stopTokenMonitoring])

  // Reiniciar monitoramento quando o token mudar
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-token') {
        if (e.newValue) {
          console.log('🔄 [TOKEN-TIMEOUT] Token atualizado, reiniciando monitoramento...')
          startTokenMonitoring()
        } else {
          console.log('🔄 [TOKEN-TIMEOUT] Token removido, parando monitoramento...')
          stopTokenMonitoring()
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [startTokenMonitoring, stopTokenMonitoring])

  return {
    isTokenExpired,
    showTokenExpiredModal,
    timeUntilExpiry,
    handleTokenExpired,
    handleCloseModal,
    startTokenMonitoring,
    stopTokenMonitoring
  }
}

