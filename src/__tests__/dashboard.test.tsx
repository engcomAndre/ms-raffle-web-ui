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
      expect(totalRifasCard).toHaveTextContent('0')
    })

    test('deve renderizar card de Receita Total', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Receita Total')).toBeInTheDocument()
      expect(screen.getByText('R$ 0,00')).toBeInTheDocument()
    })

    test('deve renderizar card de Participantes', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Participantes')).toBeInTheDocument()
      const participantesCard = screen.getByText('Participantes').closest('.bg-white')
      expect(participantesCard).toHaveTextContent('0')
    })

    test('deve renderizar card de Rifas Ativas', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Rifas Ativas')).toBeInTheDocument()
      const rifasAtivasCard = screen.getByText('Rifas Ativas').closest('.bg-white')
      expect(rifasAtivasCard).toHaveTextContent('0')
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

      expect(screen.getByText('Minhas Rifas')).toBeInTheDocument()
    })

    test('deve renderizar botão "Criar Nova Rifa"', () => {
      render(<DashboardPage />)

      expect(screen.getByText('+ Criar Nova Rifa')).toBeInTheDocument()
    })

    test('deve renderizar mensagem de nenhuma rifa encontrada', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Nenhuma rifa encontrada')).toBeInTheDocument()
      expect(screen.getByText('Você ainda não criou nenhuma rifa. Comece criando sua primeira rifa e começe a receber participações!')).toBeInTheDocument()
    })

    test('deve renderizar botão "Criar Minha Primeira Rifa"', () => {
      render(<DashboardPage />)

      expect(screen.getByText('🎯 Criar Minha Primeira Rifa')).toBeInTheDocument()
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

      const createButton = screen.getByText('+ Criar Nova Rifa')
      expect(createButton).toBeInTheDocument()
      expect(createButton.tagName).toBe('BUTTON')
    })

    test('deve ter botão "Criar Minha Primeira Rifa" clicável', () => {
      render(<DashboardPage />)

      const firstRifaButton = screen.getByText('🎯 Criar Minha Primeira Rifa')
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
