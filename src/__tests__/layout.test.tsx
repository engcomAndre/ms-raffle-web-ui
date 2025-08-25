import React from 'react'
import { render } from '@testing-library/react'
import RootLayout from '../app/layout'

// Mock do componente GoogleScript
jest.mock('@/components/GoogleScript', () => ({
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

    // Verificar se o HTML tem o idioma correto
    const htmlElement = container.querySelector('html')
    expect(htmlElement).toHaveAttribute('lang', 'pt-BR')

    // Verificar se o head contém o script do Google
    const headElement = container.querySelector('head')
    expect(headElement).toBeInTheDocument()

    // Verificar se o body tem a classe antialiased
    const bodyElement = container.querySelector('body')
    expect(bodyElement).toHaveClass('antialiased')
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

    // Verificar se tem html, head e body
    expect(container.querySelector('html')).toBeInTheDocument()
    expect(container.querySelector('head')).toBeInTheDocument()
    expect(container.querySelector('body')).toBeInTheDocument()

    // Verificar se o GoogleScript está no body
    const body = container.querySelector('body')
    expect(body?.querySelector('[data-testid="google-script"]')).toBeInTheDocument()
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

    expect(container.querySelector('html')).toBeInTheDocument()
    expect(container.querySelector('head')).toBeInTheDocument()
    expect(container.querySelector('body')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="google-script"]')).toBeInTheDocument()
  })
})
