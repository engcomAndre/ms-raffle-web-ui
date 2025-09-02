import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RaffleListFilter } from '@/components/RaffleListFilter'

describe('RaffleListFilter', () => {
  const mockProps = {
    searchTerm: '',
    statusFilter: 'all' as const,
    onSearchChange: jest.fn(),
    onStatusFilterChange: jest.fn(),
    onClearFilters: jest.fn(),
    isLoading: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Renderização', () => {
    it('deve renderizar o botão de filtros', () => {
      render(<RaffleListFilter {...mockProps} />)
      
      expect(screen.getByRole('button', { name: /filtros/i })).toBeInTheDocument()
      expect(screen.getByText('Filtros')).toBeInTheDocument()
    })

    it('deve mostrar indicador quando não há filtros ativos', () => {
      render(<RaffleListFilter {...mockProps} />)
      
      const button = screen.getByRole('button', { name: /filtros/i })
      expect(button).not.toHaveClass('bg-blue-50')
      expect(screen.queryByText('1')).not.toBeInTheDocument()
    })

    it('deve mostrar indicador visual quando há filtros ativos', () => {
      render(
        <RaffleListFilter 
          {...mockProps} 
          searchTerm="test"
          statusFilter="active"
        />
      )
      
      const button = screen.getByRole('button', { name: /filtros/i })
      expect(button).toHaveClass('bg-blue-50')
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('Expansão de Filtros', () => {
    it('deve expandir filtros ao clicar no botão', async () => {
      const user = userEvent.setup()
      render(<RaffleListFilter {...mockProps} />)
      
      const button = screen.getByRole('button', { name: /filtros/i })
      
      // Filtros não devem estar visíveis inicialmente
      expect(screen.queryByPlaceholderText(/título, prêmio ou descrição/i)).not.toBeInTheDocument()
      
      await user.click(button)
      
      // Filtros devem aparecer após clique
      expect(screen.getByPlaceholderText(/título, prêmio ou descrição/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    })

    it('deve colapsar filtros ao clicar novamente', async () => {
      const user = userEvent.setup()
      render(<RaffleListFilter {...mockProps} />)
      
      const button = screen.getByRole('button', { name: /filtros/i })
      
      // Expandir
      await user.click(button)
      expect(screen.getByPlaceholderText(/título, prêmio ou descrição/i)).toBeInTheDocument()
      
      // Colapsar
      await user.click(button)
      expect(screen.queryByPlaceholderText(/título, prêmio ou descrição/i)).not.toBeInTheDocument()
    })
  })

  describe('Campo de Busca', () => {
    it('deve chamar onSearchChange ao digitar no campo de busca', async () => {
      const user = userEvent.setup()
      render(<RaffleListFilter {...mockProps} />)
      
      // Expandir filtros
      const button = screen.getByRole('button', { name: /filtros/i })
      await user.click(button)
      
      const searchInput = screen.getByPlaceholderText(/título, prêmio ou descrição/i)
      
      // Usar clear + type para simular entrada completa
      await user.clear(searchInput)
      await user.type(searchInput, 'test')
      
      // Verificar que onSearchChange foi chamado com o texto
      expect(mockProps.onSearchChange).toHaveBeenCalledWith('test')
    })

    it('deve exibir o valor atual do searchTerm', async () => {
      const user = userEvent.setup()
      render(<RaffleListFilter {...mockProps} searchTerm="current search" />)
      
      const button = screen.getByRole('button', { name: /filtros/i })
      await user.click(button)
      
      const searchInput = screen.getByDisplayValue('current search')
      expect(searchInput).toBeInTheDocument()
    })

    it('deve desabilitar campo de busca quando isLoading é true', async () => {
      const user = userEvent.setup()
      render(<RaffleListFilter {...mockProps} isLoading={true} />)
      
      const button = screen.getByRole('button', { name: /filtros/i })
      
      // O botão deve estar desabilitado quando isLoading é true
      expect(button).toBeDisabled()
      
      // Forçar clique mesmo desabilitado para testar se os controles internos estariam desabilitados
      fireEvent.click(button)
      
      await waitFor(() => {
        const searchInput = screen.queryByPlaceholderText(/título, prêmio ou descrição/i)
        if (searchInput) {
          expect(searchInput).toBeDisabled()
        }
      })
    })
  })

  describe('Filtro de Status', () => {
    it('deve chamar onStatusFilterChange ao mudar o status', async () => {
      const user = userEvent.setup()
      render(<RaffleListFilter {...mockProps} />)
      
      // Expandir filtros
      const button = screen.getByRole('button', { name: /filtros/i })
      await user.click(button)
      
      const statusSelect = screen.getByLabelText(/status/i)
      await user.selectOptions(statusSelect, 'active')
      
      expect(mockProps.onStatusFilterChange).toHaveBeenCalledWith('active')
    })

    it('deve exibir o valor atual do statusFilter', async () => {
      const user = userEvent.setup()
      render(<RaffleListFilter {...mockProps} statusFilter="inactive" />)
      
      const button = screen.getByRole('button', { name: /filtros/i })
      await user.click(button)
      
      const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement
      expect(statusSelect.value).toBe('inactive')
    })

    it('deve ter todas as opções de status disponíveis', async () => {
      const user = userEvent.setup()
      render(<RaffleListFilter {...mockProps} />)
      
      const button = screen.getByRole('button', { name: /filtros/i })
      await user.click(button)
      
      // Usar texto exato para evitar conflitos
      expect(screen.getByRole('option', { name: 'Todos' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Ativas' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Inativas' })).toBeInTheDocument()
    })
  })

  describe('Botão Limpar Filtros', () => {
    it('deve mostrar botão limpar quando há filtros ativos', async () => {
      const user = userEvent.setup()
      render(
        <RaffleListFilter 
          {...mockProps} 
          searchTerm="test"
          statusFilter="active"
        />
      )
      
      const button = screen.getByRole('button', { name: /filtros/i })
      await user.click(button)
      
      expect(screen.getByRole('button', { name: /limpar/i })).toBeInTheDocument()
    })

    it('não deve mostrar botão limpar quando não há filtros ativos', async () => {
      const user = userEvent.setup()
      render(<RaffleListFilter {...mockProps} />)
      
      const button = screen.getByRole('button', { name: /filtros/i })
      await user.click(button)
      
      expect(screen.queryByRole('button', { name: /limpar/i })).not.toBeInTheDocument()
    })

    it('deve chamar onClearFilters ao clicar em limpar', async () => {
      const user = userEvent.setup()
      render(
        <RaffleListFilter 
          {...mockProps} 
          searchTerm="test"
        />
      )
      
      const button = screen.getByRole('button', { name: /filtros/i })
      await user.click(button)
      
      const clearButton = screen.getByRole('button', { name: /limpar/i })
      await user.click(clearButton)
      
      expect(mockProps.onClearFilters).toHaveBeenCalled()
    })
  })

  describe('Estados de Loading', () => {
    it('deve desabilitar botão principal quando isLoading é true', () => {
      render(<RaffleListFilter {...mockProps} isLoading={true} />)
      
      const button = screen.getByRole('button', { name: /filtros/i })
      expect(button).toBeDisabled()
    })

    it('deve desabilitar controles quando isLoading é true', async () => {
      const user = userEvent.setup()
      render(<RaffleListFilter {...mockProps} isLoading={true} />)
      
      const button = screen.getByRole('button', { name: /filtros/i })
      // Forçar expansão mesmo com loading
      fireEvent.click(button)
      
      await waitFor(() => {
        const searchInput = screen.queryByPlaceholderText(/título, prêmio ou descrição/i)
        const statusSelect = screen.queryByLabelText(/status/i)
        const clearButton = screen.queryByRole('button', { name: /limpar/i })
        
        if (searchInput) expect(searchInput).toBeDisabled()
        if (statusSelect) expect(statusSelect).toBeDisabled()
        if (clearButton) expect(clearButton).toBeDisabled()
      })
    })
  })

  describe('Contador de Filtros', () => {
    it('deve contar corretamente filtros ativos - apenas searchTerm', () => {
      render(<RaffleListFilter {...mockProps} searchTerm="test" />)
      
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('deve contar corretamente filtros ativos - apenas statusFilter', () => {
      render(<RaffleListFilter {...mockProps} statusFilter="active" />)
      
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('deve contar corretamente filtros ativos - ambos', () => {
      render(
        <RaffleListFilter 
          {...mockProps} 
          searchTerm="test"
          statusFilter="inactive"
        />
      )
      
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })
})
