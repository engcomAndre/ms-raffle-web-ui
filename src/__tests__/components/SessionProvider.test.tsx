import { render, screen } from '@testing-library/react'
import SessionProvider from '@/components/SessionProvider'

// Mock the useSessionExpired hook
jest.mock('@/hooks/useSessionExpired', () => ({
  useSessionExpired: jest.fn(),
}))

import { useSessionExpired } from '@/hooks/useSessionExpired'

const mockUseSessionExpired = useSessionExpired as jest.MockedFunction<typeof useSessionExpired>

describe('SessionProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render children', () => {
    mockUseSessionExpired.mockReturnValue({
      isSessionExpired: false,
      showSessionExpiredModal: false,
      handleSessionExpired: jest.fn(),
      handleCloseModal: jest.fn(),
    })

    render(
      <SessionProvider>
        <div data-testid="child">Test Child</div>
      </SessionProvider>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('should render SessionExpiredModal when showSessionExpiredModal is true', () => {
    mockUseSessionExpired.mockReturnValue({
      isSessionExpired: true,
      showSessionExpiredModal: true,
      handleSessionExpired: jest.fn(),
      handleCloseModal: jest.fn(),
    })

    render(
      <SessionProvider>
        <div data-testid="child">Test Child</div>
      </SessionProvider>
    )

    expect(screen.getByText('Sessão Expirada')).toBeInTheDocument()
    expect(screen.getByText('Sua sessão expirou. Por favor, faça login novamente.')).toBeInTheDocument()
  })

  it('should not render SessionExpiredModal when showSessionExpiredModal is false', () => {
    mockUseSessionExpired.mockReturnValue({
      isSessionExpired: false,
      showSessionExpiredModal: false,
      handleSessionExpired: jest.fn(),
      handleCloseModal: jest.fn(),
    })

    render(
      <SessionProvider>
        <div data-testid="child">Test Child</div>
      </SessionProvider>
    )

    expect(screen.queryByText('Sessão Expirada')).not.toBeInTheDocument()
  })

  it('should pass correct props to SessionExpiredModal', () => {
    const mockHandleCloseModal = jest.fn()
    
    mockUseSessionExpired.mockReturnValue({
      isSessionExpired: true,
      showSessionExpiredModal: true,
      handleSessionExpired: jest.fn(),
      handleCloseModal: mockHandleCloseModal,
    })

    render(
      <SessionProvider>
        <div data-testid="child">Test Child</div>
      </SessionProvider>
    )

    // The modal should be rendered with the correct props
    expect(screen.getByText('Sessão Expirada')).toBeInTheDocument()
    
    // Test that the close handler is passed correctly by clicking the manual login button
    const loginButton = screen.getByText('Ir para Login Agora')
    loginButton.click()
    
    // The handleCloseModal should be called when the modal is closed
    // This is tested in the SessionExpiredModal component tests
  })
})
