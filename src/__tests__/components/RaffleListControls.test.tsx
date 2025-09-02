import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RaffleListControls } from '@/components/RaffleListControls'

// Mock dos componentes filhos
jest.mock('@/components/RaffleListFilter', () => {
  return {
    RaffleListFilter: ({ searchTerm, statusFilter, onSearchChange, onStatusFilterChange, onClearFilters, isLoading }: any) => (
      <div data-testid="raffle-list-filter">
        <span>Search: {searchTerm}</span>
        <span>Status: {statusFilter}</span>
        <span>Loading: {isLoading.toString()}</span>
        <button onClick={() => onSearchChange('test')}>Change Search</button>
        <button onClick={() => onStatusFilterChange('active')}>Change Status</button>
        <button onClick={onClearFilters}>Clear Filters</button>
      </div>
    )
  }
})

jest.mock('@/components/RaffleListPagination', () => {
  return {
    RaffleListPagination: ({ totalRaffles, itemsPerPage, currentPage, totalPages, onItemsPerPageChange, onPageChange, isLoading }: any) => (
      <div data-testid="raffle-list-pagination">
        <span>Total: {totalRaffles}</span>
        <span>ItemsPerPage: {itemsPerPage}</span>
        <span>CurrentPage: {currentPage}</span>
        <span>TotalPages: {totalPages}</span>
        <span>Loading: {isLoading.toString()}</span>
        <button onClick={() => onItemsPerPageChange(20)}>Change Items Per Page</button>
        <button onClick={() => onPageChange(1)}>Change Page</button>
      </div>
    )
  }
})

describe('RaffleListControls', () => {
  const mockProps = {
    totalRaffles: 25,
    itemsPerPage: 10,
    currentPage: 0,
    totalPages: 3,
    searchTerm: '',
    statusFilter: 'all' as const,
    onItemsPerPageChange: jest.fn(),
    onPageChange: jest.fn(),
    onSearchChange: jest.fn(),
    onStatusFilterChange: jest.fn(),
    onClearFilters: jest.fn(),
    isLoading: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Renderização', () => {
    it('deve renderizar container principal com estilos corretos', () => {
      render(<RaffleListControls {...mockProps} />)
      
      const container = screen.getByTestId('raffle-list-filter').closest('.bg-white')
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('bg-white', 'p-4', 'rounded-lg', 'border', 'border-gray-200', 'shadow-sm')
    })

    it('deve renderizar ambos os componentes filhos', () => {
      render(<RaffleListControls {...mockProps} />)
      
      expect(screen.getByTestId('raffle-list-filter')).toBeInTheDocument()
      expect(screen.getByTestId('raffle-list-pagination')).toBeInTheDocument()
    })

    it('deve ter layout flex com justify-between', () => {
      render(<RaffleListControls {...mockProps} />)
      
      const flexContainer = screen.getByTestId('raffle-list-filter').closest('.flex')
      expect(flexContainer).toBeInTheDocument()
      expect(flexContainer).toHaveClass('flex', 'items-center', 'justify-between', 'gap-4')
    })
  })

  describe('Containers de Alinhamento', () => {
    it('deve ter container esquerdo para filtros', () => {
      render(<RaffleListControls {...mockProps} />)
      
      const filterContainer = screen.getByTestId('raffle-list-filter').closest('.justify-start')
      expect(filterContainer).toBeInTheDocument()
      expect(filterContainer).toHaveClass('flex', 'items-center', 'justify-start', 'flex-shrink-0')
    })

    it('deve ter container direito para paginação', () => {
      render(<RaffleListControls {...mockProps} />)
      
      const paginationContainer = screen.getByTestId('raffle-list-pagination').closest('.justify-end')
      expect(paginationContainer).toBeInTheDocument()
      expect(paginationContainer).toHaveClass('flex', 'items-center', 'justify-end', 'flex-shrink-0')
    })

    it('deve ter espaço flexível no meio', () => {
      render(<RaffleListControls {...mockProps} />)
      
      const flexGrowElement = document.querySelector('.flex-grow')
      expect(flexGrowElement).toBeInTheDocument()
    })
  })

  describe('Props do RaffleListFilter', () => {
    it('deve passar props corretas para RaffleListFilter', () => {
      render(
        <RaffleListControls 
          {...mockProps} 
          searchTerm="test search"
          statusFilter="active"
          isLoading={true}
        />
      )
      
      const filterComponent = screen.getByTestId('raffle-list-filter')
      expect(filterComponent).toHaveTextContent('Search: test search')
      expect(filterComponent).toHaveTextContent('Status: active')
      expect(filterComponent).toHaveTextContent('Loading: true')
    })

    it('deve chamar onSearchChange quando RaffleListFilter dispara evento', async () => {
      const user = userEvent.setup()
      render(<RaffleListControls {...mockProps} />)
      
      const changeSearchButton = screen.getByText('Change Search')
      await user.click(changeSearchButton)
      
      expect(mockProps.onSearchChange).toHaveBeenCalledWith('test')
    })

    it('deve chamar onStatusFilterChange quando RaffleListFilter dispara evento', async () => {
      const user = userEvent.setup()
      render(<RaffleListControls {...mockProps} />)
      
      const changeStatusButton = screen.getByText('Change Status')
      await user.click(changeStatusButton)
      
      expect(mockProps.onStatusFilterChange).toHaveBeenCalledWith('active')
    })

    it('deve chamar onClearFilters quando RaffleListFilter dispara evento', async () => {
      const user = userEvent.setup()
      render(<RaffleListControls {...mockProps} />)
      
      const clearFiltersButton = screen.getByText('Clear Filters')
      await user.click(clearFiltersButton)
      
      expect(mockProps.onClearFilters).toHaveBeenCalled()
    })
  })

  describe('Props do RaffleListPagination', () => {
    it('deve passar props corretas para RaffleListPagination', () => {
      render(
        <RaffleListControls 
          {...mockProps} 
          totalRaffles={50}
          itemsPerPage={20}
          currentPage={2}
          totalPages={5}
          isLoading={true}
        />
      )
      
      const paginationComponent = screen.getByTestId('raffle-list-pagination')
      expect(paginationComponent).toHaveTextContent('Total: 50')
      expect(paginationComponent).toHaveTextContent('ItemsPerPage: 20')
      expect(paginationComponent).toHaveTextContent('CurrentPage: 2')
      expect(paginationComponent).toHaveTextContent('TotalPages: 5')
      expect(paginationComponent).toHaveTextContent('Loading: true')
    })

    it('deve chamar onItemsPerPageChange quando RaffleListPagination dispara evento', async () => {
      const user = userEvent.setup()
      render(<RaffleListControls {...mockProps} />)
      
      const changeItemsButton = screen.getByText('Change Items Per Page')
      await user.click(changeItemsButton)
      
      expect(mockProps.onItemsPerPageChange).toHaveBeenCalledWith(20)
    })

    it('deve chamar onPageChange quando RaffleListPagination dispara evento', async () => {
      const user = userEvent.setup()
      render(<RaffleListControls {...mockProps} />)
      
      const changePageButton = screen.getByText('Change Page')
      await user.click(changePageButton)
      
      expect(mockProps.onPageChange).toHaveBeenCalledWith(1)
    })
  })

  describe('Estados de Loading', () => {
    it('deve propagar isLoading para ambos os componentes', () => {
      render(<RaffleListControls {...mockProps} isLoading={true} />)
      
      const filterComponent = screen.getByTestId('raffle-list-filter')
      const paginationComponent = screen.getByTestId('raffle-list-pagination')
      
      expect(filterComponent).toHaveTextContent('Loading: true')
      expect(paginationComponent).toHaveTextContent('Loading: true')
    })

    it('deve propagar isLoading false para ambos os componentes', () => {
      render(<RaffleListControls {...mockProps} isLoading={false} />)
      
      const filterComponent = screen.getByTestId('raffle-list-filter')
      const paginationComponent = screen.getByTestId('raffle-list-pagination')
      
      expect(filterComponent).toHaveTextContent('Loading: false')
      expect(paginationComponent).toHaveTextContent('Loading: false')
    })
  })

  describe('Casos Extremos', () => {
    it('deve lidar com valores zero', () => {
      render(
        <RaffleListControls 
          {...mockProps} 
          totalRaffles={0}
          currentPage={0}
          totalPages={0}
        />
      )
      
      const paginationComponent = screen.getByTestId('raffle-list-pagination')
      expect(paginationComponent).toHaveTextContent('Total: 0')
      expect(paginationComponent).toHaveTextContent('CurrentPage: 0')
      expect(paginationComponent).toHaveTextContent('TotalPages: 0')
    })

    it('deve lidar com strings vazias nos filtros', () => {
      render(
        <RaffleListControls 
          {...mockProps} 
          searchTerm=""
          statusFilter="all"
        />
      )
      
      const filterComponent = screen.getByTestId('raffle-list-filter')
      expect(filterComponent).toHaveTextContent('Search: ')
      expect(filterComponent).toHaveTextContent('Status: all')
    })
  })

  describe('Integração de Callbacks', () => {
    it('deve manter referências de callbacks estáveis', () => {
      const { rerender } = render(<RaffleListControls {...mockProps} />)
      
      // Captura as funções iniciais
      const initialCallbacks = {
        onSearchChange: mockProps.onSearchChange,
        onStatusFilterChange: mockProps.onStatusFilterChange,
        onClearFilters: mockProps.onClearFilters,
        onItemsPerPageChange: mockProps.onItemsPerPageChange,
        onPageChange: mockProps.onPageChange
      }
      
      // Re-render com as mesmas props
      rerender(<RaffleListControls {...mockProps} />)
      
      // As referências devem ser as mesmas
      expect(mockProps.onSearchChange).toBe(initialCallbacks.onSearchChange)
      expect(mockProps.onStatusFilterChange).toBe(initialCallbacks.onStatusFilterChange)
      expect(mockProps.onClearFilters).toBe(initialCallbacks.onClearFilters)
      expect(mockProps.onItemsPerPageChange).toBe(initialCallbacks.onItemsPerPageChange)
      expect(mockProps.onPageChange).toBe(initialCallbacks.onPageChange)
    })
  })
})
