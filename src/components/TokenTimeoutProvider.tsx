'use client'

import { useTokenTimeout } from '@/hooks/useTokenTimeout'
import TokenExpiredModal from './TokenExpiredModal'

interface TokenTimeoutProviderProps {
  children: React.ReactNode
}

export default function TokenTimeoutProvider({ children }: TokenTimeoutProviderProps) {
  const { 
    showTokenExpiredModal, 
    handleCloseModal, 
    timeUntilExpiry 
  } = useTokenTimeout()

  return (
    <>
      {children}
      <TokenExpiredModal 
        isOpen={showTokenExpiredModal} 
        onClose={handleCloseModal}
        timeUntilExpiry={timeUntilExpiry}
      />
    </>
  )
}

