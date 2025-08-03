import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verificar se existe um token de autenticação
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  // Rotas que não precisam de autenticação
  const publicRoutes = ['/welcome', '/login', '/register']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Se estiver na rota raiz e não tiver token, redirecionar para /welcome
  if (pathname === '/' && !token) {
    return NextResponse.redirect(new URL('/welcome', request.url))
  }
  
  // Se estiver em uma rota protegida e não tiver token, redirecionar para /welcome
  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/playground')) && !token) {
    return NextResponse.redirect(new URL('/welcome', request.url))
  }
  
  // Se tiver token e estiver em uma rota pública, redirecionar para /playground
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/playground', request.url))
  }
  
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