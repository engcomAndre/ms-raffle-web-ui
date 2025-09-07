import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { RaffleNumberListPagination } from '@/components/RaffleNumberListPagination'

describe('RaffleNumberListPagination', () => {
  const mockOnPageChange = jest.fn()
  const mockOnItemsPerPageChange = jest.fn()

  const defaultProps = {
    totalNumbers: 100,
    itemsPerPage: 20,
    currentPage: 0,
    totalPages: 5,
    onItemsPerPageChange: mockOnItemsPerPageChange,
    onPageChange: mockOnPageChange,
    isLoading: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve renderizar a paginação corretamente', () => {
    render(<RaffleNumberListPagination {...defaultProps} />)
    
    expect(screen.getByText('Total: 100 números')).toBeInTheDocument()
    expect(screen.getByText('Por página:')).toBeInTheDocument()
    expect(screen.getByText('Página 1 de 5')).toBeInTheDocument()
  })

  it('deve desabilitar botão anterior na primeira página', () => {
    render(<RaffleNumberListPagination {...defaultProps} currentPage={0} />)
    
    const prevButton = screen.getByTitle('Página anterior')
    expect(prevButton).toBeDisabled()
  })

  it('deve desabilitar botão próximo na última página', () => {
    render(<RaffleNumberListPagination {...defaultProps} currentPage={4} totalPages={5} />)
    
    const nextButton = screen.getByTitle('Próxima página')
    expect(nextButton).toBeDisabled()
  })

  it('deve chamar onPageChange quando clicar em uma página', () => {
    render(<RaffleNumberListPagination {...defaultProps} currentPage={1} />)
    
    const nextButton = screen.getByTitle('Próxima página')
    fireEvent.click(nextButton)
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('deve chamar onPageChange quando clicar em próximo', () => {
    render(<RaffleNumberListPagination {...defaultProps} currentPage={1} />)
    
    const nextButton = screen.getByTitle('Próxima página')
    fireEvent.click(nextButton)
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('deve chamar onPageChange quando clicar em anterior', () => {
    render(<RaffleNumberListPagination {...defaultProps} currentPage={2} />)
    
    const prevButton = screen.getByTitle('Página anterior')
    fireEvent.click(prevButton)
    
    expect(mockOnPageChange).toHaveBeenCalledWith(1)
  })

  it('deve chamar onItemsPerPageChange quando mudar itens por página', () => {
    render(<RaffleNumberListPagination {...defaultProps} />)
    
    const select = screen.getByDisplayValue('20')
    fireEvent.change(select, { target: { value: '50' } })
    
    expect(mockOnItemsPerPageChange).toHaveBeenCalledWith(50)
  })

  it('deve exibir estado de loading', () => {
    render(<RaffleNumberListPagination {...defaultProps} isLoading={true} />)
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('não deve renderizar navegação quando há apenas uma página', () => {
    render(<RaffleNumberListPagination {...defaultProps} totalPages={1} />)
    
    expect(screen.queryByTitle('Página anterior')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Próxima página')).not.toBeInTheDocument()
  })

  it('deve desabilitar controles quando loading', () => {
    render(<RaffleNumberListPagination {...defaultProps} isLoading={true} />)
    
    const select = screen.getByDisplayValue('20')
    const prevButton = screen.getByTitle('Página anterior')
    const nextButton = screen.getByTitle('Próxima página')
    
    expect(select).toBeDisabled()
    expect(prevButton).toBeDisabled()
    expect(nextButton).toBeDisabled()
  })

  it('deve exibir singular para 1 número', () => {
    render(<RaffleNumberListPagination {...defaultProps} totalNumbers={1} />)
    
    expect(screen.getByText('Total: 1 número')).toBeInTheDocument()
  })

  it('deve exibir plural para múltiplos números', () => {
    render(<RaffleNumberListPagination {...defaultProps} totalNumbers={5} />)
    
    expect(screen.getByText('Total: 5 números')).toBeInTheDocument()
  })
})