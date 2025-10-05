import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RafflePurchaseModal } from '../RafflePurchaseModal'
import { RaffleResponse } from '@/types/raffle'
import { raffleService } from '@/services/raffleService'

// Mock do raffleService
jest.mock('@/services/raffleService', () => ({
  raffleService: {
    getPublicRaffleNumbers: jest.fn(),
    sellRaffleNumber: jest.fn()
  }
}))

const mockRaffleService = raffleService as jest.Mocked<typeof raffleService>

describe('RafflePurchaseModal', () => {
  const mockRaffle: RaffleResponse = {
    id: 'test-raffle-id',
    title: 'Test Raffle',
    description: 'A test raffle for testing purposes',
    prize: 'Test Prize',
    maxNumbers: 100,
    numbersCreated: 50,
    active: true,
    drawn: false,
    deleted: false,
    startAt: '2024-01-01T00:00:00Z',
    endAt: '2024-12-31T23:59:59Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    files: []
  }

  const mockReservedNumbers = [
    {
      id: '1',
      raffleId: 'test-raffle-id',
      number: '1',
      status: 'RESERVED' as const,
      winner: false,
      reservedAt: '2024-01-01T00:00:00Z',
      reservedBy: 'user123',
      soldAt: null,
      soldBy: null,
      owner: null
    },
    {
      id: '2',
      raffleId: 'test-raffle-id',
      number: '2',
      status: 'RESERVED' as const,
      winner: false,
      reservedAt: '2024-01-01T00:00:00Z',
      reservedBy: 'user123',
      soldAt: null,
      soldBy: null,
      owner: null
    },
    {
      id: '3',
      raffleId: 'test-raffle-id',
      number: '3',
      status: 'RESERVED' as const,
      winner: false,
      reservedAt: '2024-01-01T00:00:00Z',
      reservedBy: 'user123',
      soldAt: null,
      soldBy: null,
      owner: null
    }
  ]

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    raffle: mockRaffle,
    onPurchaseSuccess: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockRaffleService.getPublicRaffleNumbers.mockResolvedValue({
      success: true,
      data: {
        rafflesNumbers: mockReservedNumbers,
        totalElements: 3,
        totalPages: 1,
        pageNumber: 0,
        pageSize: 20,
        hasNext: false,
        hasPrevious: false,
        first: true,
        last: true,
        numberOfElements: 3
      }
    })
    mockRaffleService.sellRaffleNumber.mockResolvedValue({
      success: true,
      data: undefined
    })
  })

  it('should render modal when open', () => {
    render(<RafflePurchaseModal {...defaultProps} />)
    
    expect(screen.getByText('Comprar Números Reservados')).toBeInTheDocument()
    expect(screen.getByText('Test Raffle')).toBeInTheDocument()
    expect(screen.getByText('A test raffle for testing purposes')).toBeInTheDocument()
    expect(screen.getByText('Prêmio:')).toBeInTheDocument()
    expect(screen.getByText('Test Prize')).toBeInTheDocument()
  })

  it('should not render modal when closed', () => {
    render(<RafflePurchaseModal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Comprar Números Reservados')).not.toBeInTheDocument()
  })

  it('should load reserved numbers on open and pre-select them', async () => {
    render(<RafflePurchaseModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(mockRaffleService.getPublicRaffleNumbers).toHaveBeenCalledWith('test-raffle-id', 0, 1000)
    })
    
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    
    // Verificar que todos os números estão pré-selecionados
    expect(screen.getByText('3 de 3 selecionados')).toBeInTheDocument()
    expect(screen.getByText('Confirmar Compra (3)')).toBeInTheDocument()
  })

  it('should show loading state while fetching numbers', () => {
    mockRaffleService.getPublicRaffleNumbers.mockImplementation(() => new Promise(() => {}))
    
    render(<RafflePurchaseModal {...defaultProps} />)
    
    expect(screen.getByText('Carregando números reservados...')).toBeInTheDocument()
  })

  it('should show error state when loading fails', async () => {
    mockRaffleService.getPublicRaffleNumbers.mockResolvedValue({
      success: false,
      error: 'Network error'
    })
    
    render(<RafflePurchaseModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar números reservados')).toBeInTheDocument()
    })
  })

  it('should show empty state when no numbers available', async () => {
    mockRaffleService.getPublicRaffleNumbers.mockResolvedValue({
      success: true,
      data: {
        rafflesNumbers: [],
        totalElements: 0,
        totalPages: 0,
        pageNumber: 0,
        pageSize: 20,
        hasNext: false,
        hasPrevious: false,
        first: true,
        last: true,
        numberOfElements: 0
      }
    })
    
    render(<RafflePurchaseModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Nenhum número reservado para compra')).toBeInTheDocument()
    })
  })

  it('should allow deselecting pre-selected numbers', async () => {
    render(<RafflePurchaseModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
    
    // Todos os números já estão pré-selecionados (3 de 3)
    expect(screen.getByText('3 de 3 selecionados')).toBeInTheDocument()
    expect(screen.getByText('Confirmar Compra (3)')).toBeInTheDocument()
    
    // Deselecionar um número
    fireEvent.click(screen.getByText('1'))
    
    expect(screen.getByText('2 de 3 selecionados')).toBeInTheDocument()
    expect(screen.getByText('Confirmar Compra (2)')).toBeInTheDocument()
  })

  it('should allow deselecting all numbers', async () => {
    render(<RafflePurchaseModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Desmarcar todos')).toBeInTheDocument()
    })
    
    // Todos os números já estão pré-selecionados
    expect(screen.getByText('3 de 3 selecionados')).toBeInTheDocument()
    
    // Desmarcar todos
    fireEvent.click(screen.getByText('Desmarcar todos'))
    
    expect(screen.getByText('0 de 3 selecionados')).toBeInTheDocument()
    expect(screen.getByText('Selecionar todos')).toBeInTheDocument()
  })

  it('should enable purchase button when numbers are pre-selected', async () => {
    render(<RafflePurchaseModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Confirmar Compra (3)')).toBeInTheDocument()
    })
    
    const purchaseButton = screen.getByText('Confirmar Compra (3)')
    expect(purchaseButton).not.toBeDisabled()
  })

  it('should handle successful purchase with pre-selected numbers', async () => {
    render(<RafflePurchaseModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
    
    // Os números já estão pré-selecionados, apenas confirmar a compra
    fireEvent.click(screen.getByText('Confirmar Compra (3)'))
    
    await waitFor(() => {
      expect(mockRaffleService.sellRaffleNumber).toHaveBeenCalledWith('test-raffle-id', 1)
      expect(mockRaffleService.sellRaffleNumber).toHaveBeenCalledWith('test-raffle-id', 2)
      expect(mockRaffleService.sellRaffleNumber).toHaveBeenCalledWith('test-raffle-id', 3)
    })
    
    await waitFor(() => {
      expect(screen.getByText('3 número(s) comprado(s) com sucesso!')).toBeInTheDocument()
    })
  })

  it('should handle partial purchase failure with pre-selected numbers', async () => {
    mockRaffleService.sellRaffleNumber
      .mockResolvedValueOnce({ success: true, data: undefined })
      .mockRejectedValueOnce(new Error('Purchase failed'))
      .mockResolvedValueOnce({ success: true, data: undefined })
    
    render(<RafflePurchaseModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
    
    // Os números já estão pré-selecionados, apenas confirmar a compra
    fireEvent.click(screen.getByText('Confirmar Compra (3)'))
    
    await waitFor(() => {
      expect(screen.getByText('2 número(s) comprado(s) com sucesso. 1 falharam.')).toBeInTheDocument()
    })
  })

  it('should handle complete purchase failure with pre-selected numbers', async () => {
    mockRaffleService.sellRaffleNumber.mockRejectedValue(new Error('Purchase failed'))
    
    render(<RafflePurchaseModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
    
    // Os números já estão pré-selecionados, apenas confirmar a compra
    fireEvent.click(screen.getByText('Confirmar Compra (3)'))
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao comprar os números selecionados')).toBeInTheDocument()
    })
  })

  it('should close modal on escape key', async () => {
    const onClose = jest.fn()
    render(<RafflePurchaseModal {...defaultProps} onClose={onClose} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(onClose).toHaveBeenCalled()
  })

  it('should close modal on close button click', async () => {
    const onClose = jest.fn()
    render(<RafflePurchaseModal {...defaultProps} onClose={onClose} />)
    
    // O botão de fechar é o primeiro botão (sem texto)
    const closeButton = screen.getAllByRole('button')[0]
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalled()
  })

  it('should close modal on cancel button click', async () => {
    const onClose = jest.fn()
    render(<RafflePurchaseModal {...defaultProps} onClose={onClose} />)
    
    fireEvent.click(screen.getByText('Cancelar'))
    
    expect(onClose).toHaveBeenCalled()
  })

  it('should call onPurchaseSuccess after successful purchase', async () => {
    const onPurchaseSuccess = jest.fn()
    render(<RafflePurchaseModal {...defaultProps} onPurchaseSuccess={onPurchaseSuccess} />)
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
    
    // Os números já estão pré-selecionados, apenas confirmar a compra
    fireEvent.click(screen.getByText('Confirmar Compra (3)'))
    
    await waitFor(() => {
      expect(onPurchaseSuccess).toHaveBeenCalled()
    }, { timeout: 2000 })
  })

  it('should refresh numbers when refresh button is clicked', async () => {
    render(<RafflePurchaseModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Atualizar')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Atualizar'))
    
    expect(mockRaffleService.getPublicRaffleNumbers).toHaveBeenCalledTimes(2)
  })

  it('should display selected numbers with yellow styling', async () => {
    render(<RafflePurchaseModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
    
    // Verificar que os números selecionados têm a classe de cor amarela
    const numberButton1 = screen.getByText('1').closest('button')
    expect(numberButton1).toHaveClass('bg-yellow-100', 'border-yellow-300', 'text-yellow-800')
    
    const numberButton2 = screen.getByText('2').closest('button')
    expect(numberButton2).toHaveClass('bg-yellow-100', 'border-yellow-300', 'text-yellow-800')
    
    const numberButton3 = screen.getByText('3').closest('button')
    expect(numberButton3).toHaveClass('bg-yellow-100', 'border-yellow-300', 'text-yellow-800')
  })

  it('should show hover effect with yellow border on unselected numbers', async () => {
    render(<RafflePurchaseModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
    
    // Deselecionar um número primeiro
    fireEvent.click(screen.getByText('1'))
    
    // Verificar que o número deselecionado tem hover amarelo
    const numberButton = screen.getByText('1').closest('button')
    expect(numberButton).toHaveClass('hover:border-yellow-300')
  })
})
