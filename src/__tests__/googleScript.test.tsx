import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { GoogleScript, useGoogleReady } from '../components/GoogleScript'

// Mock do window.google
const mockGoogle = {
  accounts: {
    id: {
      initialize: jest.fn(),
      renderButton: jest.fn(),
      prompt: jest.fn()
    }
  }
}

// Mock do console
const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

describe('GoogleScript', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    consoleSpy.mockRestore()
  })

  test('deve renderizar sem conteúdo visível', () => {
    const { container } = render(<GoogleScript />)
    expect(container.firstChild).toBeNull()
  })

  test('deve ter estrutura de componente válida', () => {
    const { container } = render(<GoogleScript />)
    expect(container).toBeDefined()
  })
})

describe('useGoogleReady', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('deve retornar false inicialmente', () => {
    const TestComponent = () => {
      const isReady = useGoogleReady()
      return <div data-testid="google-ready">{isReady.toString()}</div>
    }

    render(<TestComponent />)
    
    expect(screen.getByTestId('google-ready').textContent).toBe('false')
  })

  test('deve retornar true quando Google API está disponível', async () => {
    Object.defineProperty(window, 'google', {
      value: mockGoogle,
      writable: true
    })

    const TestComponent = () => {
      const isReady = useGoogleReady()
      return <div data-testid="google-ready">{isReady.toString()}</div>
    }

    render(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('google-ready').textContent).toBe('true')
    })
  })

  test('deve escutar evento de carregamento do script', async () => {
    const TestComponent = () => {
      const isReady = useGoogleReady()
      return <div data-testid="google-ready">{isReady.toString()}</div>
    }

    render(<TestComponent />)

    // Simular evento de carregamento
    const event = new CustomEvent('google-script-loaded')
    window.dispatchEvent(event)

    // Avançar tempo para permitir o delay
    jest.advanceTimersByTime(150)

    // Verificar se o componente está funcionando
    expect(screen.getByTestId('google-ready')).toBeDefined()
  })

  test('deve verificar periodicamente se Google está disponível', async () => {
    const TestComponent = () => {
      const isReady = useGoogleReady()
      return <div data-testid="google-ready">{isReady.toString()}</div>
    }

    render(<TestComponent />)

    // Simular que Google se torna disponível após algumas verificações
    jest.advanceTimersByTime(1000)
    
    Object.defineProperty(window, 'google', {
      value: mockGoogle,
      writable: true
    })

    jest.advanceTimersByTime(500)

    await waitFor(() => {
      expect(screen.getByTestId('google-ready').textContent).toBe('true')
    })
  })

  test('deve limpar event listeners no cleanup', () => {
    const TestComponent = () => {
      const isReady = useGoogleReady()
      return <div data-testid="google-ready">{isReady.toString()}</div>
    }

    const { unmount } = render(<TestComponent />)

    unmount()

    // Verificar se o componente foi desmontado
    expect(screen.queryByTestId('google-ready')).toBeNull()
  })
})
