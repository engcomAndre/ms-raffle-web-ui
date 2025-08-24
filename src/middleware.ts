import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // TEMPORARIAMENTE DESABILITADO para testar redirecionamento
  // TODO: Implementar verificação de token via localStorage ou cookies
  
  // Se estiver na rota raiz, redirecionar para /welcome
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/welcome', request.url))
  }
  
  // Permitir acesso a todas as outras rotas por enquanto
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 