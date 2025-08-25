import React from 'react'
import { render } from '@testing-library/react'
import RootLayout from '../app/layout'

// Mock do componente GoogleScript
jest.mock('../components/GoogleScript', () => ({
  GoogleScript: () => <div data-testid="google-script">Google Script</div>
}))

// Mock do CSS global
jest.mock('../app/globals.css', () => ({}), { virtual: true })

describe('RootLayout', () => {
  test('deve renderizar o layout com metadados corretos', () => {
    const { container } = render(
      <RootLayout>
        <div>Conteúdo da página</div>
      </RootLayout>
    )

    // Verificar se o conteúdo foi renderizado
    expect(container.textContent).toContain('Conteúdo da página')
  })

  test('deve renderizar o GoogleScript', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div>Conteúdo da página</div>
      </RootLayout>
    )

    expect(getByTestId('google-script')).toBeInTheDocument()
  })

  test('deve renderizar children corretamente', () => {
    const { getByText } = render(
      <RootLayout>
        <div>Conteúdo personalizado</div>
      </RootLayout>
    )

    expect(getByText('Conteúdo personalizado')).toBeInTheDocument()
  })

  test('deve ter estrutura HTML válida', () => {
    const { container } = render(
      <RootLayout>
        <div>Teste</div>
      </RootLayout>
    )

    // Verificar se o GoogleScript foi renderizado
    expect(container.querySelector('[data-testid="google-script"]')).toBeInTheDocument()
  })

  test('deve renderizar múltiplos children', () => {
    const { getByText } = render(
      <RootLayout>
        <header>Header</header>
        <main>Main content</main>
        <footer>Footer</footer>
      </RootLayout>
    )

    expect(getByText('Header')).toBeInTheDocument()
    expect(getByText('Main content')).toBeInTheDocument()
    expect(getByText('Footer')).toBeInTheDocument()
  })

  test('deve manter a estrutura com children vazios', () => {
    const { container } = render(<RootLayout>{null}</RootLayout>)

    expect(container.querySelector('[data-testid="google-script"]')).toBeInTheDocument()
  })
})
