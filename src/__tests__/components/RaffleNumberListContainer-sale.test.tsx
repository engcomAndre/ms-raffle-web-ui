import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RaffleNumberListContainer } from '@/components/RaffleNumberListContainer'
import { raffleService } from '@/services/raffleService'

// Mock do raffleService
jest.mock('@/services/raffleService', () => ({
  raffleService: {
    getRaffleById: jest.fn(),
    getRaffleNumbers: jest.fn(),
    sellRaffleNumber: jest.fn()
  }
}))

// Mock do componente RaffleSaleModal
jest.mock('@/components/RaffleSaleModal', () => ({
  RaffleSaleModal: ({ isOpen, onClose, raffle, onSaleSuccess }: any) => (
    isOpen ? (
      <div data-testid="sale-modal">
        <div>Modal de Venda - {raffle.title}</div>
        <button onClick={onClose}>Fechar Modal</button>
        <button onClick={onSaleSuccess}>Simular Venda</button>
      </div>
    ) : null
  )
}))

// Mock do componente RaffleNumberList
jest.mock('@/components/RaffleNumberList', () => ({
  RaffleNumberList: ({ numbers, raffleId, raffleInfo }: any) => (
    <div data-testid="raffle-number-list">
      <div>Números: {numbers.length}</div>
      <div>Rifa ID: {raffleId}</div>
      <div>Rifa Info: {raffleInfo?.title}</div>
    </div>
  )
}))

// Mock do componente RaffleNumberListPagination
jest.mock('@/components/RaffleNumberListPagination', () => ({
  RaffleNumberListPagination: () => <div data-testid="pagination">Pagination</div>
}))

// Mock do componente RaffleNumberLegend
jest.mock('@/components/RaffleNumberLegend', () => ({
  RaffleNumberLegend: () => <div data-testid="legend">Legend</div>
}))

const mockRaffleInfo = {
  id: 'test-raffle-id',
  title: 'Rifa de Teste',
  description: 'Descrição da rifa',
  prize: 'Prêmio',
  maxNumbers: 100,
  startAt: '2024-01-01T00:00:00Z',
  endAt: '2024-12-31T23:59:59Z',
  active: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const mockNumbers = [
  {
    raffleId: 'test-raffle-id',
    number: '1',
    status: 'ACTIVE' as const,
    winner: false,
    reservedAt: null,
    reservedBy: null,
    soldAt: null,
    soldBy: null,
    owner: null
  },
  {
    raffleId: 'test-raffle-id',
    number: '2',
    status: 'RESERVED' as const,
    winner: false,
    reservedAt: '2024-01-01T00:00:00Z',
    reservedBy: 'user1',
    soldAt: null,
    soldBy: null,
    owner: null
  }
]

describe('RaffleNumberListContainer - Sale Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(raffleService.getRaffleById as jest.Mock).mockResolvedValue({
      success: true,
      data: mockRaffleInfo
    })
    ;(raffleService.getRaffleNumbers as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        rafflesNumbers: mockNumbers,
        totalElements: 2,
        pageNumber: 0,
        pageSize: 20,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
        first: true,
        last: true
      }
    })
  })

  it('should render sale button', async () => {
    render(<RaffleNumberListContainer raffleId="test-raffle-id" />)

    await waitFor(() => {
      expect(screen.getByText('Vender')).toBeInTheDocument()
    })
  })

  it('should open sale modal when clicking sell button', async () => {
    render(<RaffleNumberListContainer raffleId="test-raffle-id" />)

    await waitFor(() => {
      expect(screen.getByText('Vender')).toBeInTheDocument()
    })

    // Clicar no botão de venda
    fireEvent.click(screen.getByText('Vender'))

    await waitFor(() => {
      expect(screen.getByTestId('sale-modal')).toBeInTheDocument()
      expect(screen.getByText('Modal de Venda - Rifa de Teste')).toBeInTheDocument()
    })
  })

  it('should close sale modal when clicking close button', async () => {
    render(<RaffleNumberListContainer raffleId="test-raffle-id" />)

    await waitFor(() => {
      expect(screen.getByText('Vender')).toBeInTheDocument()
    })

    // Abrir modal
    fireEvent.click(screen.getByText('Vender'))

    await waitFor(() => {
      expect(screen.getByTestId('sale-modal')).toBeInTheDocument()
    })

    // Fechar modal
    fireEvent.click(screen.getByText('Fechar Modal'))

    await waitFor(() => {
      expect(screen.queryByTestId('sale-modal')).not.toBeInTheDocument()
    })
  })

  it('should refresh numbers after successful sale', async () => {
    render(<RaffleNumberListContainer raffleId="test-raffle-id" />)

    await waitFor(() => {
      expect(screen.getByText('Vender')).toBeInTheDocument()
    })

    // Abrir modal
    fireEvent.click(screen.getByText('Vender'))

    await waitFor(() => {
      expect(screen.getByTestId('sale-modal')).toBeInTheDocument()
    })

    // Simular venda bem-sucedida
    fireEvent.click(screen.getByText('Simular Venda'))

    // Verificar se os números foram recarregados
    await waitFor(() => {
      expect(raffleService.getRaffleNumbers).toHaveBeenCalledTimes(2)
    })
  })


  it('should show sale button with correct styling', async () => {
    render(<RaffleNumberListContainer raffleId="test-raffle-id" />)

    await waitFor(() => {
      const sellButton = screen.getByText('Vender')
      expect(sellButton).toBeInTheDocument()
      expect(sellButton).toHaveClass('text-blue-700', 'bg-blue-50', 'hover:bg-blue-100')
    })
  })

  it('should maintain other functionality while sale modal is open', async () => {
    render(<RaffleNumberListContainer raffleId="test-raffle-id" />)

    await waitFor(() => {
      expect(screen.getByText('Vender')).toBeInTheDocument()
    })

    // Abrir modal
    fireEvent.click(screen.getByText('Vender'))

    await waitFor(() => {
      expect(screen.getByTestId('sale-modal')).toBeInTheDocument()
    })

    // Verificar se outros elementos ainda estão presentes
    expect(screen.getByTestId('raffle-number-list')).toBeInTheDocument()
    expect(screen.getByTestId('legend')).toBeInTheDocument()
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
  })

  it('should handle sale modal state correctly', async () => {
    render(<RaffleNumberListContainer raffleId="test-raffle-id" />)

    await waitFor(() => {
      expect(screen.getByText('Vender')).toBeInTheDocument()
    })

    // Modal não deve estar aberto inicialmente
    expect(screen.queryByTestId('sale-modal')).not.toBeInTheDocument()

    // Abrir modal
    fireEvent.click(screen.getByText('Vender'))

    await waitFor(() => {
      expect(screen.getByTestId('sale-modal')).toBeInTheDocument()
    })

    // Fechar modal
    fireEvent.click(screen.getByText('Fechar Modal'))

    await waitFor(() => {
      expect(screen.queryByTestId('sale-modal')).not.toBeInTheDocument()
    })

    // Abrir novamente
    fireEvent.click(screen.getByText('Vender'))

    await waitFor(() => {
      expect(screen.getByTestId('sale-modal')).toBeInTheDocument()
    })
  })
})
