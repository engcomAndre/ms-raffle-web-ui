import React from 'react'
import { render, screen } from '@testing-library/react'
import HomePage from '../app/page'

// Mock do hook useGoogleButtonSafe
jest.mock('../hooks/useGoogleButtonSafe', () => ({
  useGoogleButtonSafe: jest.fn()
}))

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

const mockUseGoogleButtonSafe = require('../hooks/useGoogleButtonSafe').useGoogleButtonSafe
const mockUseRouter = require('next/navigation').useRouter

describe('HomePage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush })
  })

  test('deve renderizar a página de carregamento', () => {
    mockUseGoogleButtonSafe.mockReturnValue({
      isAuthenticated: false,
      isLoading: true
    })

    render(<HomePage />)

    expect(screen.getByText('Carregando MS Raffle...')).toBeInTheDocument()
    expect(screen.getByText('Carregando MS Raffle...')).toBeInTheDocument()
  })

  test('deve redirecionar usuário autenticado para /playground', () => {
    mockUseGoogleButtonSafe.mockReturnValue({
      isAuthenticated: true,
      isLoading: false
    })

    render(<HomePage />)

    expect(mockPush).toHaveBeenCalledWith('/playground')
  })

  test('deve redirecionar usuário não autenticado para /welcome', () => {
    mockUseGoogleButtonSafe.mockReturnValue({
      isAuthenticated: false,
      isLoading: false
    })

    render(<HomePage />)

    expect(mockPush).toHaveBeenCalledWith('/welcome')
  })

  test('deve mostrar spinner de carregamento', () => {
    mockUseGoogleButtonSafe.mockReturnValue({
      isAuthenticated: false,
      isLoading: true
    })

    render(<HomePage />)

    const spinner = screen.getByText('Carregando MS Raffle...').previousElementSibling
    expect(spinner).toHaveClass('animate-spin')
    expect(spinner).toHaveClass('rounded-full')
    expect(spinner).toHaveClass('h-12')
    expect(spinner).toHaveClass('w-12')
  })

  test('deve ter o gradiente de fundo correto', () => {
    mockUseGoogleButtonSafe.mockReturnValue({
      isAuthenticated: false,
      isLoading: true
    })

    render(<HomePage />)

    const container = screen.getByText('Carregando MS Raffle...').closest('div')?.parentElement
    expect(container).toHaveClass('min-h-screen')
    expect(container).toHaveClass('bg-gradient-to-br')
    expect(container).toHaveClass('from-blue-500')
    expect(container).toHaveClass('to-purple-600')
  })

  test('deve centralizar o conteúdo', () => {
    mockUseGoogleButtonSafe.mockReturnValue({
      isAuthenticated: false,
      isLoading: true
    })

    render(<HomePage />)

    const container = screen.getByText('Carregando MS Raffle...').closest('div')?.parentElement
    expect(container).toHaveClass('flex')
    expect(container).toHaveClass('items-center')
    expect(container).toHaveClass('justify-center')
  })

  test('deve ter texto de carregamento estilizado', () => {
    mockUseGoogleButtonSafe.mockReturnValue({
      isAuthenticated: false,
      isLoading: true
    })

    render(<HomePage />)

    const text = screen.getByText('Carregando MS Raffle...')
    expect(text).toHaveClass('text-lg')
    expect(text).toHaveClass('font-medium')
    expect(text).toHaveClass('text-lg')
  })

  test('deve não redirecionar quando ainda está carregando', () => {
    mockUseGoogleButtonSafe.mockReturnValue({
      isAuthenticated: false,
      isLoading: true
    })

    render(<HomePage />)

    expect(mockPush).not.toHaveBeenCalled()
  })

  test('deve redirecionar apenas uma vez quando carregamento termina', () => {
    mockUseGoogleButtonSafe.mockReturnValue({
      isAuthenticated: false,
      isLoading: false
    })

    render(<HomePage />)

    expect(mockPush).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/welcome')
  })
})
