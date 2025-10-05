import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RaffleSaleModal } from '@/components/RaffleSaleModal'
import { RaffleResponse } from '@/types/raffle'
import { raffleService } from '@/services/raffleService'

// Mock do raffleService
jest.mock('@/services/raffleService', () => ({
  raffleService: {
    getRaffleNumbers: jest.fn(),
    sellRaffleNumber: jest.fn()
  }
}))

// Mock do componente Toast
jest.mock('@/components/Toast', () => ({
  Toast: ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div data-testid="toast" onClick={onClose}>
      {message}
    </div>
  )
}))

const mockRaffle: RaffleResponse = {
  id: 'test-raffle-id',
  title: 'Rifa de Teste',
  description: 'Descrição da rifa de teste',
  prize: 'Prêmio de teste',
  maxNumbers: 100,
  startAt: '2024-01-01T00:00:00Z',
  endAt: '2024-12-31T23:59:59Z',
  active: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const mockReservedNumbers = [
  {
    raffleId: 'test-raffle-id',
    number: '1',
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
    number: '2',
    status: 'RESERVED' as const,
    winner: false,
    reservedAt: '2024-01-01T00:00:00Z',
    reservedBy: 'user2',
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
    reservedBy: 'user3',
    soldAt: null,
    soldBy: null,
    owner: null
  }
]

describe('RaffleSaleModal', () => {
  const mockOnClose = jest.fn()
  const mockOnSaleSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(raffleService.getRaffleNumbers as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        rafflesNumbers: mockReservedNumbers,
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

  it('should not render when isOpen is false', () => {
    render(
      <RaffleSaleModal
        isOpen={false}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    expect(screen.queryByText('Vender Números Reservados')).not.toBeInTheDocument()
  })

  it('should render modal when isOpen is true', async () => {
    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    expect(screen.getByText('Vender Números Reservados')).toBeInTheDocument()
    expect(screen.getByText('Rifa de Teste')).toBeInTheDocument()
    expect(screen.getByText('Descrição da rifa de teste')).toBeInTheDocument()
    
    // Aguardar carregamento dos números
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  it('should show loading state initially', () => {
    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    expect(screen.getByText('Carregando números reservados...')).toBeInTheDocument()
  })

  it('should show error state when loading fails', async () => {
    ;(raffleService.getRaffleNumbers as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Erro ao carregar números'
    })

    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar números reservados')).toBeInTheDocument()
      expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
    })
  })

  it('should show empty state when no reserved numbers', async () => {
    ;(raffleService.getRaffleNumbers as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        rafflesNumbers: [],
        totalElements: 0
      }
    })

    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Nenhum número reservado encontrado')).toBeInTheDocument()
    })
  })

  it('should allow selecting and deselecting numbers', async () => {
    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    // Todos os números já estão pré-selecionados (3 de 3)
    expect(screen.getByText('3 de 3 selecionados')).toBeInTheDocument()

    // Deselecionar número 1
    fireEvent.click(screen.getByText('1'))
    expect(screen.getByText('2 de 3 selecionados')).toBeInTheDocument()

    // Deselecionar número 2
    fireEvent.click(screen.getByText('2'))
    expect(screen.getByText('1 de 3 selecionados')).toBeInTheDocument()

    // Selecionar número 1 novamente
    fireEvent.click(screen.getByText('1'))
    expect(screen.getByText('2 de 3 selecionados')).toBeInTheDocument()
  })

  it('should allow selecting all numbers', async () => {
    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Desmarcar todos')).toBeInTheDocument()
    })

    // Todos já estão selecionados inicialmente
    expect(screen.getByText('3 de 3 selecionados')).toBeInTheDocument()

    // Desmarcar todos
    fireEvent.click(screen.getByText('Desmarcar todos'))
    expect(screen.getByText('0 de 3 selecionados')).toBeInTheDocument()
    expect(screen.getByText('Selecionar todos')).toBeInTheDocument()

    // Selecionar todos novamente
    fireEvent.click(screen.getByText('Selecionar todos'))
    expect(screen.getByText('3 de 3 selecionados')).toBeInTheDocument()
    expect(screen.getByText('Desmarcar todos')).toBeInTheDocument()
  })

  it('should enable confirm button when numbers are selected', async () => {
    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    // Todos os números já estão pré-selecionados
    const confirmButton = screen.getByText('Confirmar Venda (3)')
    expect(confirmButton).not.toBeDisabled()
  })


  it('should successfully sell selected numbers', async () => {
    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    // Deselecionar um número (todos já estão selecionados)
    fireEvent.click(screen.getByText('1'))

    // Confirmar venda dos números restantes
    fireEvent.click(screen.getByText('Confirmar Venda (2)'))

    await waitFor(() => {
      expect(raffleService.sellRaffleNumber).toHaveBeenCalledTimes(2)
      expect(raffleService.sellRaffleNumber).toHaveBeenCalledWith('test-raffle-id', 2)
      expect(raffleService.sellRaffleNumber).toHaveBeenCalledWith('test-raffle-id', 3)
    })

    await waitFor(() => {
      expect(screen.getByText('2 número(s) vendido(s) com sucesso!')).toBeInTheDocument()
    })
  })

  it('should handle partial sale success', async () => {
    ;(raffleService.sellRaffleNumber as jest.Mock)
      .mockResolvedValueOnce({ success: true })
      .mockRejectedValueOnce(new Error('Erro na venda'))

    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    // Deselecionar um número (todos já estão selecionados)
    fireEvent.click(screen.getByText('1'))

    // Confirmar venda
    fireEvent.click(screen.getByText('Confirmar Venda (2)'))

    await waitFor(() => {
      expect(screen.getByText('1 número(s) vendido(s) com sucesso. 1 falharam.')).toBeInTheDocument()
    })
  })

  it('should handle complete sale failure', async () => {
    ;(raffleService.sellRaffleNumber as jest.Mock).mockRejectedValue(new Error('Erro na venda'))

    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    // Deselecionar dois números (todos já estão selecionados)
    fireEvent.click(screen.getByText('1'))
    fireEvent.click(screen.getByText('2'))

    // Confirmar venda
    fireEvent.click(screen.getByText('Confirmar Venda (1)'))

    await waitFor(() => {
      expect(screen.getByText('Erro ao vender os números selecionados')).toBeInTheDocument()
    })
  })

  it('should close modal when pressing Escape key', async () => {
    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    // Simular tecla Escape
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should close modal when clicking close button', async () => {
    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    // O botão de fechar é o primeiro botão (ícone X)
    const closeButton = screen.getAllByRole('button')[0]
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should close modal when clicking cancel button', async () => {
    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    const cancelButton = screen.getByText('Cancelar')
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should call onSaleSuccess after successful sale', async () => {
    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    // Deselecionar dois números (todos já estão selecionados)
    fireEvent.click(screen.getByText('1'))
    fireEvent.click(screen.getByText('2'))

    // Confirmar venda
    fireEvent.click(screen.getByText('Confirmar Venda (1)'))

    await waitFor(() => {
      expect(screen.getByText('1 número(s) vendido(s) com sucesso!')).toBeInTheDocument()
    })

    // Aguardar fechamento automático
    await waitFor(() => {
      expect(mockOnSaleSuccess).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    }, { timeout: 2000 })
  })

  it('should refresh numbers when clicking refresh button', async () => {
    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Atualizar')).toBeInTheDocument()
    })

    const refreshButton = screen.getByText('Atualizar')
    fireEvent.click(refreshButton)

    expect(raffleService.getRaffleNumbers).toHaveBeenCalledTimes(2)
  })

  it('should show selling state during sale process', async () => {
    ;(raffleService.sellRaffleNumber as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    )

    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    // Deselecionar dois números (todos já estão selecionados)
    fireEvent.click(screen.getByText('1'))
    fireEvent.click(screen.getByText('2'))

    // Confirmar venda
    fireEvent.click(screen.getByText('Confirmar Venda (1)'))

    // Verificar estado de venda
    expect(screen.getByText('Vendendo...')).toBeInTheDocument()
    expect(screen.getByText('Vendendo...')).toBeDisabled()
  })

  it('should pre-select all reserved numbers on load', async () => {
    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    // Verificar que todos os números estão pré-selecionados
    expect(screen.getByText('3 de 3 selecionados')).toBeInTheDocument()
    expect(screen.getByText('Confirmar Venda (3)')).toBeInTheDocument()
  })

  it('should display selected numbers with yellow styling', async () => {
    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

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
    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    // Deselecionar um número primeiro
    fireEvent.click(screen.getByText('1'))

    // Verificar que o número deselecionado tem hover amarelo
    const numberButton = screen.getByText('1').closest('button')
    expect(numberButton).toHaveClass('hover:border-yellow-300')
  })

  it('should allow deselecting pre-selected numbers', async () => {
    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    // Todos os números já estão pré-selecionados (3 de 3)
    expect(screen.getByText('3 de 3 selecionados')).toBeInTheDocument()
    expect(screen.getByText('Confirmar Venda (3)')).toBeInTheDocument()

    // Deselecionar um número
    fireEvent.click(screen.getByText('1'))

    expect(screen.getByText('2 de 3 selecionados')).toBeInTheDocument()
    expect(screen.getByText('Confirmar Venda (2)')).toBeInTheDocument()
  })

  it('should allow deselecting all pre-selected numbers', async () => {
    render(
      <RaffleSaleModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSaleSuccess={mockOnSaleSuccess}
      />
    )

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
})
