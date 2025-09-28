'use client'

import { useState, useEffect, ReactNode } from 'react'
import Image from 'next/image'
import { useLogout } from '@/hooks/useLogout'

interface DashboardLayoutProps {
  children: ReactNode
  currentPage?: string
}

export function DashboardLayout({ children, currentPage = 'Minhas Rifas' }: DashboardLayoutProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  // Obter dados do usuário do localStorage
  const [user, setUser] = useState<{
    username: string
    email: string
    picture: string
    provider: string
  } | null>(null)

  // Carregar dados do usuário no useEffect
  useEffect(() => {
    const token = localStorage.getItem('auth-token')
    const username = localStorage.getItem('auth-username')
    const email = localStorage.getItem('auth-email')
    const picture = localStorage.getItem('google-user-picture')
    const provider = localStorage.getItem('auth-provider')
    
    if (token && username) {
      setUser({
        username: username,
        email: email || username,
        picture: picture || '',
        provider: provider || 'userpass'
      })
    }
  }, [])

  const { logout } = useLogout()

  const handleLogout = () => {
    // Fechar dropdown
    setDropdownOpen(false)
    // Executar logout
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Logo/Título à esquerda */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          </div>

          {/* Informações do usuário à direita */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              {/* Avatar */}
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                {user?.picture ? (
                  <Image
                    src={user.picture}
                    alt={user.username || 'User'}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {user?.username?.charAt(0) || 'U'}
                  </span>
                )}
              </div>

              {/* Nome do usuário */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.username || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || 'usuario@email.com'}
                </p>
              </div>

              {/* Ícone dropdown */}
              <svg 
                className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setDropdownOpen(false)
                      // Adicionar navegação para perfil
                    }}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Perfil
                  </button>
                  
                  <hr className="my-1 border-gray-200" />
                  
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setDropdownOpen(false)
                      handleLogout()
                    }}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Menu Lateral */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sistemas</h2>
            
            <nav className="space-y-2">
              <a
                href="/playground"
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-100 transition-colors rounded-l-lg ${
                  currentPage === 'Minhas Rifas' 
                    ? 'bg-blue-50 border-r-4 border-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className={`font-medium ${currentPage === 'Minhas Rifas' ? 'text-blue-700' : 'text-gray-700'}`}>
                  Minhas Rifas
                </span>
              </a>
              
              <a
                href="/available-lists"
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-green-100 transition-colors rounded-l-lg ${
                  currentPage === 'Listas Disponíveis' 
                    ? 'bg-green-50 border-r-4 border-green-500' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className={`font-medium ${currentPage === 'Listas Disponíveis' ? 'text-green-700' : 'text-gray-700'}`}>
                  Listas Disponíveis
                </span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay para fechar dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setDropdownOpen(false)}
          data-testid="overlay"
        ></div>
      )}
    </div>
  )
}