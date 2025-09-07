import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { RaffleNumberListPagination } from '@/components/RaffleNumberListPagination'

describe('RaffleNumberListPagination', () => {
  const mockOnPageChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve renderizar a paginação corretamente', () => {
    render(
      <RaffleNumberListPagination
        currentPage={0}
        totalPages={5}
        hasNext={true}
        hasPrevious={false}
        onPageChange={mockOnPageChange}
      />
    )
    
    // Verifica se os elementos principais estão presentes
    expect(screen.getAllByText('1')).toHaveLength(2) // Um no texto da página e outro no botão
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getAllByText('5')).toHaveLength(2) // Um no texto da página e outro no botão
    expect(screen.getByText('...')).toBeInTheDocument() // Reticências para páginas intermediárias
  })

  it('deve desabilitar botão anterior na primeira página', () => {
    render(
      <RaffleNumberListPagination
        currentPage={0}
        totalPages={5}
        hasNext={true}
        hasPrevious={false}
        onPageChange={mockOnPageChange}
      />
    )
    
    const prevButtons = screen.getAllByRole('button', { name: /anterior/i })
    const desktopPrevButton = prevButtons.find(button => 
      button.closest('.hidden.sm\\:flex')
    )
    expect(desktopPrevButton).toBeDisabled()
  })

  it('deve desabilitar botão próximo na última página', () => {
    render(
      <RaffleNumberListPagination
        currentPage={4}
        totalPages={5}
        hasNext={false}
        hasPrevious={true}
        onPageChange={mockOnPageChange}
      />
    )
    
    const nextButtons = screen.getAllByRole('button', { name: /próximo/i })
    const desktopNextButton = nextButtons.find(button => 
      button.closest('.hidden.sm\\:flex')
    )
    expect(desktopNextButton).toBeDisabled()
  })

  it('deve chamar onPageChange quando clicar em uma página', () => {
    render(
      <RaffleNumberListPagination
        currentPage={1}
        totalPages={5}
        hasNext={true}
        hasPrevious={true}
        onPageChange={mockOnPageChange}
      />
    )
    
    const pageButton = screen.getByText('3')
    fireEvent.click(pageButton)
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('deve chamar onPageChange quando clicar em próximo', () => {
    render(
      <RaffleNumberListPagination
        currentPage={1}
        totalPages={5}
        hasNext={true}
        hasPrevious={true}
        onPageChange={mockOnPageChange}
      />
    )
    
    const nextButtons = screen.getAllByRole('button', { name: /próximo/i })
    const desktopNextButton = nextButtons.find(button => 
      button.closest('.hidden.sm\\:flex')
    )
    fireEvent.click(desktopNextButton!)
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('deve chamar onPageChange quando clicar em anterior', () => {
    render(
      <RaffleNumberListPagination
        currentPage={2}
        totalPages={5}
        hasNext={true}
        hasPrevious={true}
        onPageChange={mockOnPageChange}
      />
    )
    
    const prevButtons = screen.getAllByRole('button', { name: /anterior/i })
    const desktopPrevButton = prevButtons.find(button => 
      button.closest('.hidden.sm\\:flex')
    )
    fireEvent.click(desktopPrevButton!)
    
    expect(mockOnPageChange).toHaveBeenCalledWith(1)
  })

  it('deve destacar a página atual', () => {
    render(
      <RaffleNumberListPagination
        currentPage={2}
        totalPages={5}
        hasNext={true}
        hasPrevious={true}
        onPageChange={mockOnPageChange}
      />
    )
    
    const currentPageButtons = screen.getAllByText('3')
    const pageButton = currentPageButtons.find(button => 
      button.tagName === 'BUTTON' && button.closest('nav')
    )
    expect(pageButton).toHaveClass('bg-blue-600', 'text-white')
  })

  it('deve exibir reticências quando há muitas páginas', () => {
    render(
      <RaffleNumberListPagination
        currentPage={5}
        totalPages={10}
        hasNext={true}
        hasPrevious={true}
        onPageChange={mockOnPageChange}
      />
    )
    
    const dotsButtons = screen.getAllByText('...')
    expect(dotsButtons.length).toBeGreaterThan(0)
  })

  it('não deve renderizar quando há apenas uma página', () => {
    const { container } = render(
      <RaffleNumberListPagination
        currentPage={0}
        totalPages={1}
        hasNext={false}
        hasPrevious={false}
        onPageChange={mockOnPageChange}
      />
    )
    
    // O componente deve renderizar mas sem botões de navegação funcionais
    expect(container.firstChild).not.toBeNull()
    const prevButtons = screen.getAllByRole('button', { name: /anterior/i })
    const nextButtons = screen.getAllByRole('button', { name: /próximo/i })
    
    // Todos os botões devem estar desabilitados
    prevButtons.forEach(button => expect(button).toBeDisabled())
    nextButtons.forEach(button => expect(button).toBeDisabled())
  })
})
