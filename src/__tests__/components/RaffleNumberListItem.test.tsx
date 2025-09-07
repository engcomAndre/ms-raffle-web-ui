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
    expect(screen.getByText('Disponível')).toBeInTheDocument()
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('11999999999')).toBeInTheDocument()
  })

  it('deve exibir status "Reservado" para números reservados', () => {
    const reservedNumber = { ...mockNumber, status: 'RESERVED' as const }
    render(<RaffleNumberListItem number={reservedNumber} />)
    
    expect(screen.getByText('Reservado')).toBeInTheDocument()
  })

  it('deve exibir status "Vendido" para números vendidos', () => {
    const soldNumber = { ...mockNumber, status: 'SOLD' as const }
    render(<RaffleNumberListItem number={soldNumber} />)
    
    expect(screen.getByText('Vendido')).toBeInTheDocument()
  })

  it('deve exibir badge de ganhador quando winner for true', () => {
    const winnerNumber = { ...mockNumber, winner: true }
    render(<RaffleNumberListItem number={winnerNumber} />)
    
    expect(screen.getByText('🏆 Ganhador')).toBeInTheDocument()
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
    expect(screen.getByText('Reservado por: Maria Santos')).toBeInTheDocument()
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
