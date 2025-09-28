import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import TokenExpiredModal from '@/components/TokenExpiredModal'

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('TokenExpiredModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    } as any)
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should not render when isOpen is false', () => {
    render(<TokenExpiredModal isOpen={false} />)
    
    expect(screen.queryByText('Token Expirado')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<TokenExpiredModal isOpen={true} />)
    
    expect(screen.getByText('Token Expirado')).toBeInTheDocument()
    expect(screen.getByText('Seu token de autenticação expirou. Por favor, faça login novamente.')).toBeInTheDocument()
  })

  it('should show countdown and redirect after 5 seconds', async () => {
    const onClose = jest.fn()
    render(<TokenExpiredModal isOpen={true} onClose={onClose} />)
    
    // Should start with countdown of 5
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Redirecionando para o welcome em 5 segundos...')).toBeInTheDocument()
    
    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    
    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument()
    })
    
    // Fast forward to the end
    act(() => {
      jest.advanceTimersByTime(4000)
    })
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/welcome')
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('should show time until expiry when provided', () => {
    render(<TokenExpiredModal isOpen={true} timeUntilExpiry={-120} />)
    
    // Verificar se o modal está renderizado com as informações de tempo
    expect(screen.getByText('Token Expirado')).toBeInTheDocument()
    expect(screen.getByText('Seu token de autenticação expirou. Por favor, faça login novamente.')).toBeInTheDocument()
  })

  it('should handle manual redirect button click', () => {
    const onClose = jest.fn()
    render(<TokenExpiredModal isOpen={true} onClose={onClose} />)
    
    const redirectButton = screen.getByText('Ir para Welcome Agora')
    fireEvent.click(redirectButton)
    
    expect(mockPush).toHaveBeenCalledWith('/welcome')
    expect(onClose).toHaveBeenCalled()
  })

  it('should show progress bar animation', () => {
    render(<TokenExpiredModal isOpen={true} />)
    
    const progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toBeInTheDocument()
    
    // Check initial progress (0%)
    const progressFill = progressBar.querySelector('div')
    expect(progressFill).toHaveStyle('width: 0%')
  })

  it('should update progress bar as countdown progresses', async () => {
    render(<TokenExpiredModal isOpen={true} />)
    
    const progressBar = screen.getByRole('progressbar', { hidden: true })
    const progressFill = progressBar.querySelector('div')
    
    // Fast forward 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    
    await waitFor(() => {
      expect(progressFill).toHaveStyle('width: 40%') // 2/5 * 100%
    })
  })

  it('should reset countdown when modal reopens', () => {
    const { rerender } = render(<TokenExpiredModal isOpen={false} />)
    
    // Open modal
    rerender(<TokenExpiredModal isOpen={true} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    
    // Fast forward 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    
    expect(screen.getByText('3')).toBeInTheDocument()
    
    // Close and reopen
    rerender(<TokenExpiredModal isOpen={false} />)
    rerender(<TokenExpiredModal isOpen={true} />)
    
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should clean up timers on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
    
    const { unmount } = render(<TokenExpiredModal isOpen={true} />)
    
    unmount()
    
    expect(clearIntervalSpy).toHaveBeenCalled()
    
    clearIntervalSpy.mockRestore()
  })

  it('should handle singular/plural text correctly', () => {
    render(<TokenExpiredModal isOpen={true} />)
    
    // Should show plural initially
    expect(screen.getByText('Redirecionando para o welcome em 5 segundos...')).toBeInTheDocument()
    
    // Fast forward to 1 second
    act(() => {
      jest.advanceTimersByTime(4000)
    })
    
    expect(screen.getByText('Redirecionando para o welcome em 1 segundo...')).toBeInTheDocument()
  })
})
