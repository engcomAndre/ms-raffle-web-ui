import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  username: string
  email: string
  name?: string
  picture?: string
  roles: string[]
  provider: 'google' | 'userpass'
}

export interface AuthState {
  // Estado
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Ações
  login: (user: User, token: string, refreshToken?: string) => void
  loginGoogle: (googleUser: any, token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  updateUser: (updates: Partial<User>) => void
  clearAuth: () => void
  
  // Getters computados
  hasRole: (role: string) => boolean
  isAdmin: () => boolean
  isUser: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Ação de login com usuário e senha
      login: (user: User, token: string, refreshToken?: string) => {
        console.log('🔐 [AUTH-STORE] Login realizado:', { username: user.username, provider: user.provider })
        
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          isLoading: false
        })
        
        // Salvar no localStorage para compatibilidade
        localStorage.setItem('auth-token', token)
        if (refreshToken) {
          localStorage.setItem('auth-refresh-token', refreshToken)
        }
        localStorage.setItem('auth-username', user.username)
        localStorage.setItem('auth-email', user.email)
        localStorage.setItem('auth-roles', JSON.stringify(user.roles))
      },

      // Ação de login com Google
      loginGoogle: (googleUser: any, token: string) => {
        console.log('🔐 [AUTH-STORE] Login Google realizado:', { email: googleUser.email, provider: 'google' })
        
        const user: User = {
          id: googleUser.id,
          username: googleUser.name || googleUser.email,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          roles: ['user'],
          provider: 'google'
        }
        
        set({
          user,
          token,
          refreshToken: null,
          isAuthenticated: true,
          isLoading: false
        })
        
        // Salvar no localStorage para compatibilidade
        localStorage.setItem('auth-token', token)
        localStorage.setItem('auth-username', user.username)
        localStorage.setItem('auth-email', user.email)
        localStorage.setItem('auth-roles', JSON.stringify(user.roles))
        localStorage.setItem('auth-provider', 'google')
        localStorage.setItem('google-user-id', user.id)
        if (user.picture) {
          localStorage.setItem('google-user-picture', user.picture)
        }
      },

      // Ação de logout
      logout: () => {
        console.log('🚪 [AUTH-STORE] Logout realizado')
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false
        })
        
        // Limpar localStorage
        const authKeys = [
          'auth-token',
          'auth-refresh-token',
          'auth-username',
          'auth-email',
          'auth-roles',
          'auth-provider',
          'google-user-id',
          'google-user-picture'
        ]
        
        authKeys.forEach(key => localStorage.removeItem(key))
      },

      // Definir estado de loading
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      // Atualizar dados do usuário
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates }
          set({ user: updatedUser })
          
          // Atualizar localStorage se necessário
          if (updates.username) {
            localStorage.setItem('auth-username', updates.username)
          }
          if (updates.email) {
            localStorage.setItem('auth-email', updates.email)
          }
          if (updates.roles) {
            localStorage.setItem('auth-roles', JSON.stringify(updates.roles))
          }
        }
      },

      // Limpar autenticação
      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false
        })
      },

      // Verificar se usuário tem determinada role
      hasRole: (role: string) => {
        const user = get().user
        return user ? user.roles.includes(role) : false
      },

      // Verificar se é admin
      isAdmin: () => {
        return get().hasRole('admin')
      },

      // Verificar se é usuário comum
      isUser: () => {
        return get().hasRole('user')
      }
    }),
    {
      name: 'auth-storage', // Nome da chave no localStorage
      partialize: (state) => ({
        // Persistir apenas dados essenciais
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
