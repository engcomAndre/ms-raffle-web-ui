'use client'

export function RaffleNumberLegend() {
  return (
    <div className="flex items-center justify-center space-x-6 text-xs">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded bg-green-50 border border-green-200"></div>
        <span className="text-gray-700">Disponível</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded bg-yellow-50 border border-yellow-200"></div>
        <span className="text-gray-700">Reservado</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300"></div>
        <span className="text-gray-700">Vendido</span>
      </div>
    </div>
  )
}







