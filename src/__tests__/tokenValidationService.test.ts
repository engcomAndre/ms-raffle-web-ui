import { TokenValidationService } from '@/services/tokenValidationService'

// atob polyfill for Node
global.atob = (data: string) => Buffer.from(data, 'base64').toString('binary')

describe('TokenValidationService', () => {
  let svc: TokenValidationService
  const originalLocation = window.location

  beforeEach(() => {
    svc = new TokenValidationService()
    // mock location.href de forma segura
    Object.defineProperty(window, 'location', {
      value: { href: '', reload: jest.fn() },
      writable: true
    })
    localStorage.clear()
  })

  afterEach(() => {
    // restore
    // @ts-ignore
    window.location = originalLocation
  })

  const buildToken = (payload: any) => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
    return `${header}.${body}.sig`
  }

  test('validateToken retorna válido quando JWT não expirou e possui campos', async () => {
    const now = Math.floor(Date.now() / 1000) + 3600
    const token = buildToken({ sub: '1', preferred_username: 'user', email: 'u@e.com', realm_access: { roles: ['USER'] }, exp: now })
    const res = await svc.validateToken(token)
    expect(res.valid).toBe(true)
    expect(res.user?.username).toBe('user')
  })

  test('validateAndRedirect redireciona para playground quando válido', async () => {
    const now = Math.floor(Date.now() / 1000) + 3600
    const token = buildToken({ sub: '1', preferred_username: 'user', email: 'u@e.com', realm_access: { roles: ['USER'] }, exp: now })
    const ok = await svc.validateAndRedirect(token, '/playground')
    expect(ok).toBe(true)
    expect(window.location.href).toBe('/playground')
  })

  test('validateAndRedirect redireciona para welcome quando inválido', async () => {
    const now = Math.floor(Date.now() / 1000) - 10
    const token = buildToken({ sub: '1', preferred_username: 'user', email: 'u@e.com', exp: now })
    const ok = await svc.validateAndRedirect(token)
    expect(ok).toBe(false)
    expect(window.location.href).toBe('/welcome')
  })
})


