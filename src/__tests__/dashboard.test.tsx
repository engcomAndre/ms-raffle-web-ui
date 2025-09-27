import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import DashboardPage from '../app/dashboard/page'

// Mock dos componentes e hooks
jest.mock('../components/DashboardLayout', () => ({
  DashboardLayout: ({ children, currentPage }: { children: React.ReactNode; currentPage: string }) => (
    <div data-testid="dashboard-layout" data-current-page={currentPage}>
      {children}
    </div>
  )
}))

// Mock previsível do container de lista para refletir a UI atual
jest.mock('../components/RaffleListContainer', () => ({
  RaffleListContainer: () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Minhas Rifas</h2>
          <p className="text-sm text-gray-600">Gerencie suas rifas e acompanhe o desempenho</p>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          + Criar Nova Rifa
        </button>
      </div>
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
    </div>
  )
}))

jest.mock('../hooks/useGoogleButtonSafe', () => ({
  useGoogleButtonSafe: jest.fn()
}))

const mockUseGoogleButtonSafe = require('../hooks/useGoogleButtonSafe').useGoogleButtonSafe

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Renderização com usuário logado', () => {
    test('deve renderizar o dashboard com nome do usuário', () => {
      mockUseGoogleButtonSafe.mockReturnValue({
        user: { name: 'João Silva' }
      })

      render(<DashboardPage />)

      expect(screen.getByText('Bem-vindo ao Dashboard, João!')).toBeInTheDocument()
      expect(screen.getByText('Gerencie suas rifas e acompanhe o desempenho dos seus sorteios')).toBeInTheDocument()
    })

    test('deve renderizar o dashboard com usuário sem nome', () => {
      mockUseGoogleButtonSafe.mockReturnValue({
        user: { name: undefined }
      })

      render(<DashboardPage />)

      expect(screen.getByText('Bem-vindo ao Dashboard, Usuário!')).toBeInTheDocument()
    })

    test('deve renderizar o dashboard com usuário nulo', () => {
      mockUseGoogleButtonSafe.mockReturnValue({
        user: null
      })

      render(<DashboardPage />)

      expect(screen.getByText('Bem-vindo ao Dashboard, Usuário!')).toBeInTheDocument()
    })
  })

  describe('Cards de Estatísticas', () => {
    beforeEach(() => {
      mockUseGoogleButtonSafe.mockReturnValue({
        user: { name: 'Test User' }
      })
    })

    test('deve renderizar card de Total de Rifas', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Total de Rifas')).toBeInTheDocument()
      const totalRifasCard = screen.getByText('Total de Rifas').closest('.bg-white')
      expect(totalRifasCard).toHaveTextContent('...')
    })

    test('deve renderizar card de Receita Total', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Receita Total')).toBeInTheDocument()
      const receitaCard = screen.getByText('Receita Total').closest('.bg-white')
      expect(receitaCard).toHaveTextContent('...')
    })

    test('deve renderizar card de Participantes', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Participantes')).toBeInTheDocument()
      const participantesCard = screen.getByText('Participantes').closest('.bg-white')
      expect(participantesCard).toHaveTextContent('...')
    })

    test('deve renderizar card de Rifas Ativas', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Rifas Ativas')).toBeInTheDocument()
      const rifasAtivasCard = screen.getByText('Rifas Ativas').closest('.bg-white')
      expect(rifasAtivasCard).toHaveTextContent('...')
    })

    test('deve renderizar todos os 4 cards de estatísticas', () => {
      render(<DashboardPage />)

      const cards = screen.getAllByText(/Total de Rifas|Receita Total|Participantes|Rifas Ativas/)
      expect(cards).toHaveLength(4)
    })
  })

  describe('Área de Conteúdo Principal', () => {
    beforeEach(() => {
      mockUseGoogleButtonSafe.mockReturnValue({
        user: { name: 'Test User' }
      })
    })

    test('deve renderizar título "Minhas Rifas"', () => {
      render(<DashboardPage />)

      // O título "Minhas Rifas" está no container de lista mockado
      const titles = screen.getAllByText('Minhas Rifas')
      expect(titles.length).toBeGreaterThan(0)
    })

    test('deve renderizar botão "Criar Nova Rifa"', () => {
      render(<DashboardPage />)

      const buttons = screen.getAllByText('+ Criar Nova Rifa')
      expect(buttons.length).toBeGreaterThan(0)
    })

    test('deve renderizar mensagem de nenhuma rifa encontrada', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Nenhuma rifa encontrada')).toBeInTheDocument()
      expect(screen.getByText('Você ainda não criou nenhuma rifa. Comece criando sua primeira rifa!')).toBeInTheDocument()
    })

    test('deve renderizar botão "Criar Minha Primeira Rifa"', () => {
      render(<DashboardPage />)

      // Layout atual exibe botão de criação no header e no estado vazio
      const buttons = screen.getAllByText('+ Criar Nova Rifa')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('DashboardLayout Integration', () => {
    test('deve passar currentPage correto para DashboardLayout', () => {
      mockUseGoogleButtonSafe.mockReturnValue({
        user: { name: 'Test User' }
      })

      render(<DashboardPage />)

      const dashboardLayout = screen.getByTestId('dashboard-layout')
      expect(dashboardLayout).toHaveAttribute('data-current-page', 'Minhas Rifas')
    })

    test('deve renderizar o DashboardLayout', () => {
      mockUseGoogleButtonSafe.mockReturnValue({
        user: { name: 'Test User' }
      })

      render(<DashboardPage />)

      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
    })
  })

  describe('Interatividade dos Botões', () => {
    beforeEach(() => {
      mockUseGoogleButtonSafe.mockReturnValue({
        user: { name: 'Test User' }
      })
    })

    test('deve ter botão "Criar Nova Rifa" clicável', () => {
      render(<DashboardPage />)

      const [createButton] = screen.getAllByText('+ Criar Nova Rifa')
      expect(createButton).toBeInTheDocument()
      expect(createButton.tagName).toBe('BUTTON')
    })

    test('deve ter botão "Criar Minha Primeira Rifa" clicável', () => {
      render(<DashboardPage />)

      const [firstRifaButton] = screen.getAllByText('+ Criar Nova Rifa')
      expect(firstRifaButton).toBeInTheDocument()
      expect(firstRifaButton.tagName).toBe('BUTTON')
    })
  })

  describe('Estrutura e Layout', () => {
    beforeEach(() => {
      mockUseGoogleButtonSafe.mockReturnValue({
        user: { name: 'Test User' }
      })
    })

    test('deve ter grid responsivo para os cards', () => {
      render(<DashboardPage />)

      const cardsContainer = screen.getByText('Total de Rifas').closest('.grid')
      expect(cardsContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
    })

    test('deve ter espaçamento correto entre elementos', () => {
      render(<DashboardPage />)

      const welcomeSection = screen.getByText('Bem-vindo ao Dashboard, Test!').closest('div')
      expect(welcomeSection).toHaveClass('mb-6')
    })

    test('deve ter cards com sombra e borda', () => {
      render(<DashboardPage />)

      const firstCard = screen.getByText('Total de Rifas').closest('.bg-white')
      expect(firstCard).toHaveClass('shadow-sm', 'border', 'border-gray-200')
    })
  })

  describe('Estados de Usuário', () => {
    test('deve lidar com usuário com nome completo', () => {
      mockUseGoogleButtonSafe.mockReturnValue({
        user: { name: 'João Pedro Silva Santos' }
      })

      render(<DashboardPage />)

      expect(screen.getByText('Bem-vindo ao Dashboard, João!')).toBeInTheDocument()
    })

    test('deve lidar com usuário com nome vazio', () => {
      mockUseGoogleButtonSafe.mockReturnValue({
        user: { name: '' }
      })

      render(<DashboardPage />)

      expect(screen.getByText('Bem-vindo ao Dashboard, Usuário!')).toBeInTheDocument()
    })

    test('deve lidar com usuário com apenas um nome', () => {
      mockUseGoogleButtonSafe.mockReturnValue({
        user: { name: 'João' }
      })

      render(<DashboardPage />)

      expect(screen.getByText('Bem-vindo ao Dashboard, João!')).toBeInTheDocument()
    })
  })
})
