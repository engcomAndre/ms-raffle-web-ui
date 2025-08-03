'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGoogleReady } from '@/components/GoogleScript'
import { setCookie, getCookie, deleteCookie } from '@/utils/cookies'

interface User {
  id: string
  name: string
  email: string
  username: string
  picture?: string
  provider?: 'google' | 'credentials'
}

interface GoogleCredentialResponse {
  credential: string
  select_by: string
  clientId: string
  client_id: string
}

export function useGoogleButtonSafe() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [buttonRendered, setButtonRendered] = useState(false)
  const router = useRouter()
  const googleReady = useGoogleReady()
  const buttonRefs = useRef<Map<string, HTMLElement>>(new Map())
  const callbackRef = useRef<((response: GoogleCredentialResponse) => void) | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (googleReady && !buttonRendered) {
      initializeGoogleAuth()
    }
  }, [googleReady, buttonRendered])

  const initializeGoogleAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId || !window.google?.accounts?.id) return

    console.log('🔧 Inicializando Google Auth seguro...')
    
    try {
      // Criar callback único para evitar múltiplas inicializações
      if (!callbackRef.current) {
        callbackRef.current = handleCredentialResponse
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: callbackRef.current,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false,
        ux_mode: 'popup',
        state_cookie_domain: 'localhost'
      })

      // Renderizar todos os botões registrados
      renderAllButtons()
      setButtonRendered(true)

    } catch (error) {
      console.error('❌ Erro ao inicializar Google Auth:', error)
    }
  }

  const registerButton = (buttonId: string, element: HTMLElement) => {
    if (!element) return

    console.log(`📝 Registrando botão: ${buttonId}`)
    buttonRefs.current.set(buttonId, element)
    
    // Se o Google já está pronto, renderizar imediatamente
    if (googleReady && window.google?.accounts?.id) {
      renderButton(buttonId, element)
    }
  }

  const renderAllButtons = () => {
    buttonRefs.current.forEach((element, buttonId) => {
      renderButton(buttonId, element)
    })
  }

  const renderButton = (buttonId: string, element: HTMLElement) => {
    if (!window.google?.accounts?.id || !element) return

    console.log(`🎨 Renderizando botão seguro: ${buttonId}`)
    
    try {
      // Verificar se o elemento ainda existe no DOM
      if (!document.contains(element)) {
        console.log(`⚠️ Elemento ${buttonId} não existe mais no DOM`)
        buttonRefs.current.delete(buttonId)
        return
      }

      // Limpar apenas se necessário e de forma segura
      const existingButton = element.querySelector('[data-google-button]')
      if (existingButton) {
        console.log(`🔄 Botão ${buttonId} já existe, pulando renderização`)
        return
      }

      // Criar container seguro
      const container = document.createElement('div')
      container.setAttribute('data-google-button', 'true')
      container.className = 'w-full flex justify-center'
      
      // Renderizar botão do Google
      window.google.accounts.id.renderButton(container, {
        theme: 'filled_blue',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'left',
        width: '300',
        locale: 'pt-BR'
      })
      
      // Adicionar ao DOM de forma segura
      if (element.parentNode && document.contains(element)) {
        element.appendChild(container)
        console.log(`✅ Botão ${buttonId} renderizado com sucesso!`)
      }

    } catch (error) {
      console.error(`❌ Erro ao renderizar botão ${buttonId}:`, error)
      
      // Fallback seguro
      if (element && document.contains(element)) {
        element.innerHTML = `
          <div class="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <span class="text-red-600 text-sm">❌ Erro ao carregar botão do Google</span>
          </div>
        `
      }
    }
  }

  const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
    try {
      console.log('✅ Login Google bem-sucedido!', response)
      setIsLoading(true)
      
      // Decodificar token JWT
      const payload = JSON.parse(atob(response.credential.split('.')[1]))
      console.log('👤 Dados do usuário:', payload)
      
      const userData: User = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        username: payload.email.split('@')[0],
        picture: payload.picture,
        provider: 'google'
      }

      // Salvar dados
      const token = 'google-jwt-token-' + Date.now()
      localStorage.setItem('auth-token', token)
      localStorage.setItem('user-data', JSON.stringify(userData))
      setCookie('auth-token', token, 7)
      setCookie('user-data', JSON.stringify(userData), 7)
      
      // Atualizar estado
      setUser(userData)
      setIsAuthenticated(true)
      
      console.log('🎉 Login finalizado com sucesso!')
      console.log('🔄 Redirecionando para /playground...')
      
      // Redirecionar com pequeno delay
      setTimeout(() => {
        console.log('🚀 Executando redirecionamento...')
        router.push('/playground')
      }, 100)
      
    } catch (error) {
      console.error('❌ Erro no login:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkAuth = () => {
    try {
      // Tentar localStorage primeiro
      let token = localStorage.getItem('auth-token')
      let userData = localStorage.getItem('user-data')
      
      // Se não encontrar no localStorage, tentar cookies
      if (!token) {
        token = getCookie('auth-token')
        userData = getCookie('user-data')
      }
      
      if (token && userData) {
        setUser(JSON.parse(userData))
        setIsAuthenticated(true)
        console.log('✅ Usuário autenticado encontrado')
      } else {
        setIsAuthenticated(false)
        setUser(null)
        console.log('❌ Nenhum usuário autenticado encontrado')
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (email === 'admin@msraffle.com' && password === '123456') {
        const userData: User = {
          id: '1',
          name: 'Admin',
          email: 'admin@msraffle.com',
          username: 'admin',
          provider: 'credentials'
        }
        
        const token = 'mock-jwt-token-' + Date.now()
        
        localStorage.setItem('auth-token', token)
        localStorage.setItem('user-data', JSON.stringify(userData))
        setCookie('auth-token', token, 7)
        setCookie('user-data', JSON.stringify(userData), 7)
        
        setUser(userData)
        setIsAuthenticated(true)
        
        console.log('🎉 Login tradicional bem-sucedido!')
        console.log('🔄 Redirecionando para /playground...')
        
        // Redirecionar com pequeno delay
        setTimeout(() => {
          console.log('🚀 Executando redirecionamento...')
          router.push('/playground')
        }, 100)
        
        return { success: true }
      } else {
        return { success: false, error: 'Email ou senha incorretos' }
      }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error: 'Erro ao fazer login' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user-data')
    deleteCookie('auth-token')
    deleteCookie('user-data')
    setUser(null)
    setIsAuthenticated(false)
    router.push('/welcome')
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    registerButton,
    googleReady,
    buttonRendered
  }
}