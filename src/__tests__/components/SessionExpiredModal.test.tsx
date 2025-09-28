import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import SessionExpiredModal from '@/components/SessionExpiredModal'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
}

describe('SessionExpiredModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should not render when isOpen is false', () => {
    render(<SessionExpiredModal isOpen={false} />)
    
    expect(screen.queryByText('Sessão Expirada')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<SessionExpiredModal isOpen={true} />)
    
    expect(screen.getByText('Sessão Expirada')).toBeInTheDocument()
    expect(screen.getByText('Sua sessão expirou. Por favor, faça login novamente.')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Redirecionando para o welcome em 3 segundos...')).toBeInTheDocument()
    expect(screen.getByText('Ir para Welcome Agora')).toBeInTheDocument()
  })

  it('should countdown from 3 to 0 and redirect', async () => {
    render(<SessionExpiredModal isOpen={true} />)
    
    // Initial state
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Redirecionando para o welcome em 3 segundos...')).toBeInTheDocument()
    
    // After 1 second
    jest.advanceTimersByTime(1000)
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('Redirecionando para o welcome em 2 segundos...')).toBeInTheDocument()
    })
    
    // After 2 seconds
    jest.advanceTimersByTime(1000)
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('Redirecionando para o welcome em 1 segundo...')).toBeInTheDocument()
    })
    
    // After 3 seconds - should redirect
    jest.advanceTimersByTime(1000)
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/welcome')
    })
  })

  it('should call onClose when countdown reaches 0', async () => {
    const mockOnClose = jest.fn()
    render(<SessionExpiredModal isOpen={true} onClose={mockOnClose} />)
    
    // Fast forward 3 seconds
    jest.advanceTimersByTime(3000)
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should redirect immediately when "Ir para Welcome Agora" is clicked', () => {
    render(<SessionExpiredModal isOpen={true} />)
    
    const welcomeButton = screen.getByText('Ir para Welcome Agora')
    welcomeButton.click()
    
    expect(mockPush).toHaveBeenCalledWith('/welcome')
  })

  it('should call onClose when "Ir para Welcome Agora" is clicked', () => {
    const mockOnClose = jest.fn()
    render(<SessionExpiredModal isOpen={true} onClose={mockOnClose} />)
    
    const welcomeButton = screen.getByText('Ir para Welcome Agora')
    welcomeButton.click()
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should reset countdown when isOpen changes from false to true', () => {
    const { rerender } = render(<SessionExpiredModal isOpen={false} />)
    
    // Open modal
    rerender(<SessionExpiredModal isOpen={true} />)
    
    expect(screen.getByText('3')).toBeInTheDocument()
    
    // Advance time
    jest.advanceTimersByTime(1000)
    
    // Close and reopen
    rerender(<SessionExpiredModal isOpen={false} />)
    rerender(<SessionExpiredModal isOpen={true} />)
    
    // Should reset to 3
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should show correct pluralization for seconds', async () => {
    render(<SessionExpiredModal isOpen={true} />)
    
    // 3 seconds (plural)
    expect(screen.getByText('Redirecionando para o welcome em 3 segundos...')).toBeInTheDocument()
    
    // 2 seconds (plural)
    jest.advanceTimersByTime(1000)
    await waitFor(() => {
      expect(screen.getByText('Redirecionando para o welcome em 2 segundos...')).toBeInTheDocument()
    })
    
    // 1 second (singular)
    jest.advanceTimersByTime(1000)
    await waitFor(() => {
      expect(screen.getByText('Redirecionando para o welcome em 1 segundo...')).toBeInTheDocument()
    })
  })
})
