'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface TokenExpiredModalProps {
  isOpen: boolean
  onClose?: () => void
  timeUntilExpiry?: number
}

export default function TokenExpiredModal({ 
  isOpen, 
  onClose, 
  timeUntilExpiry = 0 
}: TokenExpiredModalProps) {
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) return

    // Reset countdown when modal opens
    setCountdown(5)

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Use setTimeout to avoid setState during render
          setTimeout(() => {
            router.push('/welcome')
            onClose?.()
          }, 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, router, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-4">
            <svg
              className="h-8 w-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Token Expirado
          </h3>

          {/* Message */}
          <p className="text-gray-600 mb-4">
            Seu token de autenticação expirou. Por favor, faça login novamente.
          </p>

          {/* Time info */}
          {timeUntilExpiry !== 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-orange-800">
                <strong>Token expirou há:</strong> {Math.abs(timeUntilExpiry)} segundos
              </div>
            </div>
          )}

          {/* Countdown */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {countdown}
            </div>
            <div className="text-sm text-gray-600">
              Redirecionando para o welcome em {countdown} segundo{countdown !== 1 ? 's' : ''}...
            </div>
          </div>

          {/* Progress bar */}
          <div 
            className="w-full bg-gray-200 rounded-full h-2 mb-4"
            role="progressbar"
            aria-valuenow={5 - countdown}
            aria-valuemin={0}
            aria-valuemax={5}
            aria-label="Progresso do redirecionamento"
          >
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
            />
          </div>

          {/* Manual redirect button */}
          <button
            onClick={() => {
              router.push('/welcome')
              onClose?.()
            }}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors duration-200"
          >
            Ir para Welcome Agora
          </button>
        </div>
      </div>
    </div>
  )
}
