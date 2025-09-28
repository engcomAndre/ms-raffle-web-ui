import { render, screen } from '@testing-library/react'
import WelcomePage from '@/app/welcome/page'

// Mock do componente WelcomePage
jest.mock('@/app/welcome/welcome', () => ({
  __esModule: true,
  default: () => <div data-testid="welcome-component">Welcome Component</div>
}))

describe('Welcome Page', () => {
  test('deve renderizar o componente WelcomePage', () => {
    render(<WelcomePage />)
    
    expect(screen.getByTestId('welcome-component')).toBeInTheDocument()
    expect(screen.getByText('Welcome Component')).toBeInTheDocument()
  })

  test('deve ser um componente funcional simples', () => {
    const { container } = render(<WelcomePage />)
    
    expect(container.firstChild).toBeInTheDocument()
  })
})

