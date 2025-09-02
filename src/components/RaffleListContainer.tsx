'use client'

import { useState, useEffect } from 'react'
import { RaffleList } from './RaffleList'
import { RaffleListControls } from './RaffleListControls'
import { raffleService } from '@/services/raffleService'

interface RaffleListContainerProps {
  className?: string
}

export function RaffleListContainer({ className = '' }: RaffleListContainerProps) {
  const [totalRaffles, setTotalRaffles] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(true)

  // Carregar total de rifas
  useEffect(() => {
    const loadTotalRaffles = async () => {
      try {
        setIsLoading(true)
        const response = await raffleService.getMyRafflesWithPagination(0, 1) // Página 0, tamanho 1 apenas para obter o total
        if (response.success && response.data) {
          setTotalRaffles(response.data.totalElements || 0)
        }
      } catch (error) {
        console.error('❌ [RAFFLE-CONTAINER] Erro ao carregar total de rifas:', error)
        setTotalRaffles(0)
      } finally {
        setIsLoading(false)
      }
    }

    loadTotalRaffles()
  }, [])



  const handleRefresh = () => {
    // Recarregar total de rifas quando a lista for atualizada
    const loadTotalRaffles = async () => {
      try {
        const response = await raffleService.getMyRafflesWithPagination(0, 1)
        if (response.success && response.data) {
          setTotalRaffles(response.data.totalElements || 0)
        }
      } catch (error) {
        console.error('❌ [RAFFLE-CONTAINER] Erro ao recarregar total de rifas:', error)
      }
    }

    loadTotalRaffles()
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
  }

  return (
    <div className={`bg-gray-50 rounded-lg shadow-lg border border-gray-200 p-6 space-y-4 ${className}`}>
      {/* Cabeçalho com controles */}
      <RaffleListControls
        totalRaffles={totalRaffles}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        isLoading={isLoading}
      />

      {/* Lista de rifas */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <RaffleList onRefresh={handleRefresh} />
      </div>
    </div>
  )
}
