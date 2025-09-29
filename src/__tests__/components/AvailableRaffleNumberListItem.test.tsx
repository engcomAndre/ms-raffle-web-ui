import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AvailableRaffleNumberListItem } from '@/components/AvailableRaffleNumberListItem'
import { RaffleNumberItemResponse } from '@/types/raffle'
import { raffleService } from '@/services/raffleService'

// Mock do raffleService
jest.mock('@/services/raffleService', () => ({
  raffleService: {
    reserveRaffleNumber: jest.fn(),
    unreserveRaffleNumber: jest.fn()
  }
}))

// Mock do localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('AvailableRaffleNumberListItem', () => {
  const mockNumberItem: RaffleNumberItemResponse = {
    raffleId: 'test-raffle-id',
    number: '123',
    status: 'ACTIVE',
    winner: false,
    reservedAt: null,
    reservedBy: null,
    soldAt: null,
    soldBy: null,
    owner: null
  }

  const mockProps = {
    numberItem: mockNumberItem,
    raffleId: 'test-raffle-id',
    onReserveSuccess: jest.fn(),
    onReserveError: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue('testuser')
  })

  describe('Unreserve functionality', () => {
    it('should show unreserve option when number is reserved', () => {
      const reservedNumberItem = {
        ...mockNumberItem,
        status: 'RESERVED' as const,
        reservedBy: 'testuser'
      }

      render(<AvailableRaffleNumberListItem {...mockProps} numberItem={reservedNumberItem} />)
      
      // Verificar se o número tem a classe correta (laranja para todos os reservados)
      const numberElement = screen.getByText('123').closest('div')?.parentElement
      expect(numberElement).toHaveClass('bg-orange-100')
      
      // Verificar se tem o ícone de unreserve (frontend sempre mostra, backend decide)
      expect(screen.getByTitle('Clique para desreservar')).toBeInTheDocument()
    })

    it('should show unreserve option for any reserved number (backend decides)', () => {
      const reservedNumberItem = {
        ...mockNumberItem,
        status: 'RESERVED' as const,
        reservedBy: 'otheruser'
      }

      render(<AvailableRaffleNumberListItem {...mockProps} numberItem={reservedNumberItem} />)
      
      // Verificar se o número tem a classe correta (laranja para todos os reservados)
      const numberElement = screen.getByText('123').closest('div')?.parentElement
      expect(numberElement).toHaveClass('bg-orange-100')
      
      // Verificar se tem o ícone de unreserve (frontend sempre mostra, backend decide)
      expect(screen.getByTitle('Clique para desreservar')).toBeInTheDocument()
    })

    it('should call unreserveRaffleNumber when clicking on reserved number', async () => {
      const reservedNumberItem = {
        ...mockNumberItem,
        status: 'RESERVED' as const,
        reservedBy: 'testuser'
      }

      const mockUnreserve = raffleService.unreserveRaffleNumber as jest.Mock
      mockUnreserve.mockResolvedValue({ success: true })

      render(<AvailableRaffleNumberListItem {...mockProps} numberItem={reservedNumberItem} />)
      
      const numberElement = screen.getByText('123').closest('div')
      fireEvent.click(numberElement!)

      await waitFor(() => {
        expect(mockUnreserve).toHaveBeenCalledWith('test-raffle-id', 123)
        expect(mockProps.onReserveSuccess).toHaveBeenCalledWith(123)
      })
    })

    it('should handle unreserve error correctly', async () => {
      const reservedNumberItem = {
        ...mockNumberItem,
        status: 'RESERVED' as const,
        reservedBy: 'testuser'
      }

      const mockUnreserve = raffleService.unreserveRaffleNumber as jest.Mock
      mockUnreserve.mockRejectedValue(new Error('Unreserve failed'))

      render(<AvailableRaffleNumberListItem {...mockProps} numberItem={reservedNumberItem} />)
      
      const numberElement = screen.getByText('123').closest('div')
      fireEvent.click(numberElement!)

      await waitFor(() => {
        expect(mockUnreserve).toHaveBeenCalledWith('test-raffle-id', 123)
        expect(mockProps.onReserveError).toHaveBeenCalledWith('Erro desconhecido')
      })
    })

    it('should show unreserve option even when user is not authenticated (backend handles auth)', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const reservedNumberItem = {
        ...mockNumberItem,
        status: 'RESERVED' as const,
        reservedBy: 'testuser'
      }

      render(<AvailableRaffleNumberListItem {...mockProps} numberItem={reservedNumberItem} />)
      
      // Verificar se o número tem a classe correta (laranja para todos os reservados)
      const numberElement = screen.getByText('123').closest('div')?.parentElement
      expect(numberElement).toHaveClass('bg-orange-100')
      
      // Verificar se tem o ícone de unreserve (frontend sempre mostra, backend decide)
      expect(screen.getByTitle('Clique para desreservar')).toBeInTheDocument()
    })
  })

  describe('Visual feedback', () => {
    it('should show loading state during unreserve operation', async () => {
      const reservedNumberItem = {
        ...mockNumberItem,
        status: 'RESERVED' as const,
        reservedBy: 'testuser'
      }

      const mockUnreserve = raffleService.unreserveRaffleNumber as jest.Mock
      mockUnreserve.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<AvailableRaffleNumberListItem {...mockProps} numberItem={reservedNumberItem} />)
      
      const numberElement = screen.getByText('123').closest('div')
      fireEvent.click(numberElement!)

      // Verificar se mostra o indicador de loading
      expect(screen.getByText('⏳')).toBeInTheDocument()
    })
  })
})
