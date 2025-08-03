'use client'

import { useEffect, useState, useRef } from 'react'
import { useGoogleButtonSafe } from '@/hooks/useGoogleButtonSafe'

interface GoogleLoginSectionProps {
  buttonId: string
  title?: string
  description?: string
  variant?: 'blue' | 'green' | 'purple'
}

export function GoogleLoginSection({ 
  buttonId, 
  title = "🚀 Login Rápido com Google",
  description = "Clique no botão oficial do Google quando aparecer",
  variant = 'blue'
}: GoogleLoginSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)
  const { registerButton, googleReady, buttonRendered } = useGoogleButtonSafe()

  const variants = {
    blue: {
      gradient: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      titleColor: 'text-blue-700',
      descColor: 'text-blue-500',
      loadingColor: 'text-blue-600',
      spinnerColor: 'border-blue-600'
    },
    green: {
      gradient: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      titleColor: 'text-green-700',
      descColor: 'text-green-500',
      loadingColor: 'text-green-600',
      spinnerColor: 'border-green-600'
    },
    purple: {
      gradient: 'from-purple-50 to-indigo-50',
      border: 'border-purple-200',
      titleColor: 'text-purple-700',
      descColor: 'text-purple-500',
      loadingColor: 'text-purple-600',
      spinnerColor: 'border-purple-600'
    }
  }

  const style = variants[variant]

  useEffect(() => {
    // Registrar o botão com o hook seguro
    if (buttonRef.current && googleReady) {
      registerButton(buttonId, buttonRef.current)
    }
  }, [buttonId, googleReady, registerButton])

  useEffect(() => {
    // Verificar se o botão foi carregado
    const checkButton = () => {
      if (buttonRef.current && buttonRef.current.querySelector('[data-google-button]')) {
        setIsLoaded(true)
        return true
      }
      return false
    }

    if (buttonRendered) {
      const timeout = setTimeout(checkButton, 500)
      return () => clearTimeout(timeout)
    }
  }, [buttonRendered])

  return (
    <div className="w-full">
      <div className={`bg-gradient-to-r ${style.gradient} border-2 border-dashed ${style.border} rounded-lg p-6 mb-4 transition-all duration-300 ${isLoaded ? 'border-solid shadow-lg' : ''}`}>
        
        {/* Header minimalista */}
        {!isLoaded && (
          <div className="text-center mb-3">
            <div className="flex items-center justify-center">
              <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${style.gradient} flex items-center justify-center animate-pulse`}>
                🔄
              </div>
            </div>
          </div>
        )}

        {/* Container do botão */}
        <div 
          ref={buttonRef}
          className={`w-full flex justify-center min-h-[44px] items-center transition-all duration-300 ${isLoaded ? 'scale-105' : ''}`}
        >
          {!isLoaded && (
            <div className={`flex items-center space-x-3 ${style.loadingColor}`}>
              <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${style.spinnerColor}`}></div>
              <span className="text-sm font-medium">Carregando botão do Google...</span>
            </div>
          )}
        </div>

        {/* Descrição */}
        {!isLoaded && (
          <div className="text-center mt-3">
            <span className={`text-xs ${style.descColor}`}>
              {description}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}