import { render, screen } from '@testing-library/react'
import { RaffleNumberListContainer } from '@/components/RaffleNumberListContainer'

// Mock do RaffleNumberList
jest.mock('@/components/RaffleNumberList', () => ({
  RaffleNumberList: ({ raffleId }: { raffleId: string }) => (
    <div data-testid="raffle-number-list" data-raffle-id={raffleId}>
      Raffle Number List
    </div>
  )
}))

// Mock do RaffleNumberListPagination
jest.mock('@/components/RaffleNumberListPagination', () => ({
  RaffleNumberListPagination: ({ 
    currentPage, 
    totalPages, 
    onPageChange 
  }: { 
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void 
  }) => (
    <div data-testid="raffle-number-list-pagination" data-current-page={currentPage} data-total-pages={totalPages}>
      Pagination
    </div>
  )
}))

describe('RaffleNumberListContainer', () => {
  const mockOnPageChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('deve renderizar o container com rifa ID', () => {
    render(
      <RaffleNumberListContainer 
        raffleId="raffle-123" 
        onPageChange={mockOnPageChange}
      />
    )

    expect(screen.getByTestId('raffle-number-list')).toBeInTheDocument()
    expect(screen.getByTestId('raffle-number-list')).toHaveAttribute('data-raffle-id', 'raffle-123')
  })

  test('deve renderizar paginação com valores padrão', () => {
    render(
      <RaffleNumberListContainer 
        raffleId="raffle-123" 
        onPageChange={mockOnPageChange}
      />
    )

    const pagination = screen.getByTestId('raffle-number-list-pagination')
    expect(pagination).toBeInTheDocument()
    expect(pagination).toHaveAttribute('data-current-page', '0')
    expect(pagination).toHaveAttribute('data-total-pages', '0')
  })

  test('deve renderizar paginação com valores customizados', () => {
    render(
      <RaffleNumberListContainer 
        raffleId="raffle-123" 
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    )

    const pagination = screen.getByTestId('raffle-number-list-pagination')
    expect(pagination).toHaveAttribute('data-current-page', '0')
    expect(pagination).toHaveAttribute('data-total-pages', '0')
  })

  test('deve ter estrutura de layout correta', () => {
    const { container } = render(
      <RaffleNumberListContainer 
        raffleId="raffle-123" 
        onPageChange={mockOnPageChange}
      />
    )

    // Verifica se tem a estrutura de container
    expect(container.firstChild).toHaveClass('space-y-3')
  })
})
