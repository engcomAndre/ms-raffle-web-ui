import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RaffleListPagination } from '@/components/RaffleListPagination'

describe('RaffleListPagination', () => {
  const mockProps = {
    totalRaffles: 25,
    itemsPerPage: 10,
    currentPage: 0,
    totalPages: 3,
    onItemsPerPageChange: jest.fn(),
    onPageChange: jest.fn(),
    isLoading: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Renderização', () => {
    it('deve renderizar total de rifas', () => {
      render(<RaffleListPagination {...mockProps} />)
      
      expect(screen.getByText('Total: 25 rifas')).toBeInTheDocument()
    })

    it('deve renderizar total no singular quando há apenas 1 rifa', () => {
      render(<RaffleListPagination {...mockProps} totalRaffles={1} />)
      
      expect(screen.getByText('Total: 1 rifa')).toBeInTheDocument()
    })

    it('deve renderizar seletor de itens por página', () => {
      render(<RaffleListPagination {...mockProps} />)
      
      expect(screen.getByLabelText(/por página/i)).toBeInTheDocument()
      expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    })

    it('deve renderizar controles de navegação quando há múltiplas páginas', () => {
      render(<RaffleListPagination {...mockProps} />)
      
      expect(screen.getByRole('button', { name: /página anterior/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /próxima página/i })).toBeInTheDocument()
      expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    })

    it('não deve renderizar controles de navegação quando há apenas 1 página', () => {
      render(<RaffleListPagination {...mockProps} totalPages={1} />)
      
      expect(screen.queryByRole('button', { name: /página anterior/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /próxima página/i })).not.toBeInTheDocument()
      expect(screen.queryByText(/página \d+ de \d+/i)).not.toBeInTheDocument()
    })
  })

  describe('Seletor de Itens por Página', () => {
    it('deve ter todas as opções disponíveis', () => {
      render(<RaffleListPagination {...mockProps} />)
      
      expect(screen.getByRole('option', { name: '5' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '10' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '20' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '50' })).toBeInTheDocument()
    })

    it('deve chamar onItemsPerPageChange ao mudar seleção', async () => {
      const user = userEvent.setup()
      render(<RaffleListPagination {...mockProps} />)
      
      const select = screen.getByLabelText(/por página/i)
      await user.selectOptions(select, '20')
      
      expect(mockProps.onItemsPerPageChange).toHaveBeenCalledWith(20)
    })

    it('deve exibir valor atual selecionado', () => {
      render(<RaffleListPagination {...mockProps} itemsPerPage={20} />)
      
      const select = screen.getByLabelText(/por página/i) as HTMLSelectElement
      expect(select.value).toBe('20')
    })

    it('deve ser desabilitado quando isLoading é true', () => {
      render(<RaffleListPagination {...mockProps} isLoading={true} />)
      
      const select = screen.getByLabelText(/por página/i)
      expect(select).toBeDisabled()
    })
  })

  describe('Navegação de Páginas', () => {
    it('deve chamar onPageChange ao clicar em página anterior', async () => {
      const user = userEvent.setup()
      render(<RaffleListPagination {...mockProps} currentPage={1} />)
      
      const prevButton = screen.getByRole('button', { name: /página anterior/i })
      await user.click(prevButton)
      
      expect(mockProps.onPageChange).toHaveBeenCalledWith(0)
    })

    it('deve chamar onPageChange ao clicar em próxima página', async () => {
      const user = userEvent.setup()
      render(<RaffleListPagination {...mockProps} currentPage={1} />)
      
      const nextButton = screen.getByRole('button', { name: /próxima página/i })
      await user.click(nextButton)
      
      expect(mockProps.onPageChange).toHaveBeenCalledWith(2)
    })

    it('deve desabilitar botão anterior na primeira página', () => {
      render(<RaffleListPagination {...mockProps} currentPage={0} />)
      
      const prevButton = screen.getByRole('button', { name: /página anterior/i })
      expect(prevButton).toBeDisabled()
    })

    it('deve desabilitar botão próximo na última página', () => {
      render(<RaffleListPagination {...mockProps} currentPage={2} totalPages={3} />)
      
      const nextButton = screen.getByRole('button', { name: /próxima página/i })
      expect(nextButton).toBeDisabled()
    })

    it('deve exibir página atual corretamente', () => {
      render(<RaffleListPagination {...mockProps} currentPage={1} totalPages={3} />)
      
      expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
    })

    it('deve desabilitar botões de navegação quando isLoading é true', () => {
      render(<RaffleListPagination {...mockProps} currentPage={1} isLoading={true} />)
      
      const prevButton = screen.getByRole('button', { name: /página anterior/i })
      const nextButton = screen.getByRole('button', { name: /próxima página/i })
      
      expect(prevButton).toBeDisabled()
      expect(nextButton).toBeDisabled()
    })
  })

  describe('Estado de Loading', () => {
    it('deve mostrar spinner e texto de carregamento', () => {
      render(<RaffleListPagination {...mockProps} isLoading={true} />)
      
      expect(screen.getByText('Carregando...')).toBeInTheDocument()
      // Verifica se há um elemento com classe de spinner
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('não deve mostrar total quando está carregando', () => {
      render(<RaffleListPagination {...mockProps} isLoading={true} />)
      
      expect(screen.queryByText(/total: \d+ rifa/i)).not.toBeInTheDocument()
    })
  })

  describe('Casos Extremos', () => {
    it('deve lidar com totalRaffles zero', () => {
      render(<RaffleListPagination {...mockProps} totalRaffles={0} />)
      
      expect(screen.getByText('Total: 0 rifas')).toBeInTheDocument()
    })

    it('deve lidar com totalPages zero', () => {
      render(<RaffleListPagination {...mockProps} totalPages={0} />)
      
      expect(screen.queryByRole('button', { name: /página anterior/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /próxima página/i })).not.toBeInTheDocument()
    })

    it('deve lidar com currentPage fora dos limites', () => {
      render(<RaffleListPagination {...mockProps} currentPage={5} totalPages={3} />)
      
      // Mesmo com currentPage inválido, deve renderizar sem quebrar
      expect(screen.getByText('Página 6 de 3')).toBeInTheDocument()
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter labels apropriados', () => {
      render(<RaffleListPagination {...mockProps} />)
      
      expect(screen.getByLabelText(/por página/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /página anterior/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /próxima página/i })).toBeInTheDocument()
    })

    it('deve ter atributos title nos botões', () => {
      render(<RaffleListPagination {...mockProps} />)
      
      const prevButton = screen.getByRole('button', { name: /página anterior/i })
      const nextButton = screen.getByRole('button', { name: /próxima página/i })
      
      expect(prevButton).toHaveAttribute('title', 'Página anterior')
      expect(nextButton).toHaveAttribute('title', 'Próxima página')
    })
  })
})
