import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RaffleList } from '@/components/RaffleList'
import { raffleService } from '@/services/raffleService'

// Mock do raffleService
jest.mock('@/services/raffleService', () => ({
  raffleService: {
    getMyRafflesWithPagination: jest.fn(),
    activeRaffle: jest.fn(),
    inactiveRaffle: jest.fn(),
    deleteRaffle: jest.fn(),
    getRaffleNumbers: jest.fn()
  }
}))

// Mock dos componentes filhos
jest.mock('@/components/RaffleListItem', () => {
  return {
    RaffleListItem: ({ raffle, onEdit, onDelete, onToggleStatus }: any) => (
      <div data-testid={`raffle-item-${raffle.id}`}>
        <span>Title: {raffle.title}</span>
        <span>Active: {raffle.active.toString()}</span>
        <button onClick={() => onEdit(raffle)}>Edit</button>
        <button onClick={() => onDelete(raffle.id)}>Delete</button>
        <button onClick={() => onToggleStatus(raffle.id, !raffle.active)}>Toggle Status</button>
      </div>
    )
  }
})

jest.mock('@/components/RaffleEditModal', () => {
  return {
    RaffleEditModal: ({ isOpen, raffle, onClose, onSuccess }: any) => 
      isOpen ? (
        <div data-testid="edit-modal">
          <span>Editing: {raffle?.title}</span>
          <button onClick={onClose}>Close</button>
          <button onClick={onSuccess}>Save</button>
        </div>
      ) : null
  }
})

const mockRaffleService = raffleService as jest.Mocked<typeof raffleService>

describe('RaffleList', () => {
  const mockRaffles = [
    {
      id: '1',
      title: 'Rifa 1',
      prize: 'Prêmio 1',
      description: 'Descrição 1',
      active: true,
      status: 'ACTIVE' as const,
      maxNumbers: 100,
      files: [],
      startAt: '2024-01-01T00:00:00Z',
      endAt: '2024-12-31T23:59:59Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      soldNumbers: 10,
      createdBy: 'user1',
      numbersCreated: 50
    },
    {
      id: '2',
      title: 'Rifa 2',
      prize: 'Prêmio 2',
      description: 'Descrição 2',
      active: false,
      status: 'INACTIVE' as const,
      maxNumbers: 50,
      files: [],
      startAt: '2024-01-01T00:00:00Z',
      endAt: '2024-12-31T23:59:59Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      soldNumbers: 5,
      createdBy: 'user1',
      numbersCreated: 25
    }
  ]

  const mockProps = {
    currentPage: 0,
    pageSize: 10,
    searchTerm: '',
    statusFilter: 'all' as const,
    onRefresh: jest.fn(),
    onDataChange: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockRaffleService.getMyRafflesWithPagination.mockResolvedValue({
      success: true,
      data: {
        content: mockRaffles,
        totalElements: 2,
        totalPages: 1,
        pageNumber: 0,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
        first: true,
        last: true,
        numberOfElements: 2
      }
    })
  })

  describe('Carregamento de Dados', () => {
    it('deve mostrar loading inicialmente', () => {
      render(<RaffleList {...mockProps} />)
      
      expect(screen.getByText('Carregando rifas...')).toBeInTheDocument()
    })

    it('deve carregar rifas na montagem', async () => {
      render(<RaffleList {...mockProps} />)
      
      await waitFor(() => {
        expect(mockRaffleService.getMyRafflesWithPagination).toHaveBeenCalledWith(0, 100)
      })
    })

    it('deve renderizar rifas após carregamento', async () => {
      render(<RaffleList {...mockProps} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('raffle-item-1')).toBeInTheDocument()
        expect(screen.getByTestId('raffle-item-2')).toBeInTheDocument()
      })
    })

    it('deve chamar onDataChange com dados corretos', async () => {
      render(<RaffleList {...mockProps} />)
      
      await waitFor(() => {
        expect(mockProps.onDataChange).toHaveBeenCalledWith(2, 1) // 2 rifas, 1 página
      })
    })
  })

  describe('Filtros', () => {
    it('deve filtrar por termo de busca no título', async () => {
      render(<RaffleList {...mockProps} searchTerm="Rifa 1" />)
      
      await waitFor(() => {
        expect(screen.getByTestId('raffle-item-1')).toBeInTheDocument()
        expect(screen.queryByTestId('raffle-item-2')).not.toBeInTheDocument()
      })
      
      expect(mockProps.onDataChange).toHaveBeenCalledWith(1, 1) // 1 rifa filtrada, 1 página
    })

    it('deve filtrar por termo de busca no prêmio', async () => {
      render(<RaffleList {...mockProps} searchTerm="Prêmio 2" />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('raffle-item-1')).not.toBeInTheDocument()
        expect(screen.getByTestId('raffle-item-2')).toBeInTheDocument()
      })
    })

    it('deve filtrar por termo de busca na descrição', async () => {
      render(<RaffleList {...mockProps} searchTerm="Descrição 1" />)
      
      await waitFor(() => {
        expect(screen.getByTestId('raffle-item-1')).toBeInTheDocument()
        expect(screen.queryByTestId('raffle-item-2')).not.toBeInTheDocument()
      })
    })

    it('deve filtrar rifas ativas', async () => {
      render(<RaffleList {...mockProps} statusFilter="active" />)
      
      await waitFor(() => {
        expect(screen.getByTestId('raffle-item-1')).toBeInTheDocument()
        expect(screen.queryByTestId('raffle-item-2')).not.toBeInTheDocument()
      })
      
      expect(mockProps.onDataChange).toHaveBeenCalledWith(1, 1) // 1 rifa ativa, 1 página
    })

    it('deve filtrar rifas inativas', async () => {
      render(<RaffleList {...mockProps} statusFilter="inactive" />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('raffle-item-1')).not.toBeInTheDocument()
        expect(screen.getByTestId('raffle-item-2')).toBeInTheDocument()
      })
      
      expect(mockProps.onDataChange).toHaveBeenCalledWith(1, 1) // 1 rifa inativa, 1 página
    })

    it('deve combinar filtros de busca e status', async () => {
      render(<RaffleList {...mockProps} searchTerm="Rifa 2" statusFilter="inactive" />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('raffle-item-1')).not.toBeInTheDocument()
        expect(screen.getByTestId('raffle-item-2')).toBeInTheDocument()
      })
    })

    it('deve mostrar mensagem quando nenhuma rifa for encontrada', async () => {
      render(<RaffleList {...mockProps} searchTerm="não existe" />)
      
      await waitFor(() => {
        expect(screen.getByText('Nenhuma rifa encontrada')).toBeInTheDocument()
        expect(screen.getByText('Tente ajustar os filtros ou criar uma nova rifa.')).toBeInTheDocument()
      })
    })
  })

  describe('Paginação', () => {
    const manyRaffles = Array.from({ length: 25 }, (_, i) => ({
      ...mockRaffles[0],
      id: `${i + 1}`,
      title: `Rifa ${i + 1}`
    }))

    beforeEach(() => {
      mockRaffleService.getMyRafflesWithPagination.mockResolvedValue({
        success: true,
        data: {
          content: manyRaffles,
          totalElements: 25,
          totalPages: 3,
          pageNumber: 0,
          pageSize: 10,
          hasNext: true,
          hasPrevious: false,
          first: true,
          last: false,
          numberOfElements: 25
        }
      })
    })

    it('deve paginar resultados corretamente', async () => {
      render(<RaffleList {...mockProps} pageSize={10} />)
      
      await waitFor(() => {
        // Deve mostrar apenas 10 itens da primeira página
        const items = screen.getAllByTestId(/raffle-item-/)
        expect(items).toHaveLength(10)
      })
      
      expect(mockProps.onDataChange).toHaveBeenCalledWith(25, 3) // 25 rifas, 3 páginas
    })

    it('deve mostrar página específica', async () => {
      render(<RaffleList {...mockProps} currentPage={1} pageSize={10} />)
      
      await waitFor(() => {
        const items = screen.getAllByTestId(/raffle-item-/)
        expect(items).toHaveLength(10)
        // Deve mostrar itens 11-20 (índices 10-19)
        expect(screen.getByTestId('raffle-item-11')).toBeInTheDocument()
        expect(screen.getByTestId('raffle-item-20')).toBeInTheDocument()
      })
    })
  })

  describe('Modal de Edição', () => {
    it('deve abrir modal ao clicar em editar', async () => {
      const user = userEvent.setup()
      render(<RaffleList {...mockProps} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('raffle-item-1')).toBeInTheDocument()
      })
      
      const editButton = screen.getByText('Edit')
      await user.click(editButton)
      
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
      expect(screen.getByText('Editing: Rifa 1')).toBeInTheDocument()
    })

    it('deve fechar modal ao clicar em close', async () => {
      const user = userEvent.setup()
      render(<RaffleList {...mockProps} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('raffle-item-1')).toBeInTheDocument()
      })
      
      // Abrir modal
      await user.click(screen.getByText('Edit'))
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
      
      // Fechar modal
      await user.click(screen.getByText('Close'))
      expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument()
    })

    it('deve chamar onRefresh após sucesso na edição', async () => {
      const user = userEvent.setup()
      render(<RaffleList {...mockProps} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('raffle-item-1')).toBeInTheDocument()
      })
      
      // Abrir modal e salvar
      await user.click(screen.getByText('Edit'))
      await user.click(screen.getByText('Save'))
      
      expect(mockProps.onRefresh).toHaveBeenCalled()
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve mostrar mensagem de erro quando falha ao carregar', async () => {
      mockRaffleService.getMyRafflesWithPagination.mockResolvedValue({
        success: false,
        error: 'Erro de conexão'
      })
      
      render(<RaffleList {...mockProps} />)
      
      await waitFor(() => {
        expect(screen.getByText('Erro ao carregar rifas')).toBeInTheDocument()
        expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
      })
    })

    it('deve tentar carregar novamente ao clicar em "Tentar novamente"', async () => {
      const user = userEvent.setup()
      
      // Primeiro falha
      mockRaffleService.getMyRafflesWithPagination.mockResolvedValueOnce({
        success: false,
        error: 'Erro de conexão'
      })
      
      // Depois sucesso
      mockRaffleService.getMyRafflesWithPagination.mockResolvedValueOnce({
        success: true,
        data: {
          content: mockRaffles,
          totalElements: 2,
          totalPages: 1,
          pageNumber: 0,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
          first: true,
          last: true,
          numberOfElements: 2
        }
      })
      
      render(<RaffleList {...mockProps} />)
      
      await waitFor(() => {
        expect(screen.getByText('Erro ao carregar rifas')).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('Tentar novamente'))
      
      await waitFor(() => {
        expect(screen.getByTestId('raffle-item-1')).toBeInTheDocument()
      })
      
      expect(mockRaffleService.getMyRafflesWithPagination).toHaveBeenCalledTimes(2)
    })
  })

  describe('Estados Vazios', () => {
    beforeEach(() => {
      mockRaffleService.getMyRafflesWithPagination.mockResolvedValue({
        success: true,
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          pageNumber: 0,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
          first: true,
          last: true,
          numberOfElements: 0
        }
      })
    })

    it('deve mostrar mensagem quando não há rifas', async () => {
      render(<RaffleList {...mockProps} />)
      
      await waitFor(() => {
        expect(screen.getByText('Nenhuma rifa encontrada')).toBeInTheDocument()
        expect(screen.getByText('Você ainda não criou nenhuma rifa.')).toBeInTheDocument()
      })
    })

    it('deve mostrar mensagem específica para filtros quando não há resultados', async () => {
      // Simula que há rifas, mas nenhuma passa no filtro
      mockRaffleService.getMyRafflesWithPagination.mockResolvedValue({
        success: true,
        data: {
          content: mockRaffles,
          totalElements: 2,
          totalPages: 1,
          pageNumber: 0,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
          first: true,
          last: true,
          numberOfElements: 2
        }
      })
      
      render(<RaffleList {...mockProps} searchTerm="não existe" />)
      
      await waitFor(() => {
        expect(screen.getByText('Nenhuma rifa encontrada')).toBeInTheDocument()
        expect(screen.getByText('Tente ajustar os filtros ou criar uma nova rifa.')).toBeInTheDocument()
      })
    })
  })
})
