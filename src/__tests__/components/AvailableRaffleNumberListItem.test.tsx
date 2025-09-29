import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AvailableRaffleNumberListItem } from '@/components/AvailableRaffleNumberListItem'
import { raffleService } from '@/services/raffleService'
import { RaffleNumberItemResponse } from '@/types/raffle'

// Mock do raffleService
jest.mock('@/services/raffleService', () => ({
  raffleService: {
    reserveRaffleNumber: jest.fn(),
    unreserveRaffleNumber: jest.fn(),
  },
}))

const mockRaffleService = raffleService as jest.Mocked<typeof raffleService>

describe('AvailableRaffleNumberListItem - Unreserve Functionality', () => {
  const mockOnReserveSuccess = jest.fn()
  const mockOnReserveError = jest.fn()
  const raffleId = 'test-raffle-id'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Reserve functionality', () => {
    it('should show reserve option when number is active', () => {
      const numberItem: RaffleNumberItemResponse = {
        number: '123',
        status: 'ACTIVE',
        raffleId: raffleId,
        reservedBy: null,
        buyerName: null,
        buyerPhone: null,
        owner: null,
        winner: false,
      }

      render(
        <AvailableRaffleNumberListItem
          numberItem={numberItem}
          raffleId={raffleId}
          onReserveSuccess={mockOnReserveSuccess}
          onReserveError={mockOnReserveError}
        />
      )

      const numberElement = screen.getByText('123')
      expect(numberElement.parentElement).toHaveClass('bg-green-100')
      expect(numberElement.parentElement).toHaveClass('cursor-pointer')
    })

    it('should call reserveRaffleNumber when clicking on active number', async () => {
      mockRaffleService.reserveRaffleNumber.mockResolvedValue({ success: true })

      const numberItem: RaffleNumberItemResponse = {
        number: '123',
        status: 'ACTIVE',
        raffleId: raffleId,
        reservedBy: null,
        buyerName: null,
        buyerPhone: null,
        owner: null,
        winner: false,
      }

      render(
        <AvailableRaffleNumberListItem
          numberItem={numberItem}
          raffleId={raffleId}
          onReserveSuccess={mockOnReserveSuccess}
          onReserveError={mockOnReserveError}
        />
      )

      const numberElement = screen.getByText('123')
      fireEvent.click(numberElement.parentElement!)

      await waitFor(() => {
        expect(mockRaffleService.reserveRaffleNumber).toHaveBeenCalledWith(raffleId, 123)
        expect(mockOnReserveSuccess).toHaveBeenCalledWith(123)
      })
    })

    it('should handle reserve error', async () => {
      mockRaffleService.reserveRaffleNumber.mockRejectedValue({
        response: {
          data: {
            message: 'Reserve failed'
          }
        }
      })

      const numberItem: RaffleNumberItemResponse = {
        number: '123',
        status: 'ACTIVE',
        raffleId: raffleId,
        reservedBy: null,
        buyerName: null,
        buyerPhone: null,
        owner: null,
        winner: false,
      }

      render(
        <AvailableRaffleNumberListItem
          numberItem={numberItem}
          raffleId={raffleId}
          onReserveSuccess={mockOnReserveSuccess}
          onReserveError={mockOnReserveError}
        />
      )

      const numberElement = screen.getByText('123')
      fireEvent.click(numberElement.parentElement!)

      await waitFor(() => {
        expect(mockOnReserveError).toHaveBeenCalledWith('Reserve failed')
      })
    })
  })

  describe('Unreserve functionality', () => {
    it('should show unreserve option when number is reserved', () => {
      const numberItem: RaffleNumberItemResponse = {
        number: '123',
        status: 'RESERVED',
        raffleId: raffleId,
        reservedBy: 'test-user',
        buyerName: null,
        buyerPhone: null,
        owner: null,
        winner: false,
      }

      render(
        <AvailableRaffleNumberListItem
          numberItem={numberItem}
          raffleId={raffleId}
          onReserveSuccess={mockOnReserveSuccess}
          onReserveError={mockOnReserveError}
        />
      )

      const numberElement = screen.getByText('123')
      expect(numberElement.parentElement).toHaveClass('bg-yellow-100')
      expect(numberElement.parentElement).toHaveClass('cursor-pointer')
      expect(numberElement.parentElement).toHaveClass('hover:bg-yellow-200')
    })

    it('should call unreserveRaffleNumber when clicking on reserved number', async () => {
      mockRaffleService.unreserveRaffleNumber.mockResolvedValue({ success: true })

      const numberItem: RaffleNumberItemResponse = {
        number: '123',
        status: 'RESERVED',
        raffleId: raffleId,
        reservedBy: 'test-user',
        buyerName: null,
        buyerPhone: null,
        owner: null,
        winner: false,
      }

      render(
        <AvailableRaffleNumberListItem
          numberItem={numberItem}
          raffleId={raffleId}
          onReserveSuccess={mockOnReserveSuccess}
          onReserveError={mockOnReserveError}
        />
      )

      const numberElement = screen.getByText('123')
      fireEvent.click(numberElement.parentElement!)

      await waitFor(() => {
        expect(mockRaffleService.unreserveRaffleNumber).toHaveBeenCalledWith(raffleId, 123)
        expect(mockOnReserveSuccess).toHaveBeenCalledWith(123)
      })
    })

    it('should handle unreserve error', async () => {
      mockRaffleService.unreserveRaffleNumber.mockRejectedValue({
        response: {
          data: {
            message: 'Unreserve failed'
          }
        }
      })

      const numberItem: RaffleNumberItemResponse = {
        number: '123',
        status: 'RESERVED',
        raffleId: raffleId,
        reservedBy: 'test-user',
        buyerName: null,
        buyerPhone: null,
        owner: null,
        winner: false,
      }

      render(
        <AvailableRaffleNumberListItem
          numberItem={numberItem}
          raffleId={raffleId}
          onReserveSuccess={mockOnReserveSuccess}
          onReserveError={mockOnReserveError}
        />
      )

      const numberElement = screen.getByText('123')
      fireEvent.click(numberElement.parentElement!)

      await waitFor(() => {
        expect(mockOnReserveError).toHaveBeenCalledWith('Unreserve failed')
      })
    })

    it('should show loading state during unreserve operation', async () => {
      mockRaffleService.unreserveRaffleNumber.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      )

      const numberItem: RaffleNumberItemResponse = {
        number: '123',
        status: 'RESERVED',
        raffleId: raffleId,
        reservedBy: 'test-user',
        buyerName: null,
        buyerPhone: null,
        owner: null,
        winner: false,
      }

      render(
        <AvailableRaffleNumberListItem
          numberItem={numberItem}
          raffleId={raffleId}
          onReserveSuccess={mockOnReserveSuccess}
          onReserveError={mockOnReserveError}
        />
      )

      const numberElement = screen.getByText('123')
      fireEvent.click(numberElement.parentElement!)

      // Verificar se o loading aparece
      expect(screen.getByText('⏳')).toBeInTheDocument()

      await waitFor(() => {
        expect(mockRaffleService.unreserveRaffleNumber).toHaveBeenCalledWith(raffleId, 123)
      })
    })

    it('should show reserved indicator for reserved numbers', () => {
      const numberItem: RaffleNumberItemResponse = {
        number: '123',
        status: 'RESERVED',
        raffleId: raffleId,
        reservedBy: 'test-user',
        buyerName: null,
        buyerPhone: null,
        owner: null,
        winner: false,
      }

      render(
        <AvailableRaffleNumberListItem
          numberItem={numberItem}
          raffleId={raffleId}
          onReserveSuccess={mockOnReserveSuccess}
          onReserveError={mockOnReserveError}
        />
      )

      expect(screen.getByText('✓')).toBeInTheDocument()
    })

    it('should not allow interaction with sold numbers', () => {
      const numberItem: RaffleNumberItemResponse = {
        number: '123',
        status: 'SOLD',
        raffleId: raffleId,
        reservedBy: null,
        buyerName: 'buyer',
        buyerPhone: '123456789',
        owner: 'owner',
        winner: false,
      }

      render(
        <AvailableRaffleNumberListItem
          numberItem={numberItem}
          raffleId={raffleId}
          onReserveSuccess={mockOnReserveSuccess}
          onReserveError={mockOnReserveError}
        />
      )

      const numberElement = screen.getByText('123')
      expect(numberElement.parentElement).toHaveClass('cursor-not-allowed')
      expect(numberElement.parentElement).not.toHaveClass('hover:shadow-md')
    })
  })

  describe('Type conversion', () => {
    it('should convert string number to number when calling services', async () => {
      mockRaffleService.reserveRaffleNumber.mockResolvedValue({ success: true })

      const numberItem: RaffleNumberItemResponse = {
        number: '456', // String number
        status: 'ACTIVE',
        raffleId: raffleId,
        reservedBy: null,
        buyerName: null,
        buyerPhone: null,
        owner: null,
        winner: false,
      }

      render(
        <AvailableRaffleNumberListItem
          numberItem={numberItem}
          raffleId={raffleId}
          onReserveSuccess={mockOnReserveSuccess}
          onReserveError={mockOnReserveError}
        />
      )

      const numberElement = screen.getByText('456')
      fireEvent.click(numberElement.parentElement!)

      await waitFor(() => {
        expect(mockRaffleService.reserveRaffleNumber).toHaveBeenCalledWith(raffleId, 456) // Number, not string
      })
    })

    it('should convert string number to number when unreserving', async () => {
      mockRaffleService.unreserveRaffleNumber.mockResolvedValue({ success: true })

      const numberItem: RaffleNumberItemResponse = {
        number: '789', // String number
        status: 'RESERVED',
        raffleId: raffleId,
        reservedBy: 'test-user',
        buyerName: null,
        buyerPhone: null,
        owner: null,
        winner: false,
      }

      render(
        <AvailableRaffleNumberListItem
          numberItem={numberItem}
          raffleId={raffleId}
          onReserveSuccess={mockOnReserveSuccess}
          onReserveError={mockOnReserveError}
        />
      )

      const numberElement = screen.getByText('789')
      fireEvent.click(numberElement.parentElement!)

      await waitFor(() => {
        expect(mockRaffleService.unreserveRaffleNumber).toHaveBeenCalledWith(raffleId, 789) // Number, not string
      })
    })
  })
})