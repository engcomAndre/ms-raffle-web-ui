'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useGoogleButtonSafe } from '@/hooks/useGoogleButtonSafe'
import { GoogleLoginSection } from '@/components/GoogleLoginSection'

export default function WelcomePage() {
  const { login } = useGoogleButtonSafe()
  
  // Estados para login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Estados para cadastro
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoginLoading(true)
    setLoginError('')

    try {
      const result = await login(loginEmail, loginPassword)
      
      if (!result.success) {
        setLoginError(result.error || 'Erro ao fazer login')
      }
    } catch (err) {
      setLoginError('Erro ao fazer login')
    } finally {
      setIsLoginLoading(false)
    }
  }

  // Google login agora é handled automaticamente pelo botão renderizado

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegisterLoading(true)
    setRegisterError('')
    setRegisterSuccess('')

    try {
      // Validações
      if (registerData.password.length < 8) {
        setRegisterError('A senha deve ter pelo menos 8 caracteres')
        setIsRegisterLoading(false)
        return
      }

      if (registerData.password !== registerData.confirmPassword) {
        setRegisterError('As senhas não coincidem')
        setIsRegisterLoading(false)
        return
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerData.password)) {
        setRegisterError('A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número')
        setIsRegisterLoading(false)
        return
      }

      // Simulação de registro
      await new Promise(resolve => setTimeout(resolve, 1000))
      const result = { success: true }
      
      if (result.success) {
        setRegisterSuccess('Conta criada com sucesso! Faça login para continuar.')
        
        // Limpar formulário
        setRegisterData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: ''
        })
      } else {
        setRegisterError('Erro ao criar conta')
      }
    } catch (err) {
      setRegisterError('Erro ao criar conta')
    } finally {
      setIsRegisterLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setRegisterData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bloco Esquerdo - Login */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Entrar</h1>
            <p className="text-gray-600">Faça login para acessar sua conta</p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Bloco dos campos de login */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="login-email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  id="login-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Sua senha"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoginLoading}
            >
              {isLoginLoading ? 'Entrando...' : 'Entrar'}
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
            buttonId="welcome-google-button"
            description="Login com Google"
            variant="purple"
          />

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Credenciais de teste:</p>
            <p className="text-sm"><strong>Email:</strong> admin@msraffle.com</p>
            <p className="text-sm"><strong>Senha:</strong> 123456</p>
          </div>
        </div>

        {/* Bloco Direito - Cadastro */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Criar Conta</h1>
            <p className="text-gray-600">Cadastre-se para começar a usar o sistema</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {registerError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {registerError}
              </div>
            )}
            
            {registerSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {registerSuccess}
              </div>
            )}
            
            {/* Bloco dos campos de registro */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={registerData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Sobrenome
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={registerData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Seu sobrenome"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome de usuário
                </label>
                <input
                  type="text"
                  id="username"
                  value={registerData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="nome_usuario"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={registerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
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
                  value={registerData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                <div className="mt-2 text-xs text-gray-600">
                  <p className="mb-1">📋 Senha segura deve conter:</p>
                  <div className="grid grid-cols-1 gap-1">
                    <span className={`flex items-center ${registerData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                      {registerData.password.length >= 8 ? '✅' : '⭕'} Pelo menos 8 caracteres
                    </span>
                    <span className={`flex items-center ${/(?=.*[a-z])/.test(registerData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                      {/(?=.*[a-z])/.test(registerData.password) ? '✅' : '⭕'} Uma letra minúscula
                    </span>
                    <span className={`flex items-center ${/(?=.*[A-Z])/.test(registerData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                      {/(?=.*[A-Z])/.test(registerData.password) ? '✅' : '⭕'} Uma letra maiúscula
                    </span>
                    <span className={`flex items-center ${/(?=.*\d)/.test(registerData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                      {/(?=.*\d)/.test(registerData.password) ? '✅' : '⭕'} Um número
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Repetir Senha
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Digite a senha novamente"
                  required
                />
                {registerData.confirmPassword && (
                  <div className="mt-2 text-xs">
                    {registerData.password === registerData.confirmPassword ? (
                      <span className="text-green-600 flex items-center">
                        ✅ Senhas coincidem
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        ❌ Senhas não coincidem
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isRegisterLoading}
            >
              {isRegisterLoading ? 'Cadastrando...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta? Faça login no bloco ao lado
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 