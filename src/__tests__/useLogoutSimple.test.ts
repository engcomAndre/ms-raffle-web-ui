import { useLogout } from '../hooks/useLogout'

// Mock dos serviços
jest.mock('../services/userPassLoginService', () => ({
  UserPassLoginService: jest.fn().mockImplementation(() => ({
    logout: jest.fn()
  }))
}))

jest.mock('../services/googleLoginService', () => ({
  GoogleLoginService: jest.fn().mockImplementation(() => ({
    logout: jest.fn()
  }))
}))

describe('useLogout - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock do localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    })
  })

  describe('logout', () => {
    it('deve executar logout sem erro quando provider é google', () => {
      // Mock do localStorage para retornar 'google'
      ;(localStorage.getItem as jest.Mock).mockReturnValue('google')

      const { logout } = useLogout()
      
      // Não deve lançar erro
      expect(() => logout()).not.toThrow()
    })

    it('deve executar logout sem erro quando provider não é google', () => {
      // Mock do localStorage para retornar 'userpass'
      ;(localStorage.getItem as jest.Mock).mockReturnValue('userpass')

      const { logout } = useLogout()
      
      // Não deve lançar erro
      expect(() => logout()).not.toThrow()
    })

    it('deve executar logout sem erro quando provider é null', () => {
      // Mock do localStorage para retornar null
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)

      const { logout } = useLogout()
      
      // Não deve lançar erro
      expect(() => logout()).not.toThrow()
    })

    it('deve executar logout sem erro quando provider é undefined', () => {
      // Mock do localStorage para retornar undefined
      ;(localStorage.getItem as jest.Mock).mockReturnValue(undefined)

      const { logout } = useLogout()
      
      // Não deve lançar erro
      expect(() => logout()).not.toThrow()
    })

    it('deve lidar com erro durante logout', () => {
      // Mock do localStorage para lançar erro
      ;(localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const { logout } = useLogout()
      
      // Não deve lançar erro
      expect(() => logout()).not.toThrow()
    })
  })
})
