'use client'

import { useState, useEffect } from 'react'
import { raffleService } from '@/services/raffleService'
import { RaffleResponse, RafflePageResponse, RaffleNumbersResponse, RaffleNumberItemResponse, RaffleNumberStatus } from '@/types/raffle'

interface RaffleListProps {
  onRefresh?: () => void
}

// Componente de ícone de ordenação
const SortIcon = ({ isActive, order }: { isActive: boolean; order: 'asc' | 'desc' }) => {
  if (!isActive) {
    return (
      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    )
  }
  
  return (
    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
      {order === 'asc' ? (
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      ) : (
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      )}
    </svg>
  )
}

export function RaffleList({ onRefresh }: RaffleListProps) {
  const [raffles, setRaffles] = useState<RaffleResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  // Estados de filtros e ordenação
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortFields, setSortFields] = useState<Array<{field: string, order: 'asc' | 'desc'}>>([
    { field: 'createdAt', order: 'desc' }
  ])
  
  // Estados para delete
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [raffleToDelete, setRaffleToDelete] = useState<RaffleResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Estados para edição
  const [showEditModal, setShowEditModal] = useState(false)
  const [raffleToEdit, setRaffleToEdit] = useState<RaffleResponse | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    prize: '',
    maxNumbers: 0,
    startAt: '',
    endAt: ''
  })
  
  // Estado para controlar visibilidade dos filtros
  const [showFilters, setShowFilters] = useState(true)
  
  // Estados para números da rifa
  const [raffleNumbers, setRaffleNumbers] = useState<RaffleNumberItemResponse[]>([])
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(false)
  const [numbersError, setNumbersError] = useState<string | null>(null)
  
  // Estados para paginação dos números
  const [numbersCurrentPage, setNumbersCurrentPage] = useState(0)
  const [numbersTotalElements, setNumbersTotalElements] = useState(0)
  const [numbersTotalPages, setNumbersTotalPages] = useState(0)
  const [numbersHasNext, setNumbersHasNext] = useState(false)
  const [numbersHasPrevious, setNumbersHasPrevious] = useState(false)
  
  // Tamanho fixo para números da rifa
  const FIXED_NUMBERS_PAGE_SIZE = 20
  
  // Estados para expansão das linhas
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [expandedNumbers, setExpandedNumbers] = useState<Record<string, RaffleNumberItemResponse[]>>({})
  const [loadingExpandedNumbers, setLoadingExpandedNumbers] = useState<Record<string, boolean>>({})
  
  // Estados para paginação das linhas expandidas
  const [expandedNumbersPages, setExpandedNumbersPages] = useState<Record<string, number>>({})
  const [expandedNumbersTotalElements, setExpandedNumbersTotalElements] = useState<Record<string, number>>({})
  const [expandedNumbersTotalPages, setExpandedNumbersTotalPages] = useState<Record<string, number>>({})
  const [expandedNumbersHasNext, setExpandedNumbersHasNext] = useState<Record<string, boolean>>({})
  const [expandedNumbersHasPrevious, setExpandedNumbersHasPrevious] = useState<Record<string, boolean>>({})

  // Event listener para tecla ESC - fechar modais
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log('🔍 [RAFFLE-LIST] Tecla ESC pressionada')
        
        // Fechar modal de edição se estiver aberto
        if (showEditModal) {
          console.log('🚪 [RAFFLE-LIST] Fechando modal de edição via ESC')
          handleEditCancel()
        }
        
        // Fechar modal de delete se estiver aberto
        if (showDeleteModal) {
          console.log('🚪 [RAFFLE-LIST] Fechando modal de delete via ESC')
          handleDeleteCancel()
        }
      }
    }

    // Adicionar event listener
    document.addEventListener('keydown', handleKeyDown)
    
    // Cleanup: remover event listener quando componente for desmontado
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showEditModal, showDeleteModal]) // Dependências: re-executar quando estado dos modais mudar

  // Carregar rifas com paginação, filtros e ordenação
  const loadRaffles = async (page: number = 0, size: number = pageSize) => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log(`📋 [RAFFLE-LIST] Carregando rifas - página ${page}, tamanho ${size}, filtros: ${searchTerm}, status: ${statusFilter}, ordenações: ${sortFields.map(f => `${f.field}(${f.order})`).join(', ')}`)
      
      // Por enquanto, vamos filtrar no frontend até implementar no backend
      const response = await raffleService.getMyRafflesWithPagination(page, size)
      
      if (response.success && response.data) {
        const pageData = response.data as RafflePageResponse
        let filteredRaffles = pageData.content

        // Aplicar filtros
        if (searchTerm) {
          filteredRaffles = filteredRaffles.filter(raffle =>
            raffle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            raffle.prize.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }

        if (statusFilter !== 'all') {
          filteredRaffles = filteredRaffles.filter(raffle => {
            const status = getRaffleStatus(raffle)
            const statusMapping: Record<string, string> = {
              'active': 'Ativa',
              'waiting': 'Aguardando',
              'finished': 'Finalizada'
            }
            return status.text === statusMapping[statusFilter]
          })
        }

        // Aplicar ordenação múltipla
        filteredRaffles.sort((a, b) => {
          for (const sortField of sortFields) {
            let aValue: any
            let bValue: any

            switch (sortField.field) {
              case 'title':
                aValue = a.title.toLowerCase()
                bValue = b.title.toLowerCase()
                break
              case 'prize':
                aValue = a.prize.toLowerCase()
                bValue = b.prize.toLowerCase()
                break
              case 'status':
                aValue = getRaffleStatus(a).text.toLowerCase()
                bValue = getRaffleStatus(b).text.toLowerCase()
                break
              case 'numbersCreated':
                aValue = a.numbersCreated || 0
                bValue = b.numbersCreated || 0
                break
              case 'maxNumbers':
                aValue = a.maxNumbers
                bValue = b.maxNumbers
                break
              case 'startAt':
                aValue = new Date(a.startAt).getTime()
                bValue = new Date(b.startAt).getTime()
                break
              case 'createdAt':
                aValue = new Date(a.startAt).getTime() // Fallback para data de início
                bValue = new Date(b.startAt).getTime()
                break
              default:
                aValue = a.title.toLowerCase()
                bValue = b.title.toLowerCase()
            }

            if (aValue !== bValue) {
              return sortField.order === 'asc' 
                ? (aValue > bValue ? 1 : -1)
                : (aValue < bValue ? 1 : -1)
            }
          }
          return 0 // Se todos os campos são iguais
        })

        setRaffles(filteredRaffles)
        setTotalElements(filteredRaffles.length)
        setTotalPages(Math.ceil(filteredRaffles.length / pageSize))
        setHasNext(filteredRaffles.length > pageSize)
        setHasPrevious(false) // Como estamos filtrando no frontend, sempre voltamos para a primeira página
        setCurrentPage(0)
        
        console.log(`✅ [RAFFLE-LIST] Rifas carregadas e filtradas: ${filteredRaffles.length} de ${pageData.totalElements} total`)
      } else {
        setError(response.error || 'Erro ao carregar rifas')
        console.error('❌ [RAFFLE-LIST] Erro na resposta:', response)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('❌ [RAFFLE-LIST] Erro ao carregar rifas:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar rifas na montagem do componente
  useEffect(() => {
    loadRaffles(0)
  }, [])

  // Aplicar filtros automaticamente quando mudarem
  useEffect(() => {
    if (!isLoading) {
      loadRaffles(0)
    }
  }, [searchTerm, statusFilter, sortFields])

  // Função para mudar de página
  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page)
      loadRaffles(page)
    }
  }

  // Função para mudar o tamanho da página
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(0) // Volta para a primeira página
    loadRaffles(0, newPageSize)
  }



  // Função para limpar filtros
  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setSortFields([{ field: 'createdAt', order: 'desc' }])
    setCurrentPage(0)
    loadRaffles(0)
  }

  // Função para ordenar
  const handleSort = (field: string) => {
    setSortFields(prevFields => {
      const existingFieldIndex = prevFields.findIndex(f => f.field === field)
      
      if (existingFieldIndex >= 0) {
        // Field already exists, toggle order
        const newFields = [...prevFields]
        newFields[existingFieldIndex] = {
          ...newFields[existingFieldIndex],
          order: newFields[existingFieldIndex].order === 'asc' ? 'desc' : 'asc'
        }
        return newFields
      } else {
        // Add new field at the beginning
        return [{ field, order: 'asc' }, ...prevFields]
      }
    })
    setCurrentPage(0)
    loadRaffles(0)
  }
  
  const removeSortField = (field: string) => {
    setSortFields(prevFields => prevFields.filter(f => f.field !== field))
    setCurrentPage(0)
    loadRaffles(0)
  }
  
  const getSortOrder = (field: string): 'asc' | 'desc' => {
    const sortField = sortFields.find(f => f.field === field)
    return sortField ? sortField.order : 'asc'
  }
  
  const isFieldSorted = (field: string): boolean => {
    return sortFields.some(f => f.field === field)
  }
  
  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      'title': 'Título',
      'prize': 'Prêmio',
      'status': 'Status',
      'numbersCreated': 'Números Criados',
      'maxNumbers': 'Números Máximos',
      'startAt': 'Período',
      'createdAt': 'Data de Criação'
    }
    return labels[field] || field
  }
  
  // Função para obter cor do status do número
  const getNumberStatusColor = (status: RaffleNumberStatus): string => {
    switch (status) {
      case RaffleNumberStatus.ACTIVE:
        return 'bg-green-100 text-green-800'
      case RaffleNumberStatus.RESERVED:
        return 'bg-yellow-100 text-yellow-800'
      case RaffleNumberStatus.SOLD:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Função para obter texto do status do número
  const getNumberStatusText = (status: RaffleNumberStatus): string => {
    switch (status) {
      case RaffleNumberStatus.ACTIVE:
        return 'Disponível'
      case RaffleNumberStatus.RESERVED:
        return 'Reservado'
      case RaffleNumberStatus.SOLD:
        return 'Vendido'
      default:
        return 'Desconhecido'
    }
  }
  
  // Funções para paginação dos números
  const handleNumbersPageChange = async (page: number) => {
    if (raffleToEdit) {
      await loadRaffleNumbers(raffleToEdit.id!, page)
    }
  }
  
  // Função para expandir/colapsar linha da tabela (comportamento accordion)
  const handleRowToggle = async (raffleId: string) => {
    const newExpandedRows = new Set(expandedRows)
    
    if (newExpandedRows.has(raffleId)) {
      // Colapsar linha atual
      newExpandedRows.delete(raffleId)
      setExpandedRows(newExpandedRows)
      console.log(`📂 [RAFFLE-LIST] Linha colapsada: ${raffleId}`)
    } else {
      // Limpar todas as linhas expandidas (comportamento accordion)
      newExpandedRows.clear()
      
      // Expandir apenas a linha clicada
      newExpandedRows.add(raffleId)
      setExpandedRows(newExpandedRows)
      
      console.log(`📂 [RAFFLE-LIST] Linha expandida (accordion): ${raffleId}`)
      
      // Carregar números se ainda não foram carregados
      if (!expandedNumbers[raffleId]) {
        await loadExpandedNumbers(raffleId)
      }
    }
  }
  
  // Função para carregar números de uma rifa expandida
  const loadExpandedNumbers = async (raffleId: string, page: number = 0) => {
    try {
      setLoadingExpandedNumbers(prev => ({ ...prev, [raffleId]: true }))
      
      console.log(`🔢 [RAFFLE-LIST] Carregando números expandidos da rifa ID: ${raffleId} - página ${page}`)
      
      const response = await raffleService.getRaffleNumbers(raffleId, page, FIXED_NUMBERS_PAGE_SIZE)
      
      if (response.success && response.data) {
        setExpandedNumbers(prev => ({ 
          ...prev, 
          [raffleId]: response.data.rafflesNumbers 
        }))
        
        // Atualizar estados de paginação
        setExpandedNumbersPages(prev => ({ ...prev, [raffleId]: page }))
        setExpandedNumbersTotalElements(prev => ({ ...prev, [raffleId]: response.data.totalElements || 0 }))
        setExpandedNumbersTotalPages(prev => ({ ...prev, [raffleId]: response.data.totalPages || 0 }))
        setExpandedNumbersHasNext(prev => ({ ...prev, [raffleId]: response.data.hasNext || false }))
        setExpandedNumbersHasPrevious(prev => ({ ...prev, [raffleId]: response.data.hasPrevious || false }))
        
        console.log(`✅ [RAFFLE-LIST] Números expandidos carregados: ${response.data.rafflesNumbers.length} números (página ${page + 1}/${response.data.totalPages || 1})`)
      } else {
        console.error('❌ [RAFFLE-LIST] Erro ao carregar números expandidos:', response.error)
      }
    } catch (error) {
      console.error('💥 [RAFFLE-LIST] Erro inesperado ao carregar números expandidos:', error)
    } finally {
      setLoadingExpandedNumbers(prev => ({ ...prev, [raffleId]: false }))
    }
  }
  
  // Funções para paginação das linhas expandidas
  const handleExpandedNumbersPageChange = async (raffleId: string, newPage: number) => {
    console.log(`📄 [RAFFLE-LIST] Mudando página dos números expandidos da rifa ${raffleId} para ${newPage}`)
    await loadExpandedNumbers(raffleId, newPage)
  }
  
  // Funções para delete
  const handleDeleteClick = (raffle: RaffleResponse) => {
    setRaffleToDelete(raffle)
    setShowDeleteModal(true)
  }
  
  const handleDeleteConfirm = async () => {
    if (!raffleToDelete) return
    
    setIsDeleting(true)
    try {
      console.log(`🗑️ [RAFFLE-LIST] Confirmando exclusão da rifa: ${raffleToDelete.title}`)
      const response = await raffleService.deleteRaffle(raffleToDelete.id!)
      
      if (response.success) {
        console.log(`✅ [RAFFLE-LIST] Rifa excluída com sucesso: ${raffleToDelete.title}`)
        setShowDeleteModal(false)
        setRaffleToDelete(null)
        // Recarregar a lista
        loadRaffles(currentPage)
        // Chamar callback de refresh se existir
        if (onRefresh) {
          onRefresh()
        }
      } else {
        console.error(`❌ [RAFFLE-LIST] Erro ao excluir rifa: ${response.error}`)
        alert(`Erro ao excluir rifa: ${response.message}`)
      }
    } catch (error) {
      console.error(`💥 [RAFFLE-LIST] Erro inesperado ao excluir rifa:`, error)
      alert('Erro inesperado ao excluir rifa')
    } finally {
      setIsDeleting(false)
    }
  }
  
  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setRaffleToDelete(null)
  }
  
  // Funções para edição
  const handleEditClick = async (raffle: RaffleResponse) => {
    setRaffleToEdit(raffle)
    setEditForm({
      title: raffle.title,
      prize: raffle.prize,
      maxNumbers: raffle.maxNumbers,
      startAt: raffle.startAt.split('T')[0] + 'T' + raffle.startAt.split('T')[1].substring(0, 5),
      endAt: raffle.endAt.split('T')[0] + 'T' + raffle.endAt.split('T')[1].substring(0, 5)
    })
    setShowEditModal(true)
    
    // Resetar paginação dos números
    setNumbersCurrentPage(0)
    
    // Carregar números da rifa
    await loadRaffleNumbers(raffle.id!, 0)
  }
  
  // Função para carregar números da rifa
  const loadRaffleNumbers = async (raffleId: string, page: number = 0) => {
    return loadRaffleNumbersWithSize(raffleId, page, FIXED_NUMBERS_PAGE_SIZE)
  }
  
  // Função para carregar números da rifa com tamanho específico
  const loadRaffleNumbersWithSize = async (raffleId: string, page: number = 0, size: number) => {
    try {
      setIsLoadingNumbers(true)
      setNumbersError(null)
      
      console.log(`🔢 [RAFFLE-LIST] Carregando números da rifa ID: ${raffleId} - página ${page}, tamanho ${size}`)
      
      const response = await raffleService.getRaffleNumbers(raffleId, page, size)
      
      if (response.success && response.data) {
        setRaffleNumbers(response.data.rafflesNumbers)
        setNumbersTotalElements(response.data.totalElements || 0)
        setNumbersTotalPages(response.data.totalPages || 0)
        setNumbersHasNext(response.data.hasNext || false)
        setNumbersHasPrevious(response.data.hasPrevious || false)
        setNumbersCurrentPage(page)
        console.log(`✅ [RAFFLE-LIST] Números carregados: ${response.data.rafflesNumbers.length} números da página ${page + 1} (tamanho: ${size})`)
      } else {
        // Verificar se é um erro 404 (números não encontrados)
        if (response.error && response.error.includes('404')) {
          setNumbersError('Esta rifa ainda não possui números criados. Crie os números da rifa para visualizá-los aqui.')
          console.log('ℹ️ [RAFFLE-LIST] Rifa sem números criados - mostrando mensagem amigável')
        } else {
          setNumbersError(response.error || 'Erro ao carregar números da rifa')
          console.error('❌ [RAFFLE-LIST] Erro ao carregar números:', response.error)
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      // Verificar se é um erro 404 no catch também
      if (errorMessage.includes('404')) {
        setNumbersError('Esta rifa ainda não possui números criados. Crie os números da rifa para visualizá-los aqui.')
        console.log('ℹ️ [RAFFLE-LIST] Rifa sem números criados (catch) - mostrando mensagem amigável')
      } else {
        setNumbersError(errorMessage)
        console.error('💥 [RAFFLE-LIST] Erro inesperado ao carregar números:', error)
      }
    } finally {
      setIsLoadingNumbers(false)
    }
  }
  
  const handleEditConfirm = async () => {
    if (!raffleToEdit) return
    
    setIsEditing(true)
    try {
      console.log(`✏️ [RAFFLE-LIST] Confirmando edição da rifa: ${raffleToEdit.title}`)
      const response = await raffleService.updateRaffle(raffleToEdit.id!, editForm)
      
      if (response.success) {
        console.log(`✅ [RAFFLE-LIST] Rifa editada com sucesso: ${raffleToEdit.title}`)
        setShowEditModal(false)
        setRaffleToEdit(null)
        // Recarregar a lista
        loadRaffles(currentPage)
        // Chamar callback de refresh se existir
        if (onRefresh) {
          onRefresh()
        }
      } else {
        console.error(`❌ [RAFFLE-LIST] Erro ao editar rifa: ${response.error}`)
        alert(`Erro ao editar rifa: ${response.message}`)
      }
    } catch (error) {
      console.error(`💥 [RAFFLE-LIST] Erro inesperado ao editar rifa:`, error)
      alert('Erro inesperado ao editar rifa')
    } finally {
      setIsEditing(false)
    }
  }
  
  const handleEditCancel = () => {
    setShowEditModal(false)
    setRaffleToEdit(null)
    setEditForm({
      title: '',
      prize: '',
      maxNumbers: 0,
      startAt: '',
      endAt: ''
    })
  }
  
  const handleEditFormChange = (field: string, value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Funções para ativar/inativar
  const handleToggleActive = async (raffle: RaffleResponse) => {
    try {
      console.log(`🔄 [RAFFLE-LIST] Alternando status da rifa: ${raffle.title}`)
      
      let response
      if (raffle.active) {
        // Se está ativa, inativar
        response = await raffleService.inactiveRaffle(raffle.id!)
        console.log(`⏸️ [RAFFLE-LIST] Inativando rifa: ${raffle.title}`)
      } else {
        // Se está inativa, ativar
        response = await raffleService.activeRaffle(raffle.id!)
        console.log(`▶️ [RAFFLE-LIST] Ativando rifa: ${raffle.title}`)
      }
      
      if (response.success) {
        console.log(`✅ [RAFFLE-LIST] Status da rifa alterado com sucesso: ${raffle.title}`)
        // Recarregar a lista
        loadRaffles(currentPage)
        // Chamar callback de refresh se existir
        if (onRefresh) {
          onRefresh()
        }
      } else {
        console.error(`❌ [RAFFLE-LIST] Erro ao alterar status da rifa: ${response.error}`)
        alert(`Erro ao alterar status da rifa: ${response.message}`)
      }
    } catch (error) {
      console.error(`💥 [RAFFLE-LIST] Erro inesperado ao alterar status da rifa:`, error)
      alert('Erro inesperado ao alterar status da rifa')
    }
  }

  // Função para formatar data
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Função para obter status da rifa
  const getRaffleStatus = (raffle: RaffleResponse) => {
    // Usar o campo active para determinar o status
    if (raffle.active) {
      return { text: 'Ativa', color: 'bg-green-100 text-green-800' }
    } else {
      return { text: 'Aguardando', color: 'bg-yellow-100 text-yellow-800' }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando rifas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar rifas</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => loadRaffles(currentPage)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }



  return (
    <div className="space-y-6">
      {/* Filtros e Ordenação */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filtros e Ordenação</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
            title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          >
            <span className="text-sm">{showFilters ? "Ocultar" : "Mostrar"}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {showFilters && (
          <div className="space-y-4">
            {/* Barra de busca principal */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar rifas por título ou prêmio..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Filtros rápidos */}
            <div className="flex flex-wrap gap-2">
              {/* Filtro por status */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      statusFilter === 'active'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Ativas
                  </button>
                  <button
                    onClick={() => setStatusFilter('waiting')}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      statusFilter === 'waiting'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Aguardando
                  </button>
                  <button
                    onClick={() => setStatusFilter('finished')}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      statusFilter === 'finished'
                        ? 'bg-gray-100 text-gray-800 border border-gray-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Finalizadas
                  </button>
                </div>
              </div>

              {/* Contador de resultados */}
              <div className="ml-auto flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {raffles.length} rifa{raffles.length !== 1 ? 's' : ''} encontrada{raffles.length !== 1 ? 's' : ''}
                </span>
                {sortFields.length > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {sortFields.length} ordenação{sortFields.length !== 1 ? 'ões' : 'ão'}
                  </span>
                )}
              </div>
            </div>

            {/* Ordenações ativas */}
            {sortFields.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">Ordenações Ativas</h4>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Limpar tudo
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {sortFields.map((sortField, index) => (
                    <div
                      key={sortField.field}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 transition-colors"
                    >
                      <span className="text-gray-500 font-medium">{index + 1}.</span>
                      <span className="text-gray-800">{getFieldLabel(sortField.field)}</span>
                      <SortIcon isActive={true} order={sortField.order} />
                      <button
                        onClick={() => removeSortField(sortField.field)}
                        className="ml-1 text-gray-400 hover:text-gray-600 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                        title="Remover ordenação"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo - Tabela ou mensagem de nenhuma rifa */}
      {raffles.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma rifa encontrada</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Nenhuma rifa corresponde aos filtros aplicados. Tente ajustar sua busca.'
                : 'Você ainda não criou nenhuma rifa. Comece criando sua primeira rifa!'
              }
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Controles de Paginação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label htmlFor="pageSize" className="text-sm font-medium text-gray-700">
            Itens por página:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-500">
          Total: {totalElements} rifas
        </div>
      </div>

      {/* Tabela de Rifas */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>Título</span>
                  <SortIcon isActive={isFieldSorted('title')} order={getSortOrder('title')} />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('prize')}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>Prêmio</span>
                  <SortIcon isActive={isFieldSorted('prize')} order={getSortOrder('prize')} />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>Status</span>
                  <SortIcon isActive={isFieldSorted('status')} order={getSortOrder('status')} />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('numbersCreated')}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>Números Criados</span>
                  <SortIcon isActive={isFieldSorted('numbersCreated')} order={getSortOrder('numbersCreated')} />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('startAt')}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>Período</span>
                  <SortIcon isActive={isFieldSorted('startAt')} order={getSortOrder('startAt')} />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {raffles.flatMap((raffle) => {
              const status = getRaffleStatus(raffle)
              const rows = [
                <tr 
                  key={raffle.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRowToggle(raffle.id!)}
                  onDoubleClick={() => handleEditClick(raffle)}
                  title="Clique para expandir/colapsar números, duplo clique para editar"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRowToggle(raffle.id!)
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Clique para expandir/colapsar números"
                      >
                        <svg 
                          className={`w-4 h-4 transition-transform ${expandedRows.has(raffle.id!) ? 'rotate-90' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="text-sm font-medium text-gray-900">{raffle.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{raffle.prize}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="text-center">
                      <span className="font-medium">{raffle.numbersCreated || 0}</span>
                      <div className="text-xs text-gray-500">de {raffle.maxNumbers}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{formatDate(raffle.startAt)}</div>
                    <div className="text-xs text-gray-400">até {formatDate(raffle.endAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditClick(raffle)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-md hover:bg-blue-50"
                        title="Editar rifa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleToggleActive(raffle)}
                        className={`transition-colors p-1 rounded-md ${
                          raffle.active 
                            ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50' 
                            : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                        }`}
                        title={raffle.active ? "Inativar rifa" : "Ativar rifa"}
                      >
                        {raffle.active ? (
                          // Ícone de power off (inativar)
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                          </svg>
                        ) : (
                          // Ícone de power on (ativar)
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(raffle)}
                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-md hover:bg-red-50"
                        title="Excluir rifa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ]
              
              // Adicionar linha expandida se necessário
              if (expandedRows.has(raffle.id!)) {
                rows.push(
                  <tr key={`${raffle.id}-expanded`} className="bg-gray-50">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Números da Rifa
                          </h4>
                          <span className="text-xs text-gray-500">
                            {expandedNumbersTotalElements[raffle.id!] || 0} números
                          </span>
                        </div>
                        
                        {loadingExpandedNumbers[raffle.id!] ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-sm text-gray-600">Carregando números...</span>
                          </div>
                        ) : expandedNumbers[raffle.id!] ? (
                          <div className="grid grid-cols-8 gap-1 bg-white rounded-md border border-gray-200 p-2">
                            {expandedNumbers[raffle.id!].map((number) => (
                              <div
                                key={number.number}
                                className={`py-0.5 px-1 text-center rounded border text-xs font-medium flex flex-col items-center justify-center min-h-[28px] ${
                                  number.winner 
                                    ? 'bg-yellow-100 border-yellow-300 text-yellow-800' 
                                    : getNumberStatusColor(number.status)
                                }`}
                                title={`Número ${number.number} - ${number.winner ? 'Vencedor' : getNumberStatusText(number.status)}`}
                              >
                                <span className="leading-none">{number.number}</span>
                                {number.winner && (
                                  <span className="text-xs leading-none mt-0">🏆</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm text-gray-500">
                            Nenhum número encontrado
                          </div>
                        )}
                        
                        {/* Paginação dos números expandidos */}
                        {expandedNumbersTotalPages[raffle.id!] > 1 && (
                          <div className="flex items-center justify-center space-x-3 py-3">
                            <button
                              onClick={() => handleExpandedNumbersPageChange(raffle.id!, (expandedNumbersPages[raffle.id!] || 0) - 1)}
                              disabled={!expandedNumbersHasPrevious[raffle.id!]}
                              className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-blue-200"
                              title="Página anterior"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            
                            <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-md border border-gray-200">
                              {((expandedNumbersPages[raffle.id!] || 0) + 1)} de {expandedNumbersTotalPages[raffle.id!]}
                            </span>
                            
                            <button
                              onClick={() => handleExpandedNumbersPageChange(raffle.id!, (expandedNumbersPages[raffle.id!] || 0) + 1)}
                              disabled={!expandedNumbersHasNext[raffle.id!]}
                              className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-blue-200"
                              title="Próxima página"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500 flex items-center justify-center gap-4">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                            <span>Disponível</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                            <span>Reservado</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                            <span>Vendido</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded">🏆</div>
                            <span>Vencedor</span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              }
              
              return rows
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevious}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNext}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
          
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{currentPage * pageSize + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min((currentPage + 1) * pageSize, totalElements)}
                </span>{' '}
                de <span className="font-medium">{totalElements}</span> resultados
              </p>
            </div>
            
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevious}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Números das páginas */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i
                  } else if (currentPage < 3) {
                    pageNum = i
                  } else if (currentPage > totalPages - 3) {
                    pageNum = totalPages - 5 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNum === currentPage
                          ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNext}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Próxima</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Modal de Edição */}
      {showEditModal && raffleToEdit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto p-6 border w-full max-w-6xl shadow-2xl rounded-xl bg-white border-gray-300">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Rifa
                </h3>
                <button
                  onClick={handleEditCancel}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coluna da Esquerda - Detalhes da Rifa */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Detalhes da Rifa
                  </h4>
                  <form className="space-y-4">
                <div>
                  <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    id="edit-title"
                    value={editForm.title}
                    onChange={(e) => handleEditFormChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o título da rifa"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-prize" className="block text-sm font-medium text-gray-700 mb-1">
                    Prêmio
                  </label>
                  <input
                    type="text"
                    id="edit-prize"
                    value={editForm.prize}
                    onChange={(e) => handleEditFormChange('prize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o prêmio"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-maxNumbers" className="block text-sm font-medium text-gray-700 mb-1">
                    Número Máximo de Bilhetes
                  </label>
                  <input
                    type="number"
                    id="edit-maxNumbers"
                    value={editForm.maxNumbers}
                    onChange={(e) => handleEditFormChange('maxNumbers', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o número máximo"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-startAt" className="block text-sm font-medium text-gray-700 mb-1">
                    Data e Hora de Início
                  </label>
                  <input
                    type="datetime-local"
                    id="edit-startAt"
                    value={editForm.startAt}
                    onChange={(e) => handleEditFormChange('startAt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-endAt" className="block text-sm font-medium text-gray-700 mb-1">
                    Data e Hora de Fim
                  </label>
                  <input
                    type="datetime-local"
                    id="edit-endAt"
                    value={editForm.endAt}
                    onChange={(e) => handleEditFormChange('endAt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </form>
                </div>
                
                {/* Coluna da Direita - Números da Rifa */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm flex flex-col h-full">
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Números da Rifa
                  </h4>
                  
                  {isLoadingNumbers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Carregando números...</span>
                    </div>
                  ) : numbersError ? (
                    <div className="text-center py-8">
                      {numbersError.includes('não possui números criados') ? (
                        // Mensagem amigável para rifas sem números
                        <>
                          <div className="text-blue-600 mb-3">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum número criado</h4>
                          <p className="text-sm text-gray-600 mb-3">{numbersError}</p>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-800">
                              💡 <strong>Dica:</strong> Para criar números, acesse a funcionalidade de gerenciamento de números da rifa.
                            </p>
                          </div>
                        </>
                      ) : (
                        // Mensagem de erro genérica
                        <>
                          <div className="text-red-600 mb-2">
                            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600">{numbersError}</p>
                        </>
                      )}
                    </div>
                  ) : raffleNumbers.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600">Nenhum número encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 mb-3">
                        Mostrando {raffleNumbers.length} números de {numbersTotalElements} disponíveis
                        {numbersTotalPages > 1 && (
                          <span className="ml-2 text-gray-500">
                            (Página {numbersCurrentPage + 1} de {numbersTotalPages})
                          </span>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Tamanho fixo: {FIXED_NUMBERS_PAGE_SIZE} números por página
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-8 gap-1 flex-1 min-h-60 max-h-80 overflow-y-auto bg-white rounded-md border border-gray-200 p-1">
                        {raffleNumbers.map((number) => (
                          <div
                            key={number.number}
                            className={`py-0.5 px-1 text-center rounded border text-xs font-medium flex flex-col items-center justify-center min-h-[28px] ${
                              number.winner 
                                ? 'bg-yellow-100 border-yellow-300 text-yellow-800' 
                                : getNumberStatusColor(number.status)
                            }`}
                            title={`Número ${number.number} - ${number.winner ? 'Vencedor' : getNumberStatusText(number.status)}`}
                          >
                            <span className="leading-none">{number.number}</span>
                            {number.winner && (
                              <span className="text-xs leading-none mt-0">🏆</span>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Paginação dos números */}
                      {numbersTotalPages > 1 && (
                        <div className="flex items-center justify-center border-t border-gray-300 pt-3 mt-3 bg-white rounded-md p-3 border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleNumbersPageChange(numbersCurrentPage - 1)}
                              disabled={!numbersHasPrevious}
                              className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-blue-200"
                              title="Página anterior"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            
                            <span className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
                              {numbersCurrentPage + 1} de {numbersTotalPages}
                            </span>
                            
                            <button
                              onClick={() => handleNumbersPageChange(numbersCurrentPage + 1)}
                              disabled={!numbersHasNext}
                              className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-blue-200"
                              title="Próxima página"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-600 mt-3 bg-white rounded-md p-3 border border-gray-200">
                        <div className="flex items-center gap-4 justify-center">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                            <span>Disponível</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                            <span>Reservado</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                            <span>Vendido</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded">🏆</div>
                            <span>Vencedor</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleEditCancel}
                  disabled={isEditing}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 border border-gray-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditConfirm}
                  disabled={isEditing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium shadow-sm"
                >
                  {isEditing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Salvar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Delete */}
      {showDeleteModal && raffleToDelete && (
        <div className="fixed inset-0 bg-gray-400 bg-opacity-30 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-6 border w-96 shadow-xl rounded-lg bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Confirmar Exclusão</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Tem certeza que deseja excluir a rifa <strong>"{raffleToDelete.title}"</strong>?
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Excluindo...
                    </>
                  ) : (
                    'Excluir'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
