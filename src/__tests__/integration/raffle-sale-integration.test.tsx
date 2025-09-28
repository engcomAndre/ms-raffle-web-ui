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

// Mock do componente RaffleNumberList
jest.mock('@/components/RaffleNumberList', () => ({
  RaffleNumberList: ({ numbers, raffleId, raffleInfo, onReserveSuccess }: any) => (
    <div data-testid="raffle-number-list">
      <div>Números: {numbers.length}</div>
      <div>Rifa ID: {raffleId}</div>
      <div>Rifa Info: {raffleInfo?.title}</div>
      <button onClick={() => onReserveSuccess?.(1)}>Simular Reserva</button>
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
  },
  {
    raffleId: 'test-raffle-id',
    number: '3',
    status: 'RESERVED' as const,
    winner: false,
    reservedAt: '2024-01-01T00:00:00Z',
    reservedBy: 'user2',
    soldAt: null,
    soldBy: null,
    owner: null
  }
]

describe('Raffle Sale Integration', () => {
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
        totalElements: 3,
        pageNumber: 0,
        pageSize: 20,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
        first: true,
        last: true
      }
    })
    ;(raffleService.sellRaffleNumber as jest.Mock).mockResolvedValue({
      success: true
    })
  })

  it('should complete full sale workflow', async () => {
    render(<RaffleNumberListContainer raffleId="test-raffle-id" />)

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByText('Vender')).toBeInTheDocument()
    })

    // Abrir modal de venda
    fireEvent.click(screen.getByText('Vender'))

    await waitFor(() => {
      expect(screen.getByText('Vender Números Reservados')).toBeInTheDocument()
    })

    // Verificar se números reservados são exibidos
    expect(screen.getByText('2')).toBeInTheDocument() // Número reservado
    expect(screen.getByText('3')).toBeInTheDocument() // Número reservado
    expect(screen.queryByText('1')).not.toBeInTheDocument() // Número ativo não deve aparecer

    // Selecionar números para venda
    fireEvent.click(screen.getByText('2'))
    fireEvent.click(screen.getByText('3'))

    // Verificar contador de seleção
    expect(screen.getByText('2 de 2 selecionados')).toBeInTheDocument()

    // Confirmar venda
    fireEvent.click(screen.getByText('Confirmar Venda (2)'))

    // Verificar chamadas para API
    await waitFor(() => {
      expect(raffleService.sellRaffleNumber).toHaveBeenCalledTimes(2)
      expect(raffleService.sellRaffleNumber).toHaveBeenCalledWith('test-raffle-id', 2)
      expect(raffleService.sellRaffleNumber).toHaveBeenCalledWith('test-raffle-id', 3)
    })

    // Verificar mensagem de sucesso
    await waitFor(() => {
      expect(screen.getByText('2 número(s) vendido(s) com sucesso!')).toBeInTheDocument()
    })

    // Verificar se modal fecha automaticamente
    await waitFor(() => {
      expect(screen.queryByText('Vender Números Reservados')).not.toBeInTheDocument()
    }, { timeout: 2000 })

    // Verificar se números foram recarregados
    await waitFor(() => {
      expect(raffleService.getRaffleNumbers).toHaveBeenCalledTimes(3)
    })
  })

  it('should handle partial sale failure', async () => {
    ;(raffleService.sellRaffleNumber as jest.Mock)
      .mockResolvedValueOnce({ success: true })
      .mockRejectedValueOnce(new Error('Erro na venda'))

    render(<RaffleNumberListContainer raffleId="test-raffle-id" />)

    await waitFor(() => {
      expect(screen.getByText('Vender')).toBeInTheDocument()
    })

    // Abrir modal de venda
    fireEvent.click(screen.getByText('Vender'))

    await waitFor(() => {
      expect(screen.getByText('Vender Números Reservados')).toBeInTheDocument()
    })

    // Selecionar números
    fireEvent.click(screen.getByText('2'))
    fireEvent.click(screen.getByText('3'))

    // Confirmar venda
    fireEvent.click(screen.getByText('Confirmar Venda (2)'))

    // Verificar mensagem de venda parcial
    await waitFor(() => {
      expect(screen.getByText('1 número(s) vendido(s) com sucesso. 1 falharam.')).toBeInTheDocument()
    })
  })

  it('should handle complete sale failure', async () => {
    ;(raffleService.sellRaffleNumber as jest.Mock).mockRejectedValue(new Error('Erro na venda'))

    render(<RaffleNumberListContainer raffleId="test-raffle-id" />)

    await waitFor(() => {
      expect(screen.getByText('Vender')).toBeInTheDocument()
    })

    // Abrir modal de venda
    fireEvent.click(screen.getByText('Vender'))

    await waitFor(() => {
      expect(screen.getByText('Vender Números Reservados')).toBeInTheDocument()
    })

    // Selecionar número
    fireEvent.click(screen.getByText('2'))

    // Confirmar venda
    fireEvent.click(screen.getByText('Confirmar Venda (1)'))

    // Verificar mensagem de erro
    await waitFor(() => {
      expect(screen.getByText('Erro ao vender os números selecionados')).toBeInTheDocument()
    })
  })

  it('should handle empty reserved numbers', async () => {
    ;(raffleService.getRaffleNumbers as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        rafflesNumbers: [mockNumbers[0]], // Apenas número ativo
        totalElements: 1
      }
    })

    render(<RaffleNumberListContainer raffleId="test-raffle-id" />)

    await waitFor(() => {
      expect(screen.getByText('Vender')).toBeInTheDocument()
    })

    // Abrir modal de venda
    fireEvent.click(screen.getByText('Vender'))

    await waitFor(() => {
      expect(screen.getByText('Nenhum número reservado encontrado')).toBeInTheDocument()
    })
  })

  it('should handle loading error', async () => {
    ;(raffleService.getRaffleNumbers as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Erro ao carregar números'
    })

    render(<RaffleNumberListContainer raffleId="test-raffle-id" />)

    await waitFor(() => {
      expect(screen.getByText('Vender')).toBeInTheDocument()
    })

    // Abrir modal de venda
    fireEvent.click(screen.getByText('Vender'))

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar números reservados')).toBeInTheDocument()
      expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
    })
  })

  it('should refresh numbers after successful sale', async () => {
    render(<RaffleNumberListContainer raffleId="test-raffle-id" />)

    await waitFor(() => {
      expect(screen.getByText('Vender')).toBeInTheDocument()
    })

    // Abrir modal de venda
    fireEvent.click(screen.getByText('Vender'))

    await waitFor(() => {
      expect(screen.getByText('Vender Números Reservados')).toBeInTheDocument()
    })

    // Selecionar e vender número
    fireEvent.click(screen.getByText('2'))
    fireEvent.click(screen.getByText('Confirmar Venda (1)'))

    // Verificar se números foram recarregados após venda
    await waitFor(() => {
      expect(raffleService.getRaffleNumbers).toHaveBeenCalledTimes(2)
    })
  })

  it('should maintain state correctly during sale process', async () => {
    ;(raffleService.sellRaffleNumber as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    )

    render(<RaffleNumberListContainer raffleId="test-raffle-id" />)

    await waitFor(() => {
      expect(screen.getByText('Vender')).toBeInTheDocument()
    })

    // Abrir modal de venda
    fireEvent.click(screen.getByText('Vender'))

    await waitFor(() => {
      expect(screen.getByText('Vender Números Reservados')).toBeInTheDocument()
    })

    // Selecionar número
    fireEvent.click(screen.getByText('2'))

    // Confirmar venda (deve mostrar estado de loading)
    fireEvent.click(screen.getByText('Confirmar Venda (1)'))

    // Verificar estado de venda
    expect(screen.getByText('Vendendo...')).toBeInTheDocument()
    expect(screen.getByText('Vendendo...')).toBeDisabled()

    // Aguardar conclusão
    await waitFor(() => {
      expect(screen.getByText('1 número(s) vendido(s) com sucesso!')).toBeInTheDocument()
    })
  })
})
