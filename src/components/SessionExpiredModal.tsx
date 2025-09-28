'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface SessionExpiredModalProps {
  isOpen: boolean
  onClose?: () => void
}

export default function SessionExpiredModal({ isOpen, onClose }: SessionExpiredModalProps) {
  const [countdown, setCountdown] = useState(3)
  const router = useRouter()

  console.log('🔐 [SESSION-MODAL] isOpen:', isOpen)

  useEffect(() => {
    if (!isOpen) return

    console.log('🔐 [SESSION-MODAL] Modal opened - starting countdown')
    // Reset countdown when modal opens
    setCountdown(3)

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Redirect to login page
          router.push('/login')
          onClose?.()
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
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sessão Expirada
          </h3>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            Sua sessão expirou. Por favor, faça login novamente.
          </p>

          {/* Countdown */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {countdown}
            </div>
            <div className="text-sm text-gray-600">
              Redirecionando para o login em {countdown} segundo{countdown !== 1 ? 's' : ''}...
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            />
          </div>

          {/* Manual redirect button */}
          <button
            onClick={() => {
              router.push('/login')
              onClose?.()
            }}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Ir para Login Agora
          </button>
        </div>
      </div>
    </div>
  )
}
