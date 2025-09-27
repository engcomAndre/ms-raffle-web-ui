import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RaffleEditModal } from '@/components/RaffleEditModal'
import { RaffleResponse } from '@/types/raffle'
import { raffleService } from '@/services/raffleService'

// Mock do raffleService
jest.mock('@/services/raffleService', () => ({
  raffleService: {
    updateRaffle: jest.fn(),
    incrementRaffleNumbers: jest.fn()
  }
}))

const mockRaffleService = raffleService as jest.Mocked<typeof raffleService>

const mockRaffle: RaffleResponse = {
  id: '1',
  title: 'Rifa Teste',
  description: 'Descrição da rifa',
  prize: 'Prêmio da rifa',
  maxNumbers: 100,
  startAt: '2024-01-01T10:00:00Z',
  endAt: '2024-01-31T23:59:59Z',
  active: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: 'user1',
  files: []
}

describe('RaffleEditModal - Incremento de Números', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockRaffleService.updateRaffle.mockResolvedValue({
      success: true,
      data: mockRaffle
    })
    mockRaffleService.incrementRaffleNumbers.mockResolvedValue({
      success: true,
      data: undefined
    })
  })

  it('deve exibir o valor atual de números no label', () => {
    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByText('(Atual: 100)')).toBeInTheDocument()
  })

  it('deve mostrar validação visual quando o valor for menor que o atual', async () => {
    const user = userEvent.setup()
    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const maxNumbersInput = screen.getByLabelText(/Número máximo de números/)
    await user.clear(maxNumbersInput)
    await user.type(maxNumbersInput, '50')

    expect(maxNumbersInput).toHaveClass('border-red-300', 'bg-red-50')
    expect(screen.getByText('⚠️ Não é possível diminuir o número de números. Apenas incrementos são permitidos.')).toBeInTheDocument()
  })

  it('deve mostrar validação visual quando o valor for maior que o atual', async () => {
    const user = userEvent.setup()
    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const maxNumbersInput = screen.getByLabelText(/Número máximo de números/)
    await user.clear(maxNumbersInput)
    await user.type(maxNumbersInput, '150')

    expect(maxNumbersInput).toHaveClass('border-green-300', 'bg-green-50')
    expect(screen.getByText('✅ 50 novos números serão adicionados.')).toBeInTheDocument()
  })

  it('deve exibir botão de incremento quando o valor for maior que o atual', async () => {
    const user = userEvent.setup()
    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const maxNumbersInput = screen.getByLabelText(/Número máximo de números/)
    await user.clear(maxNumbersInput)
    await user.type(maxNumbersInput, '150')

    expect(screen.getByText('+50')).toBeInTheDocument()
  })

  it('deve chamar o endpoint de incremento quando o botão for clicado', async () => {
    const user = userEvent.setup()
    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const maxNumbersInput = screen.getByLabelText(/Número máximo de números/)
    await user.clear(maxNumbersInput)
    await user.type(maxNumbersInput, '150')

    const incrementButton = screen.getByText('+50')
    await user.click(incrementButton)

    expect(mockRaffleService.incrementRaffleNumbers).toHaveBeenCalledWith('1', 50)
  })

  it('deve exibir mensagem de sucesso após incremento bem-sucedido', async () => {
    const user = userEvent.setup()
    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const maxNumbersInput = screen.getByLabelText(/Número máximo de números/)
    await user.clear(maxNumbersInput)
    await user.type(maxNumbersInput, '150')

    const incrementButton = screen.getByText('+50')
    await user.click(incrementButton)

    await waitFor(() => {
      expect(screen.getByText('Números incrementados com sucesso! 50 novos números foram adicionados.')).toBeInTheDocument()
    })
  })

  it('deve exibir mensagem de erro se o incremento falhar', async () => {
    const user = userEvent.setup()
    mockRaffleService.incrementRaffleNumbers.mockResolvedValue({
      success: false,
      error: 'Erro ao incrementar números',
      message: 'Erro interno do servidor'
    })

    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const maxNumbersInput = screen.getByLabelText(/Número máximo de números/)
    await user.clear(maxNumbersInput)
    await user.type(maxNumbersInput, '150')

    const incrementButton = screen.getByText('+50')
    await user.click(incrementButton)

    await waitFor(() => {
      expect(screen.getByText('Erro interno do servidor')).toBeInTheDocument()
    })
  })

  it('deve desabilitar campos durante o incremento', async () => {
    const user = userEvent.setup()
    mockRaffleService.incrementRaffleNumbers.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true, data: undefined }), 100))
    )

    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const maxNumbersInput = screen.getByLabelText(/Número máximo de números/)
    await user.clear(maxNumbersInput)
    await user.type(maxNumbersInput, '150')

    const incrementButton = screen.getByText('+50')
    await user.click(incrementButton)

    expect(screen.getByText('Incrementando...')).toBeInTheDocument()
    expect(maxNumbersInput).toBeDisabled()
    expect(screen.getByText('Cancelar')).toBeDisabled()
    expect(screen.getByText('Salvar Alterações')).toBeDisabled()
  })

  it('deve impedir decremento no submit', async () => {
    const user = userEvent.setup()
    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const maxNumbersInput = screen.getByLabelText(/Número máximo de números/)
    await user.clear(maxNumbersInput)
    await user.type(maxNumbersInput, '50')

    const submitButton = screen.getByText('Salvar Alterações')
    await user.click(submitButton)

    expect(screen.getByText('Não é possível diminuir o número de números. Apenas incrementos são permitidos.')).toBeInTheDocument()
    expect(mockRaffleService.updateRaffle).not.toHaveBeenCalled()
  })

  it('deve atualizar o valor original após incremento bem-sucedido', async () => {
    const user = userEvent.setup()
    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const maxNumbersInput = screen.getByLabelText(/Número máximo de números/)
    await user.clear(maxNumbersInput)
    await user.type(maxNumbersInput, '150')

    const incrementButton = screen.getByText('+50')
    await user.click(incrementButton)

    await waitFor(() => {
      expect(screen.getByText('(Atual: 150)')).toBeInTheDocument()
    })
  })
})