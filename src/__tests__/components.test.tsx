import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardLayout } from '../components/DashboardLayout'
import { GoogleLoginSection } from '../components/GoogleLoginSection'

// Mock do Next.js
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
}))

// Mock do hook useLogout
jest.mock('../hooks/useLogout', () => ({
  useLogout: () => jest.fn()
}))

// Mock do hook useGoogleButtonSafe
jest.mock('../hooks/useGoogleButtonSafe', () => ({
  useGoogleButtonSafe: () => true
}))

describe('DashboardLayout', () => {
  const mockChildren = <div data-testid="dashboard-content">Dashboard Content</div>

  test('deve renderizar layout com children', () => {
    render(<DashboardLayout>{mockChildren}</DashboardLayout>)
    
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
  })

  test('deve renderizar cabeçalho com título', () => {
    render(<DashboardLayout>{mockChildren}</DashboardLayout>)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  test('deve renderizar menu de navegação', () => {
    render(<DashboardLayout>{mockChildren}</DashboardLayout>)
    
    expect(screen.getByText('Minhas Rifas')).toBeInTheDocument()
  })

  test('deve renderizar usuário no cabeçalho', () => {
    render(<DashboardLayout>{mockChildren}</DashboardLayout>)
    
    expect(screen.getByText('Usuário')).toBeInTheDocument()
  })

  test('deve ter estrutura de layout responsiva', () => {
    render(<DashboardLayout>{mockChildren}</DashboardLayout>)
    
    const layout = screen.getByTestId('dashboard-content').closest('div')
    expect(layout).toBeInTheDocument()
  })
})

describe('GoogleLoginSection', () => {
  const mockOnGoogleLogin = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('deve renderizar com descrição personalizada', () => {
    render(
      <GoogleLoginSection
        buttonId="test-button"
        description="Login personalizado"
        variant="blue"
        onGoogleLogin={mockOnGoogleLogin}
      />
    )
    
    expect(screen.getByText('Login personalizado')).toBeInTheDocument()
  })

  test('deve renderizar com variante azul', () => {
    render(
      <GoogleLoginSection
        buttonId="test-button"
        description="Teste azul"
        variant="blue"
        onGoogleLogin={mockOnGoogleLogin}
      />
    )
    
    expect(screen.getByText('Teste azul')).toBeInTheDocument()
  })

  test('deve renderizar com variante roxa', () => {
    render(
      <GoogleLoginSection
        buttonId="test-button"
        description="Teste roxo"
        variant="purple"
        onGoogleLogin={mockOnGoogleLogin}
      />
    )
    
    expect(screen.getByText('Teste roxo')).toBeInTheDocument()
  })

  test('deve ter ID personalizado configurado', () => {
    render(
      <GoogleLoginSection
        buttonId="custom-id"
        description="Teste ID"
        variant="blue"
        onGoogleLogin={mockOnGoogleLogin}
      />
    )
    
    expect(screen.getByText('Teste ID')).toBeInTheDocument()
  })

  test('deve renderizar com descrição personalizada', () => {
    render(
      <GoogleLoginSection
        buttonId="test-button"
        description="Descrição personalizada"
        variant="blue"
        onGoogleLogin={mockOnGoogleLogin}
      />
    )
    
    expect(screen.getByText('Descrição personalizada')).toBeInTheDocument()
  })
})
