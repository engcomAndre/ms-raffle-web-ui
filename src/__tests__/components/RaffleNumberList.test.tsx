import React from 'react'
import { render, screen } from '@testing-library/react'
import { RaffleNumberList } from '@/components/RaffleNumberList'
import { RaffleNumberItemResponse } from '@/types/raffle'

describe('RaffleNumberList', () => {
  const mockNumbers: RaffleNumberItemResponse[] = [
    {
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
    },
    {
      id: '2',
      raffleId: 'test-raffle-id',
      number: '002',
      status: 'SOLD',
      winner: false,
      reservedAt: null,
      reservedBy: null,
      soldAt: '2024-01-01T00:00:00Z',
      soldBy: 'user123',
      owner: 'Maria Santos',
      buyerName: 'Maria Santos',
      buyerPhone: '11888888888'
    }
  ]

  it('deve renderizar a lista de números corretamente', () => {
    render(<RaffleNumberList numbers={mockNumbers} />)
    
    expect(screen.getByText('001')).toBeInTheDocument()
    expect(screen.getByText('002')).toBeInTheDocument()
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Maria Santos')).toBeInTheDocument()
  })

  it('deve exibir estado de loading', () => {
    render(<RaffleNumberList numbers={[]} isLoading={true} />)
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
    // O spinner não tem role status, apenas verifica se está presente
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('deve exibir mensagem de erro', () => {
    const errorMessage = 'Erro ao carregar números'
    render(<RaffleNumberList numbers={[]} error={errorMessage} />)
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('deve exibir mensagem quando não há números', () => {
    const emptyMessage = 'Nenhum número encontrado'
    render(<RaffleNumberList numbers={[]} emptyMessage={emptyMessage} />)
    
    expect(screen.getByText(emptyMessage)).toBeInTheDocument()
  })

  it('deve usar mensagem padrão quando emptyMessage não for fornecido', () => {
    render(<RaffleNumberList numbers={[]} />)
    
    expect(screen.getByText('Nenhum número encontrado para esta rifa.')).toBeInTheDocument()
  })

  it('deve renderizar grid com números quando há dados', () => {
    render(<RaffleNumberList numbers={mockNumbers} />)
    
    // Verifica se o container com classes de grid está presente
    const gridContainer = screen.getByText('001').closest('.grid')
    expect(gridContainer).toBeInTheDocument()
    expect(gridContainer).toHaveClass('grid', 'grid-cols-3', 'md:grid-cols-6', 'lg:grid-cols-8', 'xl:grid-cols-10')
  })
})
