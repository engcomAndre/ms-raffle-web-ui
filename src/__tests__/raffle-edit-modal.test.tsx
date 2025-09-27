import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RaffleEditModal } from '@/components/RaffleEditModal'
import { raffleService } from '@/services/raffleService'
import { RaffleResponse } from '@/types/raffle'

// Mock do raffleService
jest.mock('@/services/raffleService', () => ({
  raffleService: {
    updateRaffle: jest.fn()
  }
}))

const mockRaffle: RaffleResponse = {
  id: 'raffle-123',
  title: 'Rifa Teste',
  description: 'Descrição da rifa',
  prize: 'Prêmio Teste',
  maxNumbers: 100,
  startAt: '2024-12-01T10:00:00Z',
  endAt: '2024-12-02T10:00:00Z',
  status: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  totalNumbers: 100,
  soldNumbers: 0,
  reservedNumbers: 0,
  availableNumbers: 100
}

describe('RaffleEditModal', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset body overflow
    document.body.style.overflow = 'unset'
  })

  afterEach(() => {
    // Cleanup body overflow
    document.body.style.overflow = 'unset'
  })

  it('não deve renderizar quando isOpen é false', () => {
    render(
      <RaffleEditModal
        isOpen={false}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.queryByText('Editar Rifa')).not.toBeInTheDocument()
  })

  it('deve renderizar o modal quando isOpen é true', () => {
    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByText('Editar Rifa')).toBeInTheDocument()
    expect(screen.getByLabelText('Título *')).toBeInTheDocument()
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument()
    expect(screen.getByLabelText('Prêmio *')).toBeInTheDocument()
    expect(screen.getByLabelText('Número máximo de números *')).toBeInTheDocument()
    expect(screen.getByLabelText('Data de início *')).toBeInTheDocument()
    expect(screen.getByLabelText('Data de fim *')).toBeInTheDocument()
  })

  it('deve preencher os campos com os dados da rifa', () => {
    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByDisplayValue('Rifa Teste')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Descrição da rifa')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Prêmio Teste')).toBeInTheDocument()
    expect(screen.getByDisplayValue(100)).toBeInTheDocument()
  })

  it('deve atualizar os campos quando o usuário digita', () => {
    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const titleInput = screen.getByLabelText('Título *')
    fireEvent.change(titleInput, { target: { value: 'Novo Título' } })

    expect(titleInput).toHaveValue('Novo Título')
  })

  it('deve fechar o modal quando clicar no botão X', () => {
    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const closeButton = screen.getByRole('button', { name: 'Fechar modal' }) // Botão X
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('deve fechar o modal quando clicar no overlay', () => {
    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const overlay = screen.getByTestId('overlay')
    fireEvent.click(overlay)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('deve fechar o modal quando pressionar ESC', () => {
    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('deve definir overflow hidden no body quando modal abrir', () => {
    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('deve restaurar overflow do body quando modal fechar', () => {
    const { unmount } = render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    unmount()

    expect(document.body.style.overflow).toBe('unset')
  })

  it('deve atualizar rifa com sucesso', async () => {
    ;(raffleService.updateRaffle as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'raffle-123' }
    })

    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const submitButton = screen.getByRole('button', { name: 'Salvar Alterações' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(raffleService.updateRaffle).toHaveBeenCalledWith('raffle-123', {
        title: 'Rifa Teste',
        description: 'Descrição da rifa',
        prize: 'Prêmio Teste',
        maxNumbers: 100,
        startAt: '2024-12-01T10:00',
        endAt: '2024-12-02T10:00'
      })
    })

    expect(mockOnSuccess).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('deve mostrar erro quando atualização falha', async () => {
    ;(raffleService.updateRaffle as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Erro ao atualizar rifa',
      message: 'Erro de validação'
    })

    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const submitButton = screen.getByRole('button', { name: 'Salvar Alterações' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Erro de validação')).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('deve mostrar erro genérico quando ocorre exceção', async () => {
    ;(raffleService.updateRaffle as jest.Mock).mockRejectedValue(new Error('Erro de rede'))

    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const submitButton = screen.getByRole('button', { name: 'Salvar Alterações' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Erro inesperado ao atualizar rifa')).toBeInTheDocument()
    })
  })

  it('deve mostrar loading durante atualização', async () => {
    ;(raffleService.updateRaffle as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    )

    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const submitButton = screen.getByRole('button', { name: 'Salvar Alterações' })
    fireEvent.click(submitButton)

    expect(screen.getByText('Salvando...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('deve desabilitar botões durante loading', async () => {
    ;(raffleService.updateRaffle as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    )

    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const submitButton = screen.getByRole('button', { name: 'Salvar Alterações' })
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
    
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('não deve fechar modal durante loading', async () => {
    ;(raffleService.updateRaffle as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    )

    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const submitButton = screen.getByRole('button', { name: 'Salvar Alterações' })
    fireEvent.click(submitButton)

    const closeButton = screen.getByRole('button', { name: 'Fechar modal' }) // Botão X
    fireEvent.click(closeButton)

    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('deve cancelar quando clicar no botão cancelar', () => {
    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('deve limpar erro quando modal abrir novamente', () => {
    const { rerender } = render(
      <RaffleEditModal
        isOpen={false}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    // Simular erro anterior
    rerender(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    // Abrir modal novamente
    rerender(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={mockRaffle}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.queryByText(/erro/i)).not.toBeInTheDocument()
  })

  it('deve lidar com rifa sem dados opcionais', () => {
    const raffleWithoutOptionalData: RaffleResponse = {
      ...mockRaffle,
      description: undefined,
      startAt: undefined,
      endAt: undefined
    }

    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={raffleWithoutOptionalData}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByDisplayValue('Rifa Teste')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Prêmio Teste')).toBeInTheDocument()
    expect(screen.getByDisplayValue(100)).toBeInTheDocument()
  })

  it('deve converter datas corretamente', () => {
    const raffleWithDates: RaffleResponse = {
      ...mockRaffle,
      startAt: '2024-12-01T10:30:00Z',
      endAt: '2024-12-02T15:45:00Z'
    }

    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={raffleWithDates}
        onSuccess={mockOnSuccess}
      />
    )

    const startAtInput = screen.getByLabelText('Data de início *')
    const endAtInput = screen.getByLabelText('Data de fim *')

    expect(startAtInput).toHaveValue('2024-12-01T10:30')
    expect(endAtInput).toHaveValue('2024-12-02T15:45')
  })

  it('deve não fazer nada se raffle for null', async () => {
    ;(raffleService.updateRaffle as jest.Mock).mockResolvedValue({
      success: true
    })

    render(
      <RaffleEditModal
        isOpen={true}
        onClose={mockOnClose}
        raffle={null}
        onSuccess={mockOnSuccess}
      />
    )

    const submitButton = screen.getByRole('button', { name: 'Salvar Alterações' })
    fireEvent.click(submitButton)

    expect(raffleService.updateRaffle).not.toHaveBeenCalled()
  })
})
