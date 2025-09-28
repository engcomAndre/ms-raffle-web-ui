'use client'

import { useSessionExpired } from '@/hooks/useSessionExpired'
import SessionExpiredModal from './SessionExpiredModal'

interface SessionProviderProps {
  children: React.ReactNode
}

export default function SessionProvider({ children }: SessionProviderProps) {
  const { showSessionExpiredModal, handleCloseModal } = useSessionExpired()

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
