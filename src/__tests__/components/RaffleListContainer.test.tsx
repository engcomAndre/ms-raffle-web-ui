import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RaffleListContainer } from '@/components/RaffleListContainer'

// Mock dos componentes filhos
jest.mock('../../components/RaffleListControls', () => {
  return {
    RaffleListControls: ({ 
      totalRaffles, 
      itemsPerPage, 
      currentPage, 
      totalPages, 
      searchTerm, 
      statusFilter,
      onItemsPerPageChange, 
      onPageChange, 
      onSearchChange, 
      onStatusFilterChange, 
      onClearFilters,
      isLoading 
    }: any) => (
      <div data-testid="raffle-list-controls">
        <span>Total: {totalRaffles}</span>
        <span>ItemsPerPage: {itemsPerPage}</span>
        <span>CurrentPage: {currentPage}</span>
        <span>TotalPages: {totalPages}</span>
        <span>Search: {searchTerm}</span>
        <span>Status: {statusFilter}</span>
        <span>Loading: {isLoading.toString()}</span>
        <button onClick={() => onItemsPerPageChange(20)}>Change Items Per Page</button>
        <button onClick={() => onPageChange(1)}>Change Page</button>
        <button onClick={() => onSearchChange('test')}>Change Search</button>
        <button onClick={() => onStatusFilterChange('active')}>Change Status</button>
        <button onClick={onClearFilters}>Clear Filters</button>
      </div>
    )
  }
})

jest.mock('../../components/RaffleList', () => {
  return {
    RaffleList: ({ currentPage, pageSize, searchTerm, statusFilter, onRefresh, onDataChange }: any) => (
      <div data-testid="raffle-list">
        <span>CurrentPage: {currentPage}</span>
        <span>PageSize: {pageSize}</span>
        <span>Search: {searchTerm}</span>
        <span>Status: {statusFilter}</span>
        <button onClick={() => onRefresh()}>Refresh</button>
        <button onClick={() => onDataChange(50, 5)}>Simulate Data Change</button>
      </div>
    )
  }
})

describe('RaffleListContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Renderização', () => {
    it('deve renderizar container principal com estilos corretos', () => {
      render(<RaffleListContainer />)
      
      const container = screen.getByTestId('raffle-list-controls').closest('.bg-gray-50')
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass(
        'bg-gray-50', 
        'rounded-lg', 
        'shadow-lg', 
        'border', 
        'border-gray-200', 
        'p-6', 
        'space-y-4'
      )
    })

    it('deve renderizar RaffleListControls', () => {
      render(<RaffleListContainer />)
      
      expect(screen.getByTestId('raffle-list-controls')).toBeInTheDocument()
    })

    it('deve renderizar RaffleList dentro de container com estilos', () => {
      render(<RaffleListContainer />)
      
      const raffleListContainer = screen.getByTestId('raffle-list').closest('.bg-white')
      expect(raffleListContainer).toBeInTheDocument()
      expect(raffleListContainer).toHaveClass(
        'bg-white', 
        'rounded-lg', 
        'border', 
        'border-gray-200', 
        'shadow-sm', 
        'overflow-hidden'
      )
    })

    it('deve aplicar className personalizada quando fornecida', () => {
      render(<RaffleListContainer className="custom-class" />)
      
      const container = screen.getByTestId('raffle-list-controls').closest('.custom-class')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Estados Iniciais', () => {
    it('deve inicializar com valores padrão corretos', () => {
      render(<RaffleListContainer />)
      
      const controls = screen.getByTestId('raffle-list-controls')
      expect(controls).toHaveTextContent('Total: 0')
      expect(controls).toHaveTextContent('ItemsPerPage: 10')
      expect(controls).toHaveTextContent('CurrentPage: 0')
      expect(controls).toHaveTextContent('TotalPages: 0')
      expect(controls).toHaveTextContent('Search: ')
      expect(controls).toHaveTextContent('Status: all')
      expect(controls).toHaveTextContent('Loading: true')
    })

    it('deve passar estados iniciais para RaffleList', () => {
      render(<RaffleListContainer />)
      
      const raffleList = screen.getByTestId('raffle-list')
      expect(raffleList).toHaveTextContent('CurrentPage: 0')
      expect(raffleList).toHaveTextContent('PageSize: 10')
      expect(raffleList).toHaveTextContent('Search: ')
      expect(raffleList).toHaveTextContent('Status: all')
    })
  })

  describe('Gerenciamento de Estados', () => {
    it('deve atualizar itemsPerPage e resetar currentPage', async () => {
      const user = userEvent.setup()
      render(<RaffleListContainer />)
      
      const changeItemsButton = screen.getByText('Change Items Per Page')
      await user.click(changeItemsButton)
      
      await waitFor(() => {
        const controls = screen.getByTestId('raffle-list-controls')
        expect(controls).toHaveTextContent('ItemsPerPage: 20')
        expect(controls).toHaveTextContent('CurrentPage: 0') // Deve resetar para 0
      })
    })

    it('deve atualizar currentPage', async () => {
      const user = userEvent.setup()
      render(<RaffleListContainer />)
      
      const changePageButton = screen.getByText('Change Page')
      await user.click(changePageButton)
      
      await waitFor(() => {
        const controls = screen.getByTestId('raffle-list-controls')
        expect(controls).toHaveTextContent('CurrentPage: 1')
      })
    })

    it('deve atualizar searchTerm e resetar currentPage', async () => {
      const user = userEvent.setup()
      render(<RaffleListContainer />)
      
      // Primeiro muda a página para testar o reset
      const changePageButton = screen.getByText('Change Page')
      await user.click(changePageButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('raffle-list-controls')).toHaveTextContent('CurrentPage: 1')
      })
      
      // Então muda a busca
      const changeSearchButton = screen.getByText('Change Search')
      await user.click(changeSearchButton)
      
      await waitFor(() => {
        const controls = screen.getByTestId('raffle-list-controls')
        expect(controls).toHaveTextContent('Search: test')
        expect(controls).toHaveTextContent('CurrentPage: 0') // Deve resetar para 0
      })
    })

    it('deve atualizar statusFilter e resetar currentPage', async () => {
      const user = userEvent.setup()
      render(<RaffleListContainer />)
      
      // Primeiro muda a página para testar o reset
      const changePageButton = screen.getByText('Change Page')
      await user.click(changePageButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('raffle-list-controls')).toHaveTextContent('CurrentPage: 1')
      })
      
      // Então muda o status
      const changeStatusButton = screen.getByText('Change Status')
      await user.click(changeStatusButton)
      
      await waitFor(() => {
        const controls = screen.getByTestId('raffle-list-controls')
        expect(controls).toHaveTextContent('Status: active')
        expect(controls).toHaveTextContent('CurrentPage: 0') // Deve resetar para 0
      })
    })

    it('deve limpar filtros e resetar currentPage', async () => {
      const user = userEvent.setup()
      render(<RaffleListContainer />)
      
      // Primeiro define alguns filtros
      await user.click(screen.getByText('Change Search'))
      await user.click(screen.getByText('Change Status'))
      await user.click(screen.getByText('Change Page'))
      
      await waitFor(() => {
        const controls = screen.getByTestId('raffle-list-controls')
        expect(controls).toHaveTextContent('Search: test')
        expect(controls).toHaveTextContent('Status: active')
        expect(controls).toHaveTextContent('CurrentPage: 1')
      })
      
      // Então limpa os filtros
      const clearFiltersButton = screen.getByText('Clear Filters')
      await user.click(clearFiltersButton)
      
      await waitFor(() => {
        const controls = screen.getByTestId('raffle-list-controls')
        expect(controls).toHaveTextContent('Search: ')
        expect(controls).toHaveTextContent('Status: all')
        expect(controls).toHaveTextContent('CurrentPage: 0') // Deve resetar para 0
      })
    })
  })

  describe('Callback onDataChange', () => {
    it('deve atualizar totalRaffles e totalPages via onDataChange', async () => {
      const user = userEvent.setup()
      render(<RaffleListContainer />)
      
      const simulateDataChangeButton = screen.getByText('Simulate Data Change')
      await user.click(simulateDataChangeButton)
      
      await waitFor(() => {
        const controls = screen.getByTestId('raffle-list-controls')
        expect(controls).toHaveTextContent('Total: 50')
        expect(controls).toHaveTextContent('TotalPages: 5')
        expect(controls).toHaveTextContent('Loading: false') // Deve parar o loading
      })
    })

    it('deve manter outros estados ao receber onDataChange', async () => {
      const user = userEvent.setup()
      render(<RaffleListContainer />)
      
      // Define alguns estados
      await user.click(screen.getByText('Change Items Per Page'))
      await user.click(screen.getByText('Change Search'))
      
      await waitFor(() => {
        const controls = screen.getByTestId('raffle-list-controls')
        expect(controls).toHaveTextContent('ItemsPerPage: 20')
        expect(controls).toHaveTextContent('Search: test')
      })
      
      // Simula mudança de dados
      await user.click(screen.getByText('Simulate Data Change'))
      
      await waitFor(() => {
        const controls = screen.getByTestId('raffle-list-controls')
        expect(controls).toHaveTextContent('Total: 50')
        expect(controls).toHaveTextContent('TotalPages: 5')
        expect(controls).toHaveTextContent('ItemsPerPage: 20') // Deve manter
        expect(controls).toHaveTextContent('Search: test') // Deve manter
      })
    })
  })

  describe('Callback onRefresh', () => {
    it('deve executar handleRefresh sem erros', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<RaffleListContainer />)
      
      const refreshButton = screen.getByText('Refresh')
      await user.click(refreshButton)
      
      expect(consoleSpy).toHaveBeenCalledWith('🔄 [RAFFLE-CONTAINER] Refresh solicitado')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Propagação de Props', () => {
    it('deve propagar todas as props necessárias para RaffleListControls', async () => {
      const user = userEvent.setup()
      render(<RaffleListContainer />)
      
      // Simula mudança de dados para ter valores não-zero
      await user.click(screen.getByText('Simulate Data Change'))
      
      await waitFor(() => {
        const controls = screen.getByTestId('raffle-list-controls')
        expect(controls).toHaveTextContent('Total: 50')
        expect(controls).toHaveTextContent('ItemsPerPage: 10')
        expect(controls).toHaveTextContent('CurrentPage: 0')
        expect(controls).toHaveTextContent('TotalPages: 5')
        expect(controls).toHaveTextContent('Search: ')
        expect(controls).toHaveTextContent('Status: all')
        expect(controls).toHaveTextContent('Loading: false')
      })
    })

    it('deve propagar todas as props necessárias para RaffleList', async () => {
      const user = userEvent.setup()
      render(<RaffleListContainer />)
      
      // Define alguns estados
      await user.click(screen.getByText('Change Items Per Page'))
      await user.click(screen.getByText('Change Search'))
      await user.click(screen.getByText('Change Status'))
      
      await waitFor(() => {
        const raffleList = screen.getByTestId('raffle-list')
        expect(raffleList).toHaveTextContent('CurrentPage: 0') // Deve resetar para 0 após filtros
        expect(raffleList).toHaveTextContent('PageSize: 20')
        expect(raffleList).toHaveTextContent('Search: test')
        expect(raffleList).toHaveTextContent('Status: active')
      })
    })
  })

  describe('Layout e Estrutura', () => {
    it('deve ter estrutura de layout correta', () => {
      render(<RaffleListContainer />)
      
      // Container principal
      const mainContainer = screen.getByTestId('raffle-list-controls').closest('.space-y-4')
      expect(mainContainer).toBeInTheDocument()
      
      // Container dos controles
      const controlsContainer = screen.getByTestId('raffle-list-controls')
      expect(controlsContainer).toBeInTheDocument()
      
      // Container da lista
      const listContainer = screen.getByTestId('raffle-list').closest('.bg-white')
      expect(listContainer).toBeInTheDocument()
    })

    it('deve manter espaçamento entre elementos', () => {
      render(<RaffleListContainer />)
      
      const mainContainer = screen.getByTestId('raffle-list-controls').closest('.space-y-4')
      expect(mainContainer).toHaveClass('space-y-4')
    })
  })
})
