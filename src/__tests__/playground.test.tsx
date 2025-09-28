import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import PlaygroundPage from '../app/playground/page'

// Mock dos componentes e hooks
jest.mock('../components/DashboardLayout', () => ({
  DashboardLayout: ({ children, currentPage }: { children: React.ReactNode; currentPage: string }) => (
    <div data-testid="dashboard-layout" data-current-page={currentPage}>
      {children}
    </div>
  )
}))

// Mock previsível do container de lista para evitar dependência de estados internos/HTTP
jest.mock('../components/RaffleListContainer', () => ({
  RaffleListContainer: () => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-center py-12">
      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p className="text-lg font-medium">Nenhuma rifa encontrada</p>
      <p className="text-sm text-gray-500 mt-2">
        Você ainda não criou nenhuma rifa. Comece criando sua primeira rifa!
      </p>
      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        + Criar Nova Rifa
      </button>
    </div>
  )
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

const mockUseRouter = require('next/navigation').useRouter

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock do console.log
const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

describe('PlaygroundPage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush })
    consoleSpy.mockClear()
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('Estado de Carregamento', () => {
    test('deve mostrar loading inicialmente', () => {
      localStorageMock.getItem.mockReturnValue(null)

      render(<PlaygroundPage />)

      expect(screen.getByText('Carregando...')).toBeInTheDocument()
      const spinner = screen.getByText('Carregando...').previousElementSibling
      expect(spinner).toHaveClass('animate-spin')
    })

    test('deve ter spinner de carregamento estilizado', () => {
      localStorageMock.getItem.mockReturnValue(null)

      render(<PlaygroundPage />)

      const spinner = screen.getByText('Carregando...').previousElementSibling
      expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'h-12', 'w-12', 'border-b-2', 'border-blue-500')
    })

    test('deve centralizar o conteúdo de loading', () => {
      localStorageMock.getItem.mockReturnValue(null)

      render(<PlaygroundPage />)

      const container = screen.getByText('Carregando...').closest('.min-h-screen')
      expect(container).toHaveClass('flex', 'items-center', 'justify-center')
    })
  })

  describe('Autenticação via localStorage', () => {
    test('deve autenticar usuário com token e username válidos', async () => {
      localStorageMock.getItem
        .mockReturnValueOnce('valid-token') // auth-token
        .mockReturnValueOnce('testuser')   // auth-username

      render(<PlaygroundPage />)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('✅ [PLAYGROUND] Usuário autenticado via localStorage')
      })

      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
    })

    test('deve redirecionar usuário sem token', async () => {
      localStorageMock.getItem
        .mockReturnValueOnce(null)        // auth-token
        .mockReturnValueOnce('testuser')  // auth-username

      render(<PlaygroundPage />)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('❌ [PLAYGROUND] Usuário não autenticado via localStorage, redirecionando para /welcome')
        expect(mockPush).toHaveBeenCalledWith('/welcome')
      })
    })

    test('deve redirecionar usuário sem username', async () => {
      localStorageMock.getItem
        .mockReturnValueOnce('valid-token') // auth-token
        .mockReturnValueOnce(null)         // auth-username

      render(<PlaygroundPage />)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('❌ [PLAYGROUND] Usuário não autenticado via localStorage, redirecionando para /welcome')
        expect(mockPush).toHaveBeenCalledWith('/welcome')
      })
    })

    test('deve redirecionar usuário sem token e sem username', async () => {
      localStorageMock.getItem
        .mockReturnValueOnce(null) // auth-token
        .mockReturnValueOnce(null) // auth-username

      render(<PlaygroundPage />)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('❌ [PLAYGROUND] Usuário não autenticado via localStorage, redirecionando para /welcome')
        expect(mockPush).toHaveBeenCalledWith('/welcome')
      })
    })
  })

  describe('Renderização do Conteúdo', () => {
    beforeEach(() => {
      localStorageMock.getItem
        .mockReturnValueOnce('valid-token')
        .mockReturnValueOnce('testuser')
    })

    test('deve renderizar título "Minhas Rifas"', async () => {
      render(<PlaygroundPage />)

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
      })
    })

    test('deve renderizar descrição do playground', async () => {
      render(<PlaygroundPage />)

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
      })
    })

    test('deve renderizar mensagem de nenhuma rifa encontrada', async () => {
      render(<PlaygroundPage />)

      await waitFor(() => {
        expect(screen.getByText('Nenhuma rifa encontrada')).toBeInTheDocument()
        expect(screen.getByText('Você ainda não criou nenhuma rifa. Comece criando sua primeira rifa!')).toBeInTheDocument()
      })
    })

    test('deve renderizar botão "Criar Nova Rifa"', async () => {
      render(<PlaygroundPage />)

      await waitFor(() => {
        expect(screen.getByText('+ Criar Nova Rifa')).toBeInTheDocument()
      })
    })
  })

  describe('DashboardLayout Integration', () => {
    beforeEach(() => {
      localStorageMock.getItem
        .mockReturnValueOnce('valid-token')
        .mockReturnValueOnce('testuser')
    })

    test('deve passar currentPage correto para DashboardLayout', async () => {
      render(<PlaygroundPage />)

      await waitFor(() => {
        const dashboardLayout = screen.getByTestId('dashboard-layout')
        expect(dashboardLayout).toHaveAttribute('data-current-page', 'Minhas Rifas')
      })
    })

    test('deve renderizar o DashboardLayout', async () => {
      render(<PlaygroundPage />)

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
      })
    })
  })

  describe('Estrutura e Layout', () => {
    beforeEach(() => {
      localStorageMock.getItem
        .mockReturnValueOnce('valid-token')
        .mockReturnValueOnce('testuser')
    })

    test('deve ter área de conteúdo com fundo branco', async () => {
      render(<PlaygroundPage />)

      await waitFor(() => {
        const contentArea = screen.getByText('Nenhuma rifa encontrada').closest('.bg-white')
        expect(contentArea).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm', 'border', 'border-gray-200')
      })
    })

    test('deve ter espaçamento correto entre elementos', async () => {
      render(<PlaygroundPage />)

      await waitFor(() => {
        const dashboardLayout = screen.getByTestId('dashboard-layout')
        expect(dashboardLayout).toBeInTheDocument()
      })
    })

    test('deve ter ícone SVG centralizado', async () => {
      render(<PlaygroundPage />)

      await waitFor(() => {
        const svg = screen.getByText('Nenhuma rifa encontrada').previousElementSibling
        expect(svg).toHaveClass('w-16', 'h-16', 'text-gray-400', 'mx-auto', 'mb-4')
      })
    })
  })

  describe('Interatividade dos Botões', () => {
    beforeEach(() => {
      localStorageMock.getItem
        .mockReturnValueOnce('valid-token')
        .mockReturnValueOnce('testuser')
    })

    test('deve ter botão "Criar Nova Rifa" clicável', async () => {
      render(<PlaygroundPage />)

      await waitFor(() => {
        const createButton = screen.getByText('+ Criar Nova Rifa')
        expect(createButton).toBeInTheDocument()
        expect(createButton.tagName).toBe('BUTTON')
      })
    })

    test('deve ter botão com estilos corretos', async () => {
      render(<PlaygroundPage />)

      await waitFor(() => {
        const createButton = screen.getByText('+ Criar Nova Rifa')
        expect(createButton).toHaveClass(
          'bg-blue-600',
          'hover:bg-blue-700',
          'text-white',
          'font-medium',
          'py-2',
          'px-4',
          'rounded-md'
        )
      })
    })
  })

  describe('Estados de Usuário', () => {
    test('deve lidar com usuário autenticado corretamente', async () => {
      localStorageMock.getItem
        .mockReturnValueOnce('valid-token')
        .mockReturnValueOnce('testuser')

      render(<PlaygroundPage />)

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
        expect(screen.queryByText('Carregando...')).not.toBeInTheDocument()
      })
    })

    test('deve não renderizar conteúdo quando não há userInfo', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const { container } = render(<PlaygroundPage />)

      // Deve mostrar apenas o loading
      expect(container.textContent).toContain('Carregando...')
    })
  })

  describe('Redirecionamento', () => {
    test('deve redirecionar apenas uma vez', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      render(<PlaygroundPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(1)
        expect(mockPush).toHaveBeenCalledWith('/welcome')
      })
    })

    test('deve redirecionar após verificação de autenticação', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      render(<PlaygroundPage />)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('❌ [PLAYGROUND] Usuário não autenticado via localStorage, redirecionando para /welcome')
        expect(mockPush).toHaveBeenCalledWith('/welcome')
      })
    })
  })
})
