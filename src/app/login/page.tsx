'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useGoogleButtonSafe } from '@/hooks/useGoogleButtonSafe'
import { GoogleLoginSection } from '@/components/GoogleLoginSection'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useGoogleButtonSafe()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || 'Erro ao fazer login')
    }
  }

  // Google login agora é handled automaticamente pelo botão renderizado

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🎰 MS Raffle
            </h1>
            <p className="text-gray-600">Faça login para acessar sua conta</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}



          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bloco dos campos de login */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Sua senha"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Botão de Login com Google */}
          <GoogleLoginSection 
            buttonId="login-google-button"
            description="Login com Google"
            variant="green"
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-blue-500 hover:text-blue-600 font-medium">
                Criar conta
              </Link>
            </p>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Credenciais de teste:</p>
            <p className="text-sm"><strong>Email:</strong> admin@msraffle.com</p>
            <p className="text-sm"><strong>Senha:</strong> 123456</p>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Voltar para o início
            </Link>
          </div>

          {/* Debug info */}
          <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            <p>Debug: Client ID configurado: {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'Sim' : 'Não'}</p>
            <p>Debug: Hook carregado: Sim</p>
          </div>
        </div>
      </div>
    </div>
  )
} 