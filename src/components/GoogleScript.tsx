'use client'

import { useEffect, useState } from 'react'

export function GoogleScript() {
  useEffect(() => {
    // Função para carregar o script do Google
    const loadGoogleScript = () => {
      // Verificar se já existe
      const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]')
      if (existingScript) {
        console.log('📡 Script do Google já existe')
        return
      }

      console.log('🔄 Carregando script do Google...')
      
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      
      script.onload = () => {
        console.log('✅ Script do Google carregado com sucesso!')
        // Disparar evento customizado para notificar outros componentes
        window.dispatchEvent(new CustomEvent('google-script-loaded'))
      }
      
      script.onerror = () => {
        console.error('❌ Erro ao carregar script do Google')
      }
      
      document.head.appendChild(script)
    }

    // Carregar imediatamente
    loadGoogleScript()

    // Também verificar periodicamente se o script carregou
    const checkInterval = setInterval(() => {
      if (window.google) {
        console.log('🎉 Google API disponível!')
        clearInterval(checkInterval)
      }
    }, 1000)

    // Limpar intervalo após 10 segundos
    const timeout = setTimeout(() => {
      clearInterval(checkInterval)
    }, 10000)

    return () => {
      clearInterval(checkInterval)
      clearTimeout(timeout)
    }
  }, [])

  return null // Este componente não renderiza nada
}

// Hook para verificar se o Google está disponível
export function useGoogleReady() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const checkGoogle = () => {
      if (window.google?.accounts?.id) {
        setIsReady(true)
        return true
      }
      return false
    }

    // Verificar imediatamente
    if (checkGoogle()) return

    // Escutar evento de carregamento
    const handleGoogleLoaded = () => {
      setTimeout(checkGoogle, 100) // Pequeno delay para garantir que está totalmente carregado
    }

    window.addEventListener('google-script-loaded', handleGoogleLoaded)

    // Verificar periodicamente
    const interval = setInterval(() => {
      if (checkGoogle()) {
        clearInterval(interval)
      }
    }, 500)

    return () => {
      window.removeEventListener('google-script-loaded', handleGoogleLoaded)
      clearInterval(interval)
    }
  }, [])

  return isReady
}