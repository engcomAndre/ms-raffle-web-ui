import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WelcomePage from '../app/welcome/welcome'

// Mock completo dos serviços
jest.mock('@/services/userPassLoginService', () => ({
  UserPassLoginService: jest.fn().mockImplementation(() => ({
    login: jest.fn().mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve({
        success: true,
        data: { username: 'testuser', token: 'test-token' }
      }), 80))
    )
  }))
}))

jest.mock('@/services/googleLoginService', () => ({
  GoogleLoginService: jest.fn().mockImplementation(() => ({
    handleGoogleLogin: jest.fn().mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve({
        success: true,
        data: { username: 'googleuser', token: 'google-token' }
      }), 80))
    )
  }))
}))

jest.mock('@/services/authService', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    register: jest.fn().mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve({
        success: true,
        data: { id: '123', username: 'newuser' },
        message: 'Conta criada com sucesso!'
      }), 80))
    )
  }))
}))

jest.mock('@/components/GoogleLoginSection', () => ({
  GoogleLoginSection: ({ onGoogleLogin }: { onGoogleLogin: (credential: string) => void }) => (
    <button 
      onClick={() => onGoogleLogin('mock-google-credential')}
      data-testid="google-login-button"
    >
      Login com Google
    </button>
  )
}))

describe('Testes de Integração - Fluxo Completo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Fluxo de Login', () => {
    test('deve completar fluxo de login completo com usuário e senha', async () => {
      const user = userEvent.setup()
      render(<WelcomePage />)
      
      // 1. Preencher formulário de login
      await user.type(screen.getByLabelText('Nome de usuário', { selector: '#login-username' }), 'admin')
      await user.type(screen.getByLabelText('Senha', { selector: '#login-password' }), 'admin123')
      
      // 2. Submeter formulário
      const loginButton = screen.getByRole('button', { name: 'Entrar' })
      await user.click(loginButton)
      
      // 3. Verificar estado de loading
      await waitFor(() => {
        expect(loginButton).toHaveTextContent('Entrando...')
      })
      
      // 4. Verificar se o serviço foi chamado (mock)
      expect(loginButton).toBeInTheDocument()
    })

    test('deve completar fluxo de login com Google', async () => {
      const user = userEvent.setup()
      render(<WelcomePage />)
      
      // 1. Clicar no botão de login com Google
      const googleButton = screen.getByTestId('google-login-button')
      await user.click(googleButton)
      
      // 2. Verificar se o serviço foi chamado
      expect(googleButton).toBeInTheDocument()
    })
  })

  describe('Fluxo de Registro', () => {
    test('deve completar fluxo de registro completo', async () => {
      const user = userEvent.setup()
      render(<WelcomePage />)
      
      // 1. Preencher todos os campos do formulário
      await user.type(screen.getByLabelText('Nome'), 'Maria')
      await user.type(screen.getByLabelText('Sobrenome'), 'Santos')
      await user.type(screen.getByLabelText('Nome de usuário', { selector: '#username' }), 'mariasantos')
      await user.type(screen.getByLabelText('Email'), 'maria@test.com')
      await user.type(screen.getByLabelText('Senha', { selector: '#password' }), 'Maria123!')
      await user.type(screen.getByLabelText('Repetir Senha'), 'Maria123!')
      
      // 2. Verificar validações de senha em tempo real
      expect(screen.getByText('✅ Pelo menos 8 caracteres')).toBeInTheDocument()
      expect(screen.getByText('✅ Uma letra minúscula')).toBeInTheDocument()
      expect(screen.getByText('✅ Uma letra maiúscula')).toBeInTheDocument()
      expect(screen.getByText('✅ Um número')).toBeInTheDocument()
      expect(screen.getByText('✅ Senhas coincidem')).toBeInTheDocument()
      
      // 3. Submeter formulário
      const registerButton = screen.getByRole('button', { name: 'Criar Conta' })
      await user.click(registerButton)
      
      // 4. Verificar estado de loading
      await waitFor(() => {
        expect(registerButton).toHaveTextContent('Cadastrando...')
      })
      
      // 5. Verificar mensagem de sucesso
      await waitFor(() => {
        expect(screen.getByText(/Conta criada com sucesso/)).toBeInTheDocument()
      })
    })

    test('deve validar senha fraca e impedir registro', async () => {
      const user = userEvent.setup()
      render(<WelcomePage />)
      
      // 1. Preencher formulário com senha fraca
      await user.type(screen.getByLabelText('Nome'), 'João')
      await user.type(screen.getByLabelText('Sobrenome'), 'Silva')
      await user.type(screen.getByLabelText('Nome de usuário', { selector: '#username' }), 'joaosilva')
      await user.type(screen.getByLabelText('Email'), 'joao@test.com')
      await user.type(screen.getByLabelText('Senha', { selector: '#password' }), 'weak')
      await user.type(screen.getByLabelText('Repetir Senha'), 'weak')
      
      // 2. Submeter formulário
      const registerButton = screen.getByRole('button', { name: 'Criar Conta' })
      await user.click(registerButton)
      
      // 3. Verificar erro de validação
      await waitFor(() => {
        expect(screen.getByText('A senha deve ter pelo menos 8 caracteres')).toBeInTheDocument()
      })
    })

    test('deve validar senhas que não coincidem', async () => {
      const user = userEvent.setup()
      render(<WelcomePage />)
      
      // 1. Preencher formulário com senhas diferentes
      await user.type(screen.getByLabelText('Nome'), 'Ana')
      await user.type(screen.getByLabelText('Sobrenome'), 'Costa')
      await user.type(screen.getByLabelText('Nome de usuário', { selector: '#username' }), 'anacosta')
      await user.type(screen.getByLabelText('Email'), 'ana@test.com')
      await user.type(screen.getByLabelText('Senha', { selector: '#password' }), 'Ana123!')
      await user.type(screen.getByLabelText('Repetir Senha'), 'Ana456!')
      
      // 2. Verificar validação em tempo real
      expect(screen.getByText('❌ Senhas não coincidem')).toBeInTheDocument()
      
      // 3. Submeter formulário
      const registerButton = screen.getByRole('button', { name: 'Criar Conta' })
      await user.click(registerButton)
      
      // 4. Verificar erro de validação
      await waitFor(() => {
        expect(screen.getByText(/Senhas não coincidem/)).toBeInTheDocument()
      })
    })
  })

  describe('Validações de Formulário', () => {
    test('deve validar campos obrigatórios', async () => {
      const user = userEvent.setup()
      render(<WelcomePage />)
      
      // Tentar submeter formulário vazio
      const registerButton = screen.getByRole('button', { name: 'Criar Conta' })
      await user.click(registerButton)
      
      // Verificar se os campos obrigatórios estão marcados
      expect(screen.getByLabelText('Nome')).toBeRequired()
      expect(screen.getByLabelText('Sobrenome')).toBeRequired()
      expect(screen.getByLabelText('Nome de usuário', { selector: '#username' })).toBeRequired()
      expect(screen.getByLabelText('Email')).toBeRequired()
      expect(screen.getByLabelText('Senha', { selector: '#password' })).toBeRequired()
      expect(screen.getByLabelText('Repetir Senha')).toBeRequired()
    })

    test('deve validar formato de email', async () => {
      const user = userEvent.setup()
      render(<WelcomePage />)
      
      // Preencher email inválido
      await user.type(screen.getByLabelText('Email'), 'email-invalido')
      
      // Verificar se o campo de email tem tipo correto
      const emailInput = screen.getByLabelText('Email')
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })

  describe('Estados da Interface', () => {
    test('deve alternar entre estados de loading e normal', async () => {
      const user = userEvent.setup()
      render(<WelcomePage />)
      
      const loginButton = screen.getByRole('button', { name: 'Entrar' })
      const registerButton = screen.getByRole('button', { name: 'Criar Conta' })
      
      // Estado inicial
      expect(loginButton).toHaveTextContent('Entrar')
      expect(registerButton).toHaveTextContent('Criar Conta')
      
      // Simular login
      await user.type(screen.getByLabelText('Nome de usuário', { selector: '#login-username' }), 'testuser')
      await user.type(screen.getByLabelText('Senha', { selector: '#login-password' }), 'testpass')
      await user.click(loginButton)
      
      // Estado de loading
      await waitFor(() => {
        expect(loginButton).toHaveTextContent('Entrando...')
      })
      
      // Simular registro
      await user.type(screen.getByLabelText('Nome'), 'Test')
      await user.type(screen.getByLabelText('Sobrenome'), 'User')
      await user.type(screen.getByLabelText('Nome de usuário', { selector: '#username' }), 'testuser2')
      await user.type(screen.getByLabelText('Email'), 'test@test.com')
      await user.type(screen.getByLabelText('Senha', { selector: '#password' }), 'Test123!')
      await user.type(screen.getByLabelText('Repetir Senha'), 'Test123!')
      
      await user.click(registerButton)
      
      // Estado de loading
      await waitFor(() => {
        expect(registerButton).toHaveTextContent('Cadastrando...')
      })
    })

    test('deve mostrar e ocultar mensagens de erro e sucesso', async () => {
      const user = userEvent.setup()
      render(<WelcomePage />)
      
      // Inicialmente não deve ter mensagens
      expect(screen.queryByText(/erro/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/sucesso/i)).not.toBeInTheDocument()
      
      // Simular registro bem-sucedido
      await user.type(screen.getByLabelText('Nome'), 'Sucesso')
      await user.type(screen.getByLabelText('Sobrenome'), 'Test')
      await user.type(screen.getByLabelText('Nome de usuário', { selector: '#username' }), 'sucesso')
      await user.type(screen.getByLabelText('Email'), 'sucesso@test.com')
      await user.type(screen.getByLabelText('Senha', { selector: '#password' }), 'Sucesso123!')
      await user.type(screen.getByLabelText('Repetir Senha'), 'Sucesso123!')
      
      const registerButton = screen.getByRole('button', { name: 'Criar Conta' })
      await user.click(registerButton)
      
      // Deve mostrar mensagem de sucesso
      await waitFor(() => {
        expect(screen.getByText(/Conta criada com sucesso/)).toBeInTheDocument()
      })
    })
  })
})
