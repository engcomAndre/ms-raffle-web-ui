'use client'

import { DashboardLayout } from '@/components/DashboardLayout'

export default function PlaygroundPage() {
  return (
    <DashboardLayout currentPage="Minhas Rifas">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Minhas Rifas</h1>
        <p className="text-gray-600">Gerencie suas rifas e acompanhe o desempenho</p>
      </div>

      {/* Área de conteúdo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma rifa encontrada</h3>
          <p className="text-gray-500 mb-6">Você ainda não criou nenhuma rifa. Comece criando sua primeira rifa!</p>
          
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            + Criar Nova Rifa
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}