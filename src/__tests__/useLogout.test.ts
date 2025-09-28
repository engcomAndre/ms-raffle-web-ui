import { useLogout } from '../hooks/useLogout'
import { UserPassLoginService } from '../services/userPassLoginService'
import { GoogleLoginService } from '../services/googleLoginService'

// Mock dos serviços
jest.mock('../services/userPassLoginService')
jest.mock('../services/googleLoginService')

const mockUserPassLoginService = UserPassLoginService as jest.MockedClass<typeof UserPassLoginService>
const mockGoogleLoginService = GoogleLoginService as jest.MockedClass<typeof GoogleLoginService>

describe('useLogout', () => {
  let mockUserPassService: any
  let mockGoogleService: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock dos serviços
    mockUserPassService = {
      logout: jest.fn()
    }
    
    mockGoogleService = {
      logout: jest.fn()
    }
    
    mockUserPassLoginService.mockImplementation(() => mockUserPassService)
    mockGoogleLoginService.mockImplementation(() => mockGoogleService)
    
    // Mock do localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    })
    
    // Mock do window.location
    delete (window as any).location
    window.location = { href: '' } as any
  })

  describe('logout', () => {
    it('deve usar GoogleLoginService quando provider é google', () => {
      // Mock do localStorage para retornar 'google'
      ;(localStorage.getItem as jest.Mock).mockReturnValue('google')

      const { logout } = useLogout()
      logout()

      // Verificar se o GoogleLoginService foi instanciado e chamado
      expect(mockGoogleLoginService).toHaveBeenCalled()
      expect(mockGoogleService.logout).toHaveBeenCalled()
      
      // Verificar se o UserPassLoginService não foi chamado
      expect(mockUserPassLoginService).not.toHaveBeenCalled()
      
      // Verificar que o logout foi executado sem erro
      expect(mockGoogleService.logout).toHaveBeenCalled()
    })

    it('deve usar UserPassLoginService quando provider não é google', () => {
      // Mock do localStorage para retornar 'userpass'
      ;(localStorage.getItem as jest.Mock).mockReturnValue('userpass')

      const { logout } = useLogout()
      logout()

      // Verificar se o UserPassLoginService foi instanciado e chamado
      expect(mockUserPassLoginService).toHaveBeenCalled()
      expect(mockUserPassService.logout).toHaveBeenCalled()
      
      // Verificar se o GoogleLoginService não foi chamado
      expect(mockGoogleLoginService).not.toHaveBeenCalled()
      
      // Verificar que o logout foi executado sem erro
      expect(mockUserPassService.logout).toHaveBeenCalled()
    })

    it('deve usar UserPassLoginService quando provider é null', () => {
      // Mock do localStorage para retornar null
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)

      const { logout } = useLogout()
      logout()

      // Verificar se o UserPassLoginService foi instanciado e chamado
      expect(mockUserPassLoginService).toHaveBeenCalled()
      expect(mockUserPassService.logout).toHaveBeenCalled()
      
      // Verificar se o GoogleLoginService não foi chamado
      expect(mockGoogleLoginService).not.toHaveBeenCalled()
      
      // Verificar que o logout foi executado sem erro
      expect(mockUserPassService.logout).toHaveBeenCalled()
    })

    it('deve usar UserPassLoginService quando provider é undefined', () => {
      // Mock do localStorage para retornar undefined
      ;(localStorage.getItem as jest.Mock).mockReturnValue(undefined)

      const { logout } = useLogout()
      logout()

      // Verificar se o UserPassLoginService foi instanciado e chamado
      expect(mockUserPassLoginService).toHaveBeenCalled()
      expect(mockUserPassService.logout).toHaveBeenCalled()
      
      // Verificar se o GoogleLoginService não foi chamado
      expect(mockGoogleLoginService).not.toHaveBeenCalled()
      
      // Verificar que o logout foi executado sem erro
      expect(mockUserPassService.logout).toHaveBeenCalled()
    })

    it('deve lidar com erro durante logout e usar logout básico', () => {
      // Mock do localStorage para lançar erro
      ;(localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const { logout } = useLogout()
      logout()

      // Verificar se o localStorage.clear foi chamado
      expect(localStorage.clear).toHaveBeenCalled()
      
      // Verificar que nenhum serviço foi chamado (logout básico)
      expect(mockUserPassService.logout).not.toHaveBeenCalled()
      expect(mockGoogleService.logout).not.toHaveBeenCalled()
    })

    it('deve lidar com erro de redirecionamento', () => {
      // Mock do localStorage para retornar 'google'
      ;(localStorage.getItem as jest.Mock).mockReturnValue('google')
      
      // Mock do window.location que lança erro
      window.location = {
        get href() { return '' },
        set href(value) { throw new Error('Navigation error') }
      } as any

      const { logout } = useLogout()
      
      // Não deve lançar erro
      expect(() => logout()).not.toThrow()
    })
  })
})
