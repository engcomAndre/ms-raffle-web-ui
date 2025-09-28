'use client'

import { useSessionExpired } from '@/hooks/useSessionExpired'
import SessionExpiredModal from './SessionExpiredModal'

interface SessionProviderProps {
  children: React.ReactNode
}

export default function SessionProvider({ children }: SessionProviderProps) {
  const { showSessionExpiredModal, handleCloseModal } = useSessionExpired()

  console.log('🔐 [SESSION-PROVIDER] showSessionExpiredModal:', showSessionExpiredModal)

  return (
    <>
      {children}
      <SessionExpiredModal 
        isOpen={showSessionExpiredModal} 
        onClose={handleCloseModal} 
      />
    </>
  )
}
