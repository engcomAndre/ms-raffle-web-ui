import React, { useState, useEffect } from 'react'
import { raffleService } from '@/services/raffleService'

export function DebugRaffleComponent() {
  const [raffleData, setRaffleData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRaffle = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔍 [DEBUG] Carregando rifa 96421904-70ee-402d-bcce-a6812c5fdc4c...')
      const response = await raffleService.getRaffleById('96421904-70ee-402d-bcce-a6812c5fdc4c')
      
      console.log('📊 [DEBUG] Resposta da API:', response)
      
      if (response.success && response.data) {
        setRaffleData(response.data)
        console.log('✅ [DEBUG] Rifa carregada:', response.data)
        console.log('📁 [DEBUG] Arquivos:', response.data.files)
      } else {
        setError(response.error || 'Erro ao carregar rifa')
        console.error('❌ [DEBUG] Erro na resposta:', response)
      }
    } catch (err) {
      setError('Erro inesperado')
      console.error('💥 [DEBUG] Erro inesperado:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRaffle()
  }, [])

  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>
  if (!raffleData) return <div>Nenhum dado encontrado</div>

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-bold mb-4">Debug - Rifa {raffleData.id}</h3>
      
      <div className="space-y-2">
        <p><strong>Título:</strong> {raffleData.title}</p>
        <p><strong>Prêmio:</strong> {raffleData.prize}</p>
        <p><strong>Arquivos:</strong> {raffleData.files?.length || 0}</p>
        
        {raffleData.files && raffleData.files.length > 0 && (
          <div>
            <p><strong>URLs dos arquivos:</strong></p>
            <ul className="list-disc list-inside ml-4">
              {raffleData.files.map((file: string, index: number) => (
                <li key={index} className="text-sm text-blue-600 break-all">
                  {file}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-4">
          <button 
            onClick={loadRaffle}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recarregar
          </button>
        </div>
      </div>
    </div>
  )
}
