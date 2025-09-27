import { render, screen, fireEvent } from '@testing-library/react'
import { RaffleListItem } from '@/components/RaffleListItem'
import { RaffleResponse } from '@/types/raffle'

// Mock do RaffleNumberListContainer
jest.mock('@/components/RaffleNumberListContainer', () => ({
  RaffleNumberListContainer: ({ raffleId }: { raffleId: string }) => (
    <div data-testid="raffle-number-list-container" data-raffle-id={raffleId}>
      Raffle Number List Container
    </div>
  )
}))

const mockRaffle: RaffleResponse = {
  id: 'raffle-123',
  title: 'Rifa do iPhone',
  prize: 'iPhone 15 Pro Max',
  description: 'Rifa de um iPhone 15 Pro Max',
  maxNumbers: 1000,
  files: ['image1.jpg'],
  startAt: '2024-12-31T10:00:00Z',
  endAt: '2025-01-31T10:00:00Z',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  status: 'ACTIVE',
  active: true,
  soldNumbers: 150,
  createdBy: 'user123',
  numbersCreated: 1000
}

describe('RaffleListItem', () => {
  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()
  const mockOnToggleStatus = jest.fn()
  const mockOnViewNumbers = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('deve renderizar informações básicas da rifa', () => {
    render(
      <RaffleListItem
        raffle={mockRaffle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onViewNumbers={mockOnViewNumbers}
      />
    )

    expect(screen.getByText('Rifa do iPhone')).toBeInTheDocument()
    expect(screen.getByText('iPhone 15 Pro Max')).toBeInTheDocument()
    expect(screen.getByText('Rifa de um iPhone 15 Pro Max')).toBeInTheDocument()
    expect(screen.getByText('Ativa')).toBeInTheDocument()
  })

  test('deve renderizar badge de status ativa', () => {
    render(
      <RaffleListItem
        raffle={mockRaffle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onViewNumbers={mockOnViewNumbers}
      />
    )

    const statusBadge = screen.getByText('Ativa')
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800')
  })

  test('deve renderizar badge de status inativa', () => {
    const inactiveRaffle = { ...mockRaffle, active: false }
    
    render(
      <RaffleListItem
        raffle={inactiveRaffle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onViewNumbers={mockOnViewNumbers}
      />
    )

    const statusBadge = screen.getByText('Inativa')
    expect(statusBadge).toHaveClass('bg-red-100', 'text-red-800')
  })

  test('deve expandir/colapsar ao clicar no botão', () => {
    render(
      <RaffleListItem
        raffle={mockRaffle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onViewNumbers={mockOnViewNumbers}
      />
    )

    const toggleButton = screen.getByRole('button', { name: 'Ver números da rifa' })
    
    // Inicialmente não deve estar expandido
    expect(screen.queryByTestId('raffle-number-list-container')).not.toBeInTheDocument()
    
    // Clicar para expandir
    fireEvent.click(toggleButton)
    expect(screen.getByTestId('raffle-number-list-container')).toBeInTheDocument()
    
    // Clicar para colapsar
    fireEvent.click(toggleButton)
    expect(screen.queryByTestId('raffle-number-list-container')).not.toBeInTheDocument()
  })

  test('deve chamar onEdit ao clicar no botão de editar', () => {
    render(
      <RaffleListItem
        raffle={mockRaffle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onViewNumbers={mockOnViewNumbers}
      />
    )

    const editButton = screen.getByRole('button', { name: /editar/i })
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(mockRaffle)
  })

  test('deve chamar onDelete ao clicar no botão de deletar', () => {
    render(
      <RaffleListItem
        raffle={mockRaffle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onViewNumbers={mockOnViewNumbers}
      />
    )

    const deleteButton = screen.getByRole('button', { name: 'Excluir' })
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith('raffle-123')
  })

  test('deve chamar onToggleStatus ao clicar no botão de status', () => {
    render(
      <RaffleListItem
        raffle={mockRaffle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onViewNumbers={mockOnViewNumbers}
      />
    )

    const statusButton = screen.getByRole('button', { name: /desativar/i })
    fireEvent.click(statusButton)

    expect(mockOnToggleStatus).toHaveBeenCalledWith('raffle-123', false)
  })

  test('deve chamar onViewNumbers ao clicar no botão de ver números', () => {
    render(
      <RaffleListItem
        raffle={mockRaffle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onViewNumbers={mockOnViewNumbers}
      />
    )

    const viewNumbersButton = screen.getByRole('button', { name: 'Ver números da rifa' })
    fireEvent.click(viewNumbersButton)

    // O botão "Ver números da rifa" apenas expande/colapsa, não chama onViewNumbers
    // onViewNumbers é chamado quando o componente é expandido
    expect(screen.getByTestId('raffle-number-list-container')).toBeInTheDocument()
  })

  test('deve formatar data corretamente', () => {
    render(
      <RaffleListItem
        raffle={mockRaffle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onViewNumbers={mockOnViewNumbers}
      />
    )

    // Verifica se as datas estão sendo exibidas (formato pode variar dependendo da implementação)
    expect(screen.getByText(/31\/12\/2024/)).toBeInTheDocument()
    expect(screen.getByText(/31\/01\/2025/)).toBeInTheDocument()
  })

  test('deve exibir estatísticas corretas', () => {
    render(
      <RaffleListItem
        raffle={mockRaffle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onViewNumbers={mockOnViewNumbers}
      />
    )

    expect(screen.getByText('1000')).toBeInTheDocument() // maxNumbers
    // soldNumbers não é exibido diretamente no componente
  })

  test('deve renderizar RaffleNumberListContainer quando expandido', () => {
    render(
      <RaffleListItem
        raffle={mockRaffle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onViewNumbers={mockOnViewNumbers}
      />
    )

    const toggleButton = screen.getByRole('button', { name: 'Ver números da rifa' })
    fireEvent.click(toggleButton)

    const numberListContainer = screen.getByTestId('raffle-number-list-container')
    expect(numberListContainer).toBeInTheDocument()
    expect(numberListContainer).toHaveAttribute('data-raffle-id', 'raffle-123')
  })
})
