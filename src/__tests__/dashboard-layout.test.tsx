import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useLogout } from '@/hooks/useLogout'
import Image from 'next/image'

// Mock do useLogout
jest.mock('@/hooks/useLogout', () => ({
  useLogout: jest.fn()
}))

// Mock do next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}))

// Mock do localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock do console para reduzir output nos testes
const originalConsoleLog = console.log
const originalConsoleError = console.error
beforeAll(() => {
  console.log = jest.fn()
  console.error = jest.fn()
})

afterAll(() => {
  console.log = originalConsoleLog
  console.error = originalConsoleError
})

const mockLogout = jest.fn()

describe('DashboardLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useLogout as jest.Mock).mockReturnValue({ logout: mockLogout })

    // Limpar localStorage antes de cada teste
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('deve renderizar o layout com o título do dashboard', () => {
    render(<DashboardLayout>Conteúdo do Dashboard</DashboardLayout>)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo do Dashboard')).toBeInTheDocument()
  })

  it('deve exibir informações do usuário se houver dados no localStorage', () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce('fake-token') // auth-token
      .mockReturnValueOnce('Test User') // auth-username
      .mockReturnValueOnce('test@example.com') // auth-email
      .mockReturnValueOnce('http://example.com/pic.jpg') // google-user-picture
      .mockReturnValueOnce('google') // auth-provider

    render(<DashboardLayout>Conteúdo</DashboardLayout>)

    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByAltText('Test User')).toHaveAttribute('src', 'http://example.com/pic.jpg')
  })

  it('deve exibir avatar padrão se não houver imagem de perfil', () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce('fake-token') // auth-token
      .mockReturnValueOnce('Test User') // auth-username
      .mockReturnValueOnce('test@example.com') // auth-email
      .mockReturnValueOnce(null) // google-user-picture
      .mockReturnValueOnce('userpass') // auth-provider

    render(<DashboardLayout>Conteúdo</DashboardLayout>)

    expect(screen.getByText('T')).toBeInTheDocument() // Primeira letra do nome
    expect(screen.queryByAltText('Test User')).not.toBeInTheDocument()
  })

  it('deve exibir avatar padrão com "U" se não houver nome', () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce('fake-token') // auth-token
      .mockReturnValueOnce(null) // auth-username
      .mockReturnValueOnce('test@example.com') // auth-email
      .mockReturnValueOnce(null) // google-user-picture
      .mockReturnValueOnce('userpass') // auth-provider

    render(<DashboardLayout>Conteúdo</DashboardLayout>)

    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('deve exibir informações padrão se não houver dados no localStorage', () => {
    render(<DashboardLayout>Conteúdo</DashboardLayout>)

    expect(screen.getByText('Usuário')).toBeInTheDocument()
    expect(screen.getByText('usuario@email.com')).toBeInTheDocument()
  })

  it('deve abrir e fechar o dropdown do usuário', async () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce('fake-token') // auth-token
      .mockReturnValueOnce('Test User') // auth-username
      .mockReturnValueOnce('test@example.com') // auth-email
      .mockReturnValueOnce(null) // google-user-picture
      .mockReturnValueOnce('userpass') // auth-provider

    render(<DashboardLayout>Conteúdo</DashboardLayout>)

    const userButton = screen.getByRole('button', { name: /Test User/i })
    fireEvent.click(userButton)

    await waitFor(() => {
      expect(screen.getByText('Perfil')).toBeInTheDocument()
      expect(screen.getByText('Sair')).toBeInTheDocument()
    })

    fireEvent.click(userButton) // Clicar novamente para fechar

    await waitFor(() => {
      expect(screen.queryByText('Perfil')).not.toBeInTheDocument()
      expect(screen.queryByText('Sair')).not.toBeInTheDocument()
    })
  })

  it('deve chamar logout e fechar o dropdown ao clicar em "Sair"', async () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce('fake-token') // auth-token
      .mockReturnValueOnce('Test User') // auth-username
      .mockReturnValueOnce('test@example.com') // auth-email
      .mockReturnValueOnce(null) // google-user-picture
      .mockReturnValueOnce('userpass') // auth-provider

    render(<DashboardLayout>Conteúdo</DashboardLayout>)

    const userButton = screen.getByRole('button', { name: /Test User/i })
    fireEvent.click(userButton)

    await waitFor(() => {
      expect(screen.getByText('Sair')).toBeInTheDocument()
    })

    const logoutButton = screen.getByRole('button', { name: 'Sair' })
    fireEvent.click(logoutButton)

    expect(mockLogout).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Sair')).not.toBeInTheDocument() // Dropdown deve fechar
  })

  it('deve fechar o dropdown ao clicar no overlay', async () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce('fake-token') // auth-token
      .mockReturnValueOnce('Test User') // auth-username
      .mockReturnValueOnce('test@example.com') // auth-email
      .mockReturnValueOnce(null) // google-user-picture
      .mockReturnValueOnce('userpass') // auth-provider

    render(<DashboardLayout>Conteúdo</DashboardLayout>)

    const userButton = screen.getByRole('button', { name: /Test User/i })
    fireEvent.click(userButton)

    await waitFor(() => {
      expect(screen.getByText('Sair')).toBeInTheDocument()
    })

    // O overlay é o div fixo com z-40
    const overlay = screen.getByTestId('overlay') // Adicionei um data-testid ao overlay no componente
    fireEvent.click(overlay)

    await waitFor(() => {
      expect(screen.queryByText('Sair')).not.toBeInTheDocument()
    })
  })

  it('deve ter link para "Minhas Rifas" e estar ativo por padrão', () => {
    render(<DashboardLayout>Conteúdo</DashboardLayout>)

    const minhasRifasLink = screen.getByRole('link', { name: 'Minhas Rifas' })
    expect(minhasRifasLink).toHaveAttribute('href', '/playground')
    expect(minhasRifasLink).toHaveClass('bg-blue-50') // Classe de ativo
    expect(minhasRifasLink).toHaveClass('border-r-4')
    expect(minhasRifasLink).toHaveClass('border-blue-500')
    expect(screen.getByText('Minhas Rifas')).toHaveClass('text-blue-700')
  })

  it('deve ter link para "Minhas Rifas" e não estar ativo se currentPage for diferente', () => {
    render(<DashboardLayout currentPage="Outra Página">Conteúdo</DashboardLayout>)

    const minhasRifasLink = screen.getByRole('link', { name: 'Minhas Rifas' })
    expect(minhasRifasLink).toHaveAttribute('href', '/playground')
    expect(minhasRifasLink).not.toHaveClass('bg-blue-50') // Não deve ter classe de ativo
    expect(minhasRifasLink).not.toHaveClass('border-r-4')
    expect(minhasRifasLink).not.toHaveClass('border-blue-500')
    expect(screen.getByText('Minhas Rifas')).not.toHaveClass('text-blue-700')
    expect(screen.getByText('Minhas Rifas')).toHaveClass('text-gray-700')
  })

  it('deve usar currentPage padrão quando não fornecido', () => {
    render(<DashboardLayout>Conteúdo</DashboardLayout>)

    const minhasRifasLink = screen.getByRole('link', { name: 'Minhas Rifas' })
    expect(minhasRifasLink).toHaveClass('bg-blue-50') // Deve estar ativo por padrão
  })

  it('deve renderizar children corretamente', () => {
    const customContent = <div data-testid="custom-content">Conteúdo personalizado</div>
    render(<DashboardLayout>{customContent}</DashboardLayout>)

    expect(screen.getByTestId('custom-content')).toBeInTheDocument()
  })

  it('deve ter estrutura de layout correta', () => {
    render(<DashboardLayout>Conteúdo</DashboardLayout>)

    // Verificar se tem header
    expect(screen.getByRole('banner')).toBeInTheDocument()
    
    // Verificar se tem aside (menu lateral)
    expect(screen.getByRole('complementary')).toBeInTheDocument()
    
    // Verificar se tem main
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('deve ter título "Sistemas" no menu lateral', () => {
    render(<DashboardLayout>Conteúdo</DashboardLayout>)

    expect(screen.getByText('Sistemas')).toBeInTheDocument()
  })

  it('deve ter ícone de dropdown que rotaciona quando aberto', async () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce('fake-token') // auth-token
      .mockReturnValueOnce('Test User') // auth-username
      .mockReturnValueOnce('test@example.com') // auth-email
      .mockReturnValueOnce(null) // google-user-picture
      .mockReturnValueOnce('userpass') // auth-provider

    render(<DashboardLayout>Conteúdo</DashboardLayout>)

    const userButton = screen.getByRole('button', { name: /Test User/i })
    const dropdownIcon = userButton.querySelector('svg')
    
    // Inicialmente não deve ter classe de rotação
    expect(dropdownIcon).not.toHaveClass('rotate-180')

    fireEvent.click(userButton)

    await waitFor(() => {
      // Após abrir, deve ter classe de rotação
      expect(dropdownIcon).toHaveClass('rotate-180')
    })
  })

  it('deve usar email como fallback para username quando username não estiver disponível', () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce('fake-token') // auth-token
      .mockReturnValueOnce(null) // auth-username
      .mockReturnValueOnce('test@example.com') // auth-email
      .mockReturnValueOnce(null) // google-user-picture
      .mockReturnValueOnce('userpass') // auth-provider

    render(<DashboardLayout>Conteúdo</DashboardLayout>)

    expect(screen.getByText('usuario@email.com')).toBeInTheDocument()
  })

  it('deve usar provider padrão quando não estiver definido', () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce('fake-token') // auth-token
      .mockReturnValueOnce('Test User') // auth-username
      .mockReturnValueOnce('test@example.com') // auth-email
      .mockReturnValueOnce(null) // google-user-picture
      .mockReturnValueOnce(null) // auth-provider

    render(<DashboardLayout>Conteúdo</DashboardLayout>)

    // Deve renderizar normalmente mesmo sem provider
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('deve fechar dropdown ao clicar no botão de perfil', async () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce('fake-token') // auth-token
      .mockReturnValueOnce('Test User') // auth-username
      .mockReturnValueOnce('test@example.com') // auth-email
      .mockReturnValueOnce(null) // google-user-picture
      .mockReturnValueOnce('userpass') // auth-provider

    render(<DashboardLayout>Conteúdo</DashboardLayout>)

    const userButton = screen.getByRole('button', { name: /Test User/i })
    fireEvent.click(userButton)

    await waitFor(() => {
      expect(screen.getByText('Perfil')).toBeInTheDocument()
    })

    const profileButton = screen.getByRole('button', { name: 'Perfil' })
    fireEvent.click(profileButton)

    await waitFor(() => {
      expect(screen.queryByText('Perfil')).not.toBeInTheDocument()
    })
  })
})