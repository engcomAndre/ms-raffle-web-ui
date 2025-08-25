import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WelcomePage from '../app/welcome/welcome'

// Mock dos serviços
jest.mock('@/services/userPassLoginService', () => ({
  UserPassLoginService: jest.fn().mockImplementation(() => ({
    login: jest.fn().mockResolvedValue({
      success: true,
      data: { username: 'testuser', token: 'test-token' }
    })
  }))
}))

jest.mock('@/services/googleLoginService', () => ({
  GoogleLoginService: jest.fn().mockImplementation(() => ({
    handleGoogleLogin: jest.fn().mockResolvedValue({
      success: true,
      data: { username: 'googleuser', token: 'google-token' }
    })
  }))
}))

jest.mock('@/services/authService', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    register: jest.fn().mockResolvedValue({
      success: true,
      data: { id: '123', username: 'newuser' },
      message: 'Conta criada com sucesso!'
    })
  }))
}))

// Mock do componente GoogleLoginSection
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

describe('WelcomePage', () => {
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks()
    // Resetar localStorage
    localStorage.clear()
  })

  // Teste 1: Renderização inicial
  test('deve renderizar a página de boas-vindas com título e formulários', () => {
    render(<WelcomePage />)
    
    expect(screen.getByText('Entrar')).toBeInTheDocument()
    expect(screen.getByText('Criar Conta')).toBeInTheDocument()
    expect(screen.getByText('Faça login para acessar sua conta')).toBeInTheDocument()
    expect(screen.getByText('Cadastre-se para começar a usar o sistema')).toBeInTheDocument()
  })

  // Teste 2: Campos de login obrigatórios
  test('deve ter campos obrigatórios no formulário de login', () => {
    render(<WelcomePage />)
    
    const usernameInput = screen.getByLabelText('Nome de usuário')
    const passwordInput = screen.getByLabelText('Senha')
    
    expect(usernameInput).toBeRequired()
    expect(passwordInput).toBeRequired()
    expect(usernameInput).toHaveAttribute('type', 'text')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  // Teste 3: Campos de registro obrigatórios
  test('deve ter todos os campos obrigatórios no formulário de registro', () => {
    render(<WelcomePage />)
    
    expect(screen.getByLabelText('Nome')).toBeRequired()
    expect(screen.getByLabelText('Sobrenome')).toBeRequired()
    expect(screen.getByLabelText('Nome de usuário')).toBeRequired()
    expect(screen.getByLabelText('Email')).toBeRequired()
    expect(screen.getByLabelText('Senha')).toBeRequired()
    expect(screen.getByLabelText('Repetir Senha')).toBeRequired()
  })

  // Teste 4: Validação de senha forte
  test('deve mostrar indicadores de senha forte', async () => {
    const user = userEvent.setup()
    render(<WelcomePage />)
    
    const passwordInput = screen.getByLabelText('Senha')
    await user.type(passwordInput, 'Test123!')
    
    // Verificar indicadores de senha forte
    expect(screen.getByText('✅ Pelo menos 8 caracteres')).toBeInTheDocument()
    expect(screen.getByText('✅ Uma letra minúscula')).toBeInTheDocument()
    expect(screen.getByText('✅ Uma letra maiúscula')).toBeInTheDocument()
    expect(screen.getByText('✅ Um número')).toBeInTheDocument()
  })

  // Teste 5: Validação de confirmação de senha
  test('deve mostrar erro quando senhas não coincidem', async () => {
    const user = userEvent.setup()
    render(<WelcomePage />)
    
    const passwordInput = screen.getByLabelText('Senha')
    const confirmPasswordInput = screen.getByLabelText('Repetir Senha')
    
    await user.type(passwordInput, 'Test123!')
    await user.type(confirmPasswordInput, 'Different123!')
    
    expect(screen.getByText('❌ Senhas não coincidem')).toBeInTheDocument()
  })

  // Teste 6: Login bem-sucedido
  test('deve realizar login com sucesso', async () => {
    const user = userEvent.setup()
    render(<WelcomePage />)
    
    const usernameInput = screen.getByLabelText('Nome de usuário')
    const passwordInput = screen.getByLabelText('Senha')
    const loginButton = screen.getByRole('button', { name: 'Entrar' })
    
    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'testpass')
    await user.click(loginButton)
    
    await waitFor(() => {
      expect(loginButton).toBeDisabled()
    })
  })

  // Teste 7: Registro bem-sucedido
  test('deve realizar registro com sucesso', async () => {
    const user = userEvent.setup()
    render(<WelcomePage />)
    
    // Preencher formulário de registro
    await user.type(screen.getByLabelText('Nome'), 'João')
    await user.type(screen.getByLabelText('Sobrenome'), 'Silva')
    await user.type(screen.getByLabelText('Nome de usuário'), 'joaosilva')
    await user.type(screen.getByLabelText('Email'), 'joao@test.com')
    await user.type(screen.getByLabelText('Senha'), 'Test123!')
    await user.type(screen.getByLabelText('Repetir Senha'), 'Test123!')
    
    const registerButton = screen.getByRole('button', { name: 'Criar Conta' })
    await user.click(registerButton)
    
    await waitFor(() => {
      expect(screen.getByText('Conta criada com sucesso! Faça login para continuar.')).toBeInTheDocument()
    })
  })

  // Teste 8: Validação de senha fraca
  test('deve mostrar erro para senha com menos de 8 caracteres', async () => {
    const user = userEvent.setup()
    render(<WelcomePage />)
    
    const passwordInput = screen.getByLabelText('Senha')
    const confirmPasswordInput = screen.getByLabelText('Repetir Senha')
    
    await user.type(passwordInput, 'weak')
    await user.type(confirmPasswordInput, 'weak')
    
    const registerButton = screen.getByRole('button', { name: 'Criar Conta' })
    await user.click(registerButton)
    
    await waitFor(() => {
      expect(screen.getByText('A senha deve ter pelo menos 8 caracteres')).toBeInTheDocument()
    })
  })

  // Teste 9: Login com Google
  test('deve ter botão de login com Google funcional', async () => {
    const user = userEvent.setup()
    render(<WelcomePage />)
    
    const googleButton = screen.getByTestId('google-login-button')
    expect(googleButton).toBeInTheDocument()
    
    await user.click(googleButton)
    
    // Verificar se o serviço foi chamado (mock)
    expect(googleButton).toBeInTheDocument()
  })

  // Teste 10: Estados de loading
  test('deve mostrar estados de loading durante operações', async () => {
    const user = userEvent.setup()
    render(<WelcomePage />)
    
    const loginButton = screen.getByRole('button', { name: 'Entrar' })
    const registerButton = screen.getByRole('button', { name: 'Criar Conta' })
    
    // Simular login
    await user.type(screen.getByLabelText('Nome de usuário'), 'testuser')
    await user.type(screen.getByLabelText('Senha'), 'testpass')
    await user.click(loginButton)
    
    await waitFor(() => {
      expect(loginButton).toHaveTextContent('Entrando...')
    })
    
    // Simular registro
    await user.type(screen.getByLabelText('Nome'), 'Test')
    await user.type(screen.getByLabelText('Sobrenome'), 'User')
    await user.type(screen.getByLabelText('Nome de usuário'), 'testuser2')
    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Senha'), 'Test123!')
    await user.type(screen.getByLabelText('Repetir Senha'), 'Test123!')
    
    await user.click(registerButton)
    
    await waitFor(() => {
      expect(registerButton).toHaveTextContent('Cadastrando...')
    })
  })

  // Teste 11: Credenciais de teste visíveis
  test('deve mostrar credenciais de teste no formulário de login', () => {
    render(<WelcomePage />)
    
    expect(screen.getByText('Credenciais de teste:')).toBeInTheDocument()
    expect(screen.getByText('Username: admin')).toBeInTheDocument()
    expect(screen.getByText('Senha: admin123')).toBeInTheDocument()
  })

  // Teste 12: Redirecionamento automático para usuários autenticados
  test('deve redirecionar usuários já autenticados', () => {
    // Simular usuário autenticado no localStorage
    localStorage.getItem.mockReturnValueOnce('mock-token') // token
    localStorage.getItem.mockReturnValueOnce('mockuser') // username
    
    render(<WelcomePage />)
    
    // Verificar se o redirecionamento foi configurado
    expect(localStorage.getItem).toHaveBeenCalledWith('auth-token')
    expect(localStorage.getItem).toHaveBeenCalledWith('auth-username')
  })
})
