import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import CreateRafflePage from '@/app/create-raffle/page'
import { raffleService } from '@/services/raffleService'

// Mock do useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock do raffleService
jest.mock('@/services/raffleService', () => ({
  raffleService: {
    createRaffle: jest.fn()
  }
}))

// Mock do DashboardLayout
jest.mock('@/components/DashboardLayout', () => ({
  DashboardLayout: function MockDashboardLayout({ children, currentPage }: { children: React.ReactNode; currentPage: string }) {
    return (
      <div data-testid="dashboard-layout" data-current-page={currentPage}>
        {children}
      </div>
    )
  }
}))

const mockPush = jest.fn()
const mockBack = jest.fn()

describe('CreateRafflePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack
    })
  })

  it('deve renderizar o formulário de criação de rifa', () => {
    render(<CreateRafflePage />)
    
    expect(screen.getByText('Criar Nova Rifa')).toBeInTheDocument()
    expect(screen.getByText('Preencha os dados abaixo para criar sua rifa e começar a receber participantes')).toBeInTheDocument()
    expect(screen.getByLabelText('Título da Rifa *')).toBeInTheDocument()
    expect(screen.getByLabelText('Prêmio *')).toBeInTheDocument()
    expect(screen.getByLabelText('Número Máximo de Números *')).toBeInTheDocument()
    expect(screen.getByLabelText('Data de Início *')).toBeInTheDocument()
    expect(screen.getByLabelText('Data de Fim *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Criar Rifa' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('deve atualizar os campos do formulário quando o usuário digita', () => {
    render(<CreateRafflePage />)
    
    const titleInput = screen.getByLabelText('Título da Rifa *')
    const prizeInput = screen.getByLabelText('Prêmio *')
    const maxNumbersInput = screen.getByLabelText('Número Máximo de Números *')
    
    fireEvent.change(titleInput, { target: { value: 'Rifa do iPhone' } })
    fireEvent.change(prizeInput, { target: { value: 'iPhone 15 Pro Max' } })
    fireEvent.change(maxNumbersInput, { target: { value: '1000' } })
    
    expect(titleInput).toHaveValue('Rifa do iPhone')
    expect(prizeInput).toHaveValue('iPhone 15 Pro Max')
    expect(maxNumbersInput).toHaveValue(1000)
  })

  it('deve mostrar loading durante criação da rifa', async () => {
    ;(raffleService.createRaffle as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    )

    render(<CreateRafflePage />)
    
    const titleInput = screen.getByLabelText('Título da Rifa *')
    const prizeInput = screen.getByLabelText('Prêmio *')
    const maxNumbersInput = screen.getByLabelText('Número Máximo de Números *')
    const startAtInput = screen.getByLabelText('Data de Início *')
    const endAtInput = screen.getByLabelText('Data de Fim *')
    
    fireEvent.change(titleInput, { target: { value: 'Rifa Teste' } })
    fireEvent.change(prizeInput, { target: { value: 'Prêmio Teste' } })
    fireEvent.change(maxNumbersInput, { target: { value: '100' } })
    fireEvent.change(startAtInput, { target: { value: '2024-12-01T10:00' } })
    fireEvent.change(endAtInput, { target: { value: '2024-12-02T10:00' } })
    
    const submitButton = screen.getByRole('button', { name: 'Criar Rifa' })
    fireEvent.click(submitButton)
    
    expect(screen.getByText('Criando...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('deve chamar router.back() quando cancelar', () => {
    render(<CreateRafflePage />)
    
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
    fireEvent.click(cancelButton)
    
    expect(mockBack).toHaveBeenCalled()
  })

  it('deve desabilitar botões durante loading', async () => {
    ;(raffleService.createRaffle as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    )

    render(<CreateRafflePage />)
    
    const titleInput = screen.getByLabelText('Título da Rifa *')
    const prizeInput = screen.getByLabelText('Prêmio *')
    const maxNumbersInput = screen.getByLabelText('Número Máximo de Números *')
    const startAtInput = screen.getByLabelText('Data de Início *')
    const endAtInput = screen.getByLabelText('Data de Fim *')
    
    fireEvent.change(titleInput, { target: { value: 'Rifa Teste' } })
    fireEvent.change(prizeInput, { target: { value: 'Prêmio Teste' } })
    fireEvent.change(maxNumbersInput, { target: { value: '100' } })
    fireEvent.change(startAtInput, { target: { value: '2024-12-01T10:00' } })
    fireEvent.change(endAtInput, { target: { value: '2024-12-02T10:00' } })
    
    const submitButton = screen.getByRole('button', { name: 'Criar Rifa' })
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
    
    fireEvent.click(submitButton)
    
    expect(submitButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('deve criar rifa com sucesso e mostrar tela de sucesso', async () => {
    ;(raffleService.createRaffle as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'raffle-123' }
    })

    render(<CreateRafflePage />)
    
    const titleInput = screen.getByLabelText('Título da Rifa *')
    const prizeInput = screen.getByLabelText('Prêmio *')
    const maxNumbersInput = screen.getByLabelText('Número Máximo de Números *')
    const startAtInput = screen.getByLabelText('Data de Início *')
    const endAtInput = screen.getByLabelText('Data de Fim *')
    
    fireEvent.change(titleInput, { target: { value: 'Rifa Teste' } })
    fireEvent.change(prizeInput, { target: { value: 'Prêmio Teste' } })
    fireEvent.change(maxNumbersInput, { target: { value: '100' } })
    fireEvent.change(startAtInput, { target: { value: '2024-12-01T10:00' } })
    fireEvent.change(endAtInput, { target: { value: '2024-12-02T10:00' } })
    
    const submitButton = screen.getByRole('button', { name: 'Criar Rifa' })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Rifa Criada com Sucesso!')).toBeInTheDocument()
      expect(screen.getByText('Sua rifa foi criada e está pronta para receber participantes.')).toBeInTheDocument()
      expect(screen.getByText('Redirecionando para suas rifas...')).toBeInTheDocument()
    })
  })

  it('deve redirecionar para playground após sucesso', async () => {
    jest.useFakeTimers()
    ;(raffleService.createRaffle as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'raffle-123' }
    })

    render(<CreateRafflePage />)
    
    const titleInput = screen.getByLabelText('Título da Rifa *')
    const prizeInput = screen.getByLabelText('Prêmio *')
    const maxNumbersInput = screen.getByLabelText('Número Máximo de Números *')
    const startAtInput = screen.getByLabelText('Data de Início *')
    const endAtInput = screen.getByLabelText('Data de Fim *')
    
    fireEvent.change(titleInput, { target: { value: 'Rifa Teste' } })
    fireEvent.change(prizeInput, { target: { value: 'Prêmio Teste' } })
    fireEvent.change(maxNumbersInput, { target: { value: '100' } })
    fireEvent.change(startAtInput, { target: { value: '2024-12-01T10:00' } })
    fireEvent.change(endAtInput, { target: { value: '2024-12-02T10:00' } })
    
    const submitButton = screen.getByRole('button', { name: 'Criar Rifa' })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Rifa Criada com Sucesso!')).toBeInTheDocument()
    })
    
    jest.advanceTimersByTime(2000)
    
    expect(mockPush).toHaveBeenCalledWith('/playground')
    
    jest.useRealTimers()
  })

  it('deve mostrar erro quando criação falha', async () => {
    ;(raffleService.createRaffle as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Erro ao criar rifa'
    })

    render(<CreateRafflePage />)
    
    const titleInput = screen.getByLabelText('Título da Rifa *')
    const prizeInput = screen.getByLabelText('Prêmio *')
    const maxNumbersInput = screen.getByLabelText('Número Máximo de Números *')
    const startAtInput = screen.getByLabelText('Data de Início *')
    const endAtInput = screen.getByLabelText('Data de Fim *')
    
    fireEvent.change(titleInput, { target: { value: 'Rifa Teste' } })
    fireEvent.change(prizeInput, { target: { value: 'Prêmio Teste' } })
    fireEvent.change(maxNumbersInput, { target: { value: '100' } })
    fireEvent.change(startAtInput, { target: { value: '2024-12-01T10:00' } })
    fireEvent.change(endAtInput, { target: { value: '2024-12-02T10:00' } })
    
    const submitButton = screen.getByRole('button', { name: 'Criar Rifa' })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao criar rifa')).toBeInTheDocument()
    })
  })

  it('deve mostrar erro genérico quando ocorre exceção', async () => {
    ;(raffleService.createRaffle as jest.Mock).mockRejectedValue(new Error('Erro de rede'))

    render(<CreateRafflePage />)
    
    const titleInput = screen.getByLabelText('Título da Rifa *')
    const prizeInput = screen.getByLabelText('Prêmio *')
    const maxNumbersInput = screen.getByLabelText('Número Máximo de Números *')
    const startAtInput = screen.getByLabelText('Data de Início *')
    const endAtInput = screen.getByLabelText('Data de Fim *')
    
    fireEvent.change(titleInput, { target: { value: 'Rifa Teste' } })
    fireEvent.change(prizeInput, { target: { value: 'Prêmio Teste' } })
    fireEvent.change(maxNumbersInput, { target: { value: '100' } })
    fireEvent.change(startAtInput, { target: { value: '2024-12-01T10:00' } })
    fireEvent.change(endAtInput, { target: { value: '2024-12-02T10:00' } })
    
    const submitButton = screen.getByRole('button', { name: 'Criar Rifa' })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Erro de rede')).toBeInTheDocument()
    })
  })

  it('deve mostrar erro desconhecido quando ocorre exceção sem mensagem', async () => {
    ;(raffleService.createRaffle as jest.Mock).mockRejectedValue('Erro sem mensagem')

    render(<CreateRafflePage />)
    
    const titleInput = screen.getByLabelText('Título da Rifa *')
    const prizeInput = screen.getByLabelText('Prêmio *')
    const maxNumbersInput = screen.getByLabelText('Número Máximo de Números *')
    const startAtInput = screen.getByLabelText('Data de Início *')
    const endAtInput = screen.getByLabelText('Data de Fim *')
    
    fireEvent.change(titleInput, { target: { value: 'Rifa Teste' } })
    fireEvent.change(prizeInput, { target: { value: 'Prêmio Teste' } })
    fireEvent.change(maxNumbersInput, { target: { value: '100' } })
    fireEvent.change(startAtInput, { target: { value: '2024-12-01T10:00' } })
    fireEvent.change(endAtInput, { target: { value: '2024-12-02T10:00' } })
    
    const submitButton = screen.getByRole('button', { name: 'Criar Rifa' })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Erro desconhecido')).toBeInTheDocument()
    })
  })
})

