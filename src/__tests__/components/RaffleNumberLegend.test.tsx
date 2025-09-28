import React from 'react'
import { render, screen } from '@testing-library/react'
import { RaffleNumberLegend } from '@/components/RaffleNumberLegend'

describe('RaffleNumberLegend', () => {
  it('deve renderizar a legenda corretamente', () => {
    render(<RaffleNumberLegend />)
    
    expect(screen.getByText('Disponível')).toBeInTheDocument()
    expect(screen.getByText('Reservado')).toBeInTheDocument()
    expect(screen.getByText('Vendido')).toBeInTheDocument()
  })

  it('deve exibir os indicadores de cor corretos', () => {
    const { container } = render(<RaffleNumberLegend />)
    
    const indicators = container.querySelectorAll('div[class*="w-3 h-3 rounded"]')
    expect(indicators).toHaveLength(3)
    
    // Verifica se as classes de cor estão presentes
    expect(indicators[0]).toHaveClass('bg-green-50', 'border-green-200')
    expect(indicators[1]).toHaveClass('bg-yellow-50', 'border-yellow-200')
    expect(indicators[2]).toHaveClass('bg-gray-100', 'border-gray-300')
  })
})



