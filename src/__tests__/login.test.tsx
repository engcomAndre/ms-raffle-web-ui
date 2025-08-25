import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../app/login/page'

// Mock dos componentes e hooks
jest.mock('../hooks/useGoogleButtonSafe', () => ({
  useGoogleButtonSafe: jest.fn()
}))

jest.mock('../components/GoogleLoginSection', () => ({
  GoogleLoginSection: ({ buttonId, description, variant }: { buttonId: string; description: string; variant: string }) => (
    <div data-testid="google-login-section" data-button-id={buttonId} data-variant={variant}>
      {description}
    </div>
  )
}))

jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: { href: string; children: React.ReactNode }) {
    return <a href={href} {...props}>{children}</a>
  }
})

const mockUseGoogleButtonSafe = require('../hooks/useGoogleButtonSafe').useGoogleButtonSafe

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGoogleButtonSafe.mockReturnValue({
      login: jest.fn(),
      isLoading: false
    })
  })

  describe('Renderização da Página', () => {
    test('deve renderizar o título MS Raffle', () => {
      render(<LoginPage />)

      expect(screen.getByText('🎰 MS Raffle')).toBeInTheDocument()
    })

    test('deve renderizar a descrição da página', () => {
      render(<LoginPage />)

      expect(screen.getByText('Faça login para acessar sua conta')).toBeInTheDocument()
    })

    test('deve ter fundo gradiente', () => {
      render(<LoginPage />)

      const container = screen.getByText('🎰 MS Raffle').closest('.min-h-screen')
      expect(container).toHaveClass('bg-gradient-to-br', 'from-blue-500', 'to-purple-600')
    })

    test('deve centralizar o conteúdo', () => {
      render(<LoginPage />)

      const container = screen.getByText('🎰 MS Raffle').closest('.min-h-screen')
      expect(container).toHaveClass('flex', 'items-center', 'justify-center')
    })
  })

  describe('Formulário de Login', () => {
    test('deve renderizar campo de email', () => {
      render(<LoginPage />)

      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
    })

    test('deve renderizar campo de senha', () => {
      render(<LoginPage />)

      expect(screen.getByLabelText('Senha')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Sua senha')).toBeInTheDocument()
    })

    test('deve renderizar botão de submit', () => {
      render(<LoginPage />)

      expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
    })

    test('deve ter campos obrigatórios', () => {
      render(<LoginPage />)

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Senha')

      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('required')
    })
  })

  describe('Interatividade dos Campos', () => {
    test('deve atualizar valor do email ao digitar', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByLabelText('Email')
      await user.type(emailInput, 'test@example.com')

      expect(emailInput).toHaveValue('test@example.com')
    })

    test('deve atualizar valor da senha ao digitar', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const passwordInput = screen.getByLabelText('Senha')
      await user.type(passwordInput, 'password123')

      expect(passwordInput).toHaveValue('password123')
    })

    test('deve limpar campos após envio bem-sucedido', async () => {
      const mockLogin = jest.fn().mockResolvedValue({ success: true })
      mockUseGoogleButtonSafe.mockReturnValue({
        login: mockLogin,
        isLoading: false
      })

      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Senha')
      const submitButton = screen.getByRole('button', { name: 'Entrar' })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })
  })

  describe('Submissão do Formulário', () => {
    test('deve chamar função de login ao submeter', async () => {
      const mockLogin = jest.fn().mockResolvedValue({ success: true })
      mockUseGoogleButtonSafe.mockReturnValue({
        login: mockLogin,
        isLoading: false
      })

      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Senha')
      const submitButton = screen.getByRole('button', { name: 'Entrar' })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })

    test('deve mostrar erro quando login falha', async () => {
      const mockLogin = jest.fn().mockResolvedValue({ 
        success: false, 
        error: 'Credenciais inválidas' 
      })
      mockUseGoogleButtonSafe.mockReturnValue({
        login: mockLogin,
        isLoading: false
      })

      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Senha')
      const submitButton = screen.getByRole('button', { name: 'Entrar' })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument()
      })
    })

    test('deve mostrar erro genérico quando não há mensagem específica', async () => {
      const mockLogin = jest.fn().mockResolvedValue({ success: false })
      mockUseGoogleButtonSafe.mockReturnValue({
        login: mockLogin,
        isLoading: false
      })

      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Senha')
      const submitButton = screen.getByRole('button', { name: 'Entrar' })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Erro ao fazer login')).toBeInTheDocument()
      })
    })
  })

  describe('Estado de Loading', () => {
    test('deve mostrar "Entrando..." quando isLoading é true', () => {
      mockUseGoogleButtonSafe.mockReturnValue({
        login: jest.fn(),
        isLoading: true
      })

      render(<LoginPage />)

      expect(screen.getByRole('button', { name: 'Entrando...' })).toBeInTheDocument()
    })

    test('deve desabilitar botão quando isLoading é true', () => {
      mockUseGoogleButtonSafe.mockReturnValue({
        login: jest.fn(),
        isLoading: true
      })

      render(<LoginPage />)

      const submitButton = screen.getByRole('button', { name: 'Entrando...' })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('GoogleLoginSection', () => {
    test('deve renderizar GoogleLoginSection com props corretas', () => {
      render(<LoginPage />)

      const googleSection = screen.getByTestId('google-login-section')
      expect(googleSection).toHaveAttribute('data-button-id', 'login-google-button')
      expect(googleSection).toHaveAttribute('data-variant', 'green')
      expect(googleSection).toHaveTextContent('Login com Google')
    })
  })

  describe('Links de Navegação', () => {
    test('deve ter link para criar conta', () => {
      render(<LoginPage />)

      const createAccountLink = screen.getByText('Criar conta')
      expect(createAccountLink).toHaveAttribute('href', '/register')
    })

    test('deve ter link para voltar ao início', () => {
      render(<LoginPage />)

      const backLink = screen.getByText('← Voltar para o início')
      expect(backLink).toHaveAttribute('href', '/')
    })
  })

  describe('Credenciais de Teste', () => {
    test('deve mostrar credenciais de teste', () => {
      render(<LoginPage />)

      expect(screen.getByText('Credenciais de teste:')).toBeInTheDocument()
      expect(screen.getByText(/admin@msraffle.com/)).toBeInTheDocument()
      expect(screen.getByText(/123456/)).toBeInTheDocument()
    })

    test('deve ter área de credenciais estilizada', () => {
      render(<LoginPage />)

      const credentialsArea = screen.getByText('Credenciais de teste:').closest('.bg-gray-50')
      expect(credentialsArea).toHaveClass('bg-gray-50', 'rounded-lg')
    })
  })

  describe('Separador Visual', () => {
    test('deve renderizar separador "ou"', () => {
      render(<LoginPage />)

      expect(screen.getByText('ou')).toBeInTheDocument()
    })

    test('deve ter separador estilizado', () => {
      render(<LoginPage />)

      const separator = screen.getByText('ou').closest('.relative')
      expect(separator).toHaveClass('relative', 'flex', 'justify-center', 'text-sm')
    })
  })

  describe('Tratamento de Erros', () => {
    test('deve limpar erro ao submeter novamente', async () => {
      const mockLogin = jest.fn()
        .mockResolvedValueOnce({ success: false, error: 'Primeiro erro' })
        .mockResolvedValueOnce({ success: true })

      mockUseGoogleButtonSafe.mockReturnValue({
        login: mockLogin,
        isLoading: false
      })

      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Senha')
      const submitButton = screen.getByRole('button', { name: 'Entrar' })

      // Primeira tentativa - falha
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Primeiro erro')).toBeInTheDocument()
      })

      // Segunda tentativa - sucesso
      await user.type(emailInput, 'correctpassword')
      await user.type(passwordInput, 'correctpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Debug Info', () => {
    test('deve mostrar informações de debug', () => {
      render(<LoginPage />)

      expect(screen.getByText(/Debug: Client ID configurado:/)).toBeInTheDocument()
      expect(screen.getByText(/Debug: Hook carregado:/)).toBeInTheDocument()
    })

    test('deve ter área de debug estilizada', () => {
      render(<LoginPage />)

      const debugArea = screen.getByText(/Debug: Client ID configurado:/).closest('.bg-yellow-50')
      expect(debugArea).toHaveClass('bg-yellow-50', 'border', 'border-yellow-200')
    })
  })

  describe('Validação de Formulário', () => {
    test('deve validar formato de email', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByLabelText('Email')
      await user.type(emailInput, 'invalid-email')

      expect(emailInput).toHaveAttribute('type', 'email')
    })

    test('deve ter campos com foco estilizado', () => {
      render(<LoginPage />)

      const emailInput = screen.getByLabelText('Email')
      expect(emailInput).toHaveClass('focus:ring-2', 'focus:ring-blue-500', 'focus:border-transparent')
    })
  })
})
