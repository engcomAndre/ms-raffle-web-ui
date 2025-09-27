import React from 'react'
import { render, screen } from '@testing-library/react'
import { RaffleNumberListItem } from '@/components/RaffleNumberListItem'
import { RaffleNumberItemResponse } from '@/types/raffle'

describe('RaffleNumberListItem', () => {
  const mockNumber: RaffleNumberItemResponse = {
    id: '1',
    raffleId: 'test-raffle-id',
    number: '001',
    status: 'ACTIVE',
    winner: false,
    reservedAt: null,
    reservedBy: null,
    soldAt: null,
    soldBy: null,
    owner: null,
    buyerName: 'João Silva',
    buyerPhone: '11999999999'
  }

  it('deve renderizar o número corretamente', () => {
    render(<RaffleNumberListItem number={mockNumber} />)
    
    expect(screen.getByText('001')).toBeInTheDocument()
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('11999999999')).toBeInTheDocument()
  })

  it('deve aplicar classes corretas para números disponíveis', () => {
    const { container } = render(<RaffleNumberListItem number={mockNumber} />)
    
    const numberElement = container.firstChild as HTMLElement
    expect(numberElement).toHaveClass('bg-green-100', 'border-green-300', 'text-green-800')
  })

  it('deve aplicar classes corretas para números reservados', () => {
    const reservedNumber = { ...mockNumber, status: 'RESERVED' as const }
    const { container } = render(<RaffleNumberListItem number={reservedNumber} />)
    
    const numberElement = container.firstChild as HTMLElement
    expect(numberElement).toHaveClass('bg-yellow-100', 'border-yellow-300', 'text-yellow-800')
  })

  it('deve aplicar classes corretas para números vendidos', () => {
    const soldNumber = { ...mockNumber, status: 'SOLD' as const }
    const { container } = render(<RaffleNumberListItem number={soldNumber} />)
    
    const numberElement = container.firstChild as HTMLElement
    expect(numberElement).toHaveClass('bg-gray-200', 'border-gray-400', 'text-gray-700')
  })

  it('deve exibir badge de ganhador quando winner for true', () => {
    const winnerNumber = { ...mockNumber, winner: true }
    render(<RaffleNumberListItem number={winnerNumber} />)
    
    expect(screen.getByText('🏆')).toBeInTheDocument()
  })

  it('deve exibir informações do comprador quando disponível', () => {
    const soldNumber = { 
      ...mockNumber, 
      status: 'SOLD' as const,
      buyerName: 'Maria Santos',
      buyerPhone: '11888888888'
    }
    render(<RaffleNumberListItem number={soldNumber} />)
    
    expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    expect(screen.getByText('11888888888')).toBeInTheDocument()
  })

  it('deve exibir informações do reservador quando diferente do comprador', () => {
    const reservedNumber = { 
      ...mockNumber, 
      status: 'RESERVED' as const,
      buyerName: 'João Silva',
      reservedBy: 'Maria Santos'
    }
    render(<RaffleNumberListItem number={reservedNumber} />)
    
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Res: Maria Santos')).toBeInTheDocument()
  })

  it('não deve exibir informações do comprador quando não disponível', () => {
    const numberWithoutBuyer = { 
      ...mockNumber, 
      buyerName: undefined,
      buyerPhone: undefined,
      owner: null
    }
    render(<RaffleNumberListItem number={numberWithoutBuyer} />)
    
    expect(screen.queryByText('João Silva')).not.toBeInTheDocument()
    expect(screen.queryByText('11999999999')).not.toBeInTheDocument()
  })
})
