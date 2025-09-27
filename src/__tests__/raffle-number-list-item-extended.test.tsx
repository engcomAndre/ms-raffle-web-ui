import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RaffleNumberListItem } from '@/components/RaffleNumberListItem'
import { RaffleNumberItemResponse, RaffleResponse } from '@/types/raffle'
import { raffleService } from '@/services/raffleService'
import { getErrorMessage } from '@/utils/errorMessages'

// Mock do raffleService
jest.mock('@/services/raffleService', () => ({
  raffleService: {
    reserveRaffleNumber: jest.fn(),
    unreserveRaffleNumber: jest.fn()
  }
}))

// Mock do getErrorMessage
jest.mock('@/utils/errorMessages', () => ({
  getErrorMessage: jest.fn(error => (error instanceof Error ? error.message : String(error)))
}))

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

describe('RaffleNumberListItem', () => {
  const mockRaffleId = 'raffle-123'
  const mockOnReserveSuccess = jest.fn()
  const mockOnReserveError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(raffleService.reserveRaffleNumber as jest.Mock).mockResolvedValue({ success: true })
    ;(raffleService.unreserveRaffleNumber as jest.Mock).mockResolvedValue({ success: true })
  })

  const renderComponent = (
    number: RaffleNumberItemResponse,
    raffleInfo?: RaffleResponse | null
  ) => {
    return render(
      <RaffleNumberListItem
        number={number}
        raffleId={mockRaffleId}
        raffleInfo={raffleInfo}
        onReserveSuccess={mockOnReserveSuccess}
        onReserveError={mockOnReserveError}
      />
    )
  }

  it('deve renderizar um número ativo corretamente', () => {
    const number: RaffleNumberItemResponse = { number: 1, status: 'ACTIVE' }
    renderComponent(number)

    const item = screen.getByText('1')
    expect(item).toBeInTheDocument()
    const container = item.closest('div.border')
    expect(container).toHaveClass('bg-green-100 border-green-300 text-green-800')
    expect(container).toHaveClass('cursor-pointer hover:bg-green-200')
  })

  it('deve renderizar um número reservado corretamente', () => {
    const number: RaffleNumberItemResponse = { number: 2, status: 'RESERVED', reservedBy: 'User A', owner: 'Different User' }
    renderComponent(number)

    const item = screen.getByText('2')
    expect(item).toBeInTheDocument()
    const container = item.closest('div.border')
    expect(container).toHaveClass('bg-yellow-100 border-yellow-300 text-yellow-800')
    expect(container).toHaveClass('cursor-not-allowed')
    expect(screen.getByText('✓')).toBeInTheDocument() // Ícone de reservado
    expect(screen.getByText('Res: User A')).toBeInTheDocument()
  })

  it('deve renderizar um número vendido corretamente', () => {
    const number: RaffleNumberItemResponse = { number: 3, status: 'SOLD', buyerName: 'Buyer B' }
    renderComponent(number)

    const item = screen.getByText('3')
    expect(item).toBeInTheDocument()
    const container = item.closest('div.border')
    expect(container).toHaveClass('bg-gray-200 border-gray-400 text-gray-700')
    expect(container).toHaveClass('cursor-not-allowed')
    expect(screen.getByText('Buyer B')).toBeInTheDocument()
  })

  it('deve renderizar um número com status desconhecido como padrão', () => {
    const number: RaffleNumberItemResponse = { number: 4, status: 'UNKNOWN' as any }
    renderComponent(number)

    const item = screen.getByText('4')
    expect(item).toBeInTheDocument()
    const container = item.closest('div.border')
    expect(container).toHaveClass('bg-gray-100 border-gray-300 text-gray-800')
    expect(container).toHaveClass('cursor-pointer hover:bg-gray-200')
  })

  it('deve permitir reservar um número ativo', async () => {
    const number: RaffleNumberItemResponse = { number: 5, status: 'ACTIVE' }
    renderComponent(number)

    const item = screen.getByText('5')
    fireEvent.click(item)

    expect(screen.getByText('⏳')).toBeInTheDocument() // Mostra status de loading
    await waitFor(() => {
      expect(raffleService.reserveRaffleNumber).toHaveBeenCalledWith(mockRaffleId, 5)
    })
    await waitFor(() => {
      expect(mockOnReserveSuccess).toHaveBeenCalledWith(5)
    })
    expect(screen.queryByText('⏳')).not.toBeInTheDocument() // Esconde status de loading
    const container = item.closest('div.border')
    expect(container).toHaveClass('bg-yellow-100 border-yellow-300 text-yellow-800') // Status muda para RESERVED
  })

  it('deve permitir desreservar um número reservado', async () => {
    const number: RaffleNumberItemResponse = { number: 6, status: 'RESERVED', reservedBy: 'Me' }
    renderComponent(number)

    const item = screen.getByText('6')
    fireEvent.click(item)

    expect(screen.getByText('⏳')).toBeInTheDocument() // Mostra status de loading
    await waitFor(() => {
      expect(raffleService.unreserveRaffleNumber).toHaveBeenCalledWith(mockRaffleId, 6)
    })
    await waitFor(() => {
      expect(mockOnReserveSuccess).toHaveBeenCalledWith(6)
    })
    expect(screen.queryByText('⏳')).not.toBeInTheDocument() // Esconde status de loading
    const container = item.closest('div.border')
    expect(container).toHaveClass('bg-green-100 border-green-300 text-green-800') // Status muda para ACTIVE
  })

  it('não deve permitir clicar em um número vendido', () => {
    const number: RaffleNumberItemResponse = { number: 7, status: 'SOLD', buyerName: 'Buyer C' }
    renderComponent(number)

    const item = screen.getByText('7')
    fireEvent.click(item)

    expect(raffleService.reserveRaffleNumber).not.toHaveBeenCalled()
    expect(raffleService.unreserveRaffleNumber).not.toHaveBeenCalled()
    expect(mockOnReserveSuccess).not.toHaveBeenCalled()
    expect(mockOnReserveError).not.toHaveBeenCalled()
  })

  it('deve chamar onReserveError se a reserva falhar', async () => {
    const number: RaffleNumberItemResponse = { number: 8, status: 'ACTIVE' }
    const errorMessage = 'Erro ao reservar'
    ;(raffleService.reserveRaffleNumber as jest.Mock).mockRejectedValue(new Error(errorMessage))
    ;(getErrorMessage as jest.Mock).mockReturnValue(errorMessage)

    renderComponent(number)

    const item = screen.getByText('8')
    fireEvent.click(item)

    await waitFor(() => {
      expect(raffleService.reserveRaffleNumber).toHaveBeenCalledWith(mockRaffleId, 8)
    })
    await waitFor(() => {
      expect(mockOnReserveError).toHaveBeenCalledWith(errorMessage)
    })
    expect(screen.queryByText('⏳')).not.toBeInTheDocument()
    const container = item.closest('div.border')
    expect(container).toHaveClass('bg-green-100 border-green-300 text-green-800') // Status volta para ACTIVE
  })

  it('deve chamar onReserveError se a desreserva falhar', async () => {
    const number: RaffleNumberItemResponse = { number: 9, status: 'RESERVED', reservedBy: 'Me' }
    const errorMessage = 'Erro ao desreservar'
    ;(raffleService.unreserveRaffleNumber as jest.Mock).mockRejectedValue(new Error(errorMessage))
    ;(getErrorMessage as jest.Mock).mockReturnValue(errorMessage)

    renderComponent(number)

    const item = screen.getByText('9')
    fireEvent.click(item)

    await waitFor(() => {
      expect(raffleService.unreserveRaffleNumber).toHaveBeenCalledWith(mockRaffleId, 9)
    })
    await waitFor(() => {
      expect(mockOnReserveError).toHaveBeenCalledWith(errorMessage)
    })
    expect(screen.queryByText('⏳')).not.toBeInTheDocument()
    const container = item.closest('div.border')
    expect(container).toHaveClass('bg-yellow-100 border-yellow-300 text-yellow-800') // Status volta para RESERVED
  })

  it('deve exibir nome do comprador e telefone se disponível', () => {
    const number: RaffleNumberItemResponse = {
      number: 10,
      status: 'SOLD',
      buyerName: 'Comprador X',
      buyerPhone: '11987654321'
    }
    renderComponent(number)

    expect(screen.getByText('Comprador X')).toBeInTheDocument()
    expect(screen.getByText('11987654321')).toBeInTheDocument()
  })

  it('deve exibir nome do proprietário se buyerName não estiver disponível', () => {
    const number: RaffleNumberItemResponse = {
      number: 11,
      status: 'SOLD',
      owner: 'Proprietário Y'
    }
    renderComponent(number)

    expect(screen.getByText('Proprietário Y')).toBeInTheDocument()
  })

  it('deve exibir status de vencedor se winner for true', () => {
    const number: RaffleNumberItemResponse = { number: 12, status: 'SOLD', winner: true }
    renderComponent(number)

    expect(screen.getByText('🏆')).toBeInTheDocument()
  })

  it('não deve permitir reservar/desreservar se a rifa estiver inativa', () => {
    const number: RaffleNumberItemResponse = { number: 13, status: 'ACTIVE' }
    const inactiveRaffleInfo: RaffleResponse = {
      id: mockRaffleId,
      title: 'Rifa Inativa',
      prize: 'Prêmio',
      maxNumbers: 100,
      active: false,
      startAt: '2023-01-01T00:00:00Z',
      endAt: '2023-01-31T23:59:59Z',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      userId: 'user-id',
      username: 'username',
      totalNumbers: 100,
      availableNumbers: 100,
      reservedNumbers: 0,
      soldNumbers: 0
    }
    renderComponent(number, inactiveRaffleInfo)

    const item = screen.getByText('13')
    fireEvent.click(item)

    expect(raffleService.reserveRaffleNumber).not.toHaveBeenCalled()
    expect(raffleService.unreserveRaffleNumber).not.toHaveBeenCalled()
    expect(mockOnReserveError).toHaveBeenCalledWith('Não é possível reservar números de uma rifa inativa')
    expect(screen.getByText('🚫')).toBeInTheDocument() // Ícone de rifa inativa
  })

  it('deve exibir classes corretas para rifa inativa', () => {
    const number: RaffleNumberItemResponse = { number: 14, status: 'ACTIVE' }
    const inactiveRaffleInfo: RaffleResponse = {
      id: mockRaffleId,
      title: 'Rifa Inativa',
      prize: 'Prêmio',
      maxNumbers: 100,
      active: false,
      startAt: '2023-01-01T00:00:00Z',
      endAt: '2023-01-31T23:59:59Z',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      userId: 'user-id',
      username: 'username',
      totalNumbers: 100,
      availableNumbers: 100,
      reservedNumbers: 0,
      soldNumbers: 0
    }
    renderComponent(number, inactiveRaffleInfo)

    const item = screen.getByText('14')
    const container = item.closest('div.border')
    expect(container).toHaveClass('bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed opacity-60')
  })

  it('deve sincronizar status local quando o status do número mudar', () => {
    const number: RaffleNumberItemResponse = { number: 15, status: 'ACTIVE' }
    const { rerender } = renderComponent(number)

    const item = screen.getByText('15')
    let container = item.closest('div.border')
    expect(container).toHaveClass('bg-green-100 border-green-300 text-green-800')

    // Simular mudança de status
    const updatedNumber = { ...number, status: 'RESERVED' as const }
    rerender(
      <RaffleNumberListItem
        number={updatedNumber}
        raffleId={mockRaffleId}
        onReserveSuccess={mockOnReserveSuccess}
        onReserveError={mockOnReserveError}
      />
    )

    container = item.closest('div.border')
    expect(container).toHaveClass('bg-yellow-100 border-yellow-300 text-yellow-800')
  })

  it('deve exibir informações do reservador quando diferente do comprador', () => {
    const number: RaffleNumberItemResponse = {
      number: 16,
      status: 'SOLD',
      buyerName: 'Comprador Z',
      reservedBy: 'Reservador W'
    }
    renderComponent(number)

    expect(screen.getByText('Comprador Z')).toBeInTheDocument()
    expect(screen.getByText('Res: Reservador W')).toBeInTheDocument()
  })

  it('deve exibir hover shadow apenas para números que podem ser reservados', () => {
    const activeNumber: RaffleNumberItemResponse = { number: 17, status: 'ACTIVE' }
    const { rerender } = renderComponent(activeNumber)

    let item = screen.getByText('17')
    const container = item.closest('div.border')
    expect(container).toHaveClass('hover:shadow-md')

    const soldNumber: RaffleNumberItemResponse = { number: 18, status: 'SOLD' }
    rerender(
      <RaffleNumberListItem
        number={soldNumber}
        raffleId={mockRaffleId}
        onReserveSuccess={mockOnReserveSuccess}
        onReserveError={mockOnReserveError}
      />
    )

    item = screen.getByText('18')
    expect(item.closest('div')).not.toHaveClass('hover:shadow-md')
  })

  it('deve lidar com número sem informações de comprador ou proprietário', () => {
    const number: RaffleNumberItemResponse = { number: 19, status: 'ACTIVE' }
    renderComponent(number)

    expect(screen.queryByText('Comprador')).not.toBeInTheDocument()
    expect(screen.queryByText('Proprietário')).not.toBeInTheDocument()
  })

  it('deve exibir loading durante operação de reserva', async () => {
    ;(raffleService.reserveRaffleNumber as jest.Mock).mockImplementation(() => new Promise(() => {})) // Never resolves

    const number: RaffleNumberItemResponse = { number: 20, status: 'ACTIVE' }
    renderComponent(number)

    const item = screen.getByText('20')
    fireEvent.click(item)

    expect(screen.getByText('⏳')).toBeInTheDocument()
    const container = item.closest('div.border')
    expect(container).toHaveClass('bg-yellow-100 border-yellow-300 text-yellow-800') // Status muda imediatamente
  })

  it('deve exibir loading durante operação de desreserva', async () => {
    ;(raffleService.unreserveRaffleNumber as jest.Mock).mockImplementation(() => new Promise(() => {})) // Never resolves

    const number: RaffleNumberItemResponse = { number: 21, status: 'RESERVED', reservedBy: 'Me' }
    renderComponent(number)

    const item = screen.getByText('21')
    fireEvent.click(item)

    expect(screen.getByText('⏳')).toBeInTheDocument()
    const container = item.closest('div.border')
    expect(container).toHaveClass('bg-green-100 border-green-300 text-green-800') // Status muda imediatamente
  })
})