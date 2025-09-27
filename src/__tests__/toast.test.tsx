import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toast } from '@/components/Toast'

describe('Toast', () => {
  test('renderiza e fecha automaticamente após a duração', async () => {
    jest.useFakeTimers()
    const onClose = jest.fn()
    render(<Toast message="Sucesso!" type="success" duration={1000} onClose={onClose} />)

    expect(screen.getByText('Sucesso!')).toBeInTheDocument()

    jest.advanceTimersByTime(1000)

    // onClose chamado e toast removido
    expect(onClose).toHaveBeenCalled()
  })

  test('permite fechar manualmente pelo botão', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const onClose = jest.fn()
    render(<Toast message="Erro!" type="error" duration={5000} onClose={onClose} />)

    const closeButton = screen.getByRole('button')
    await user.click(closeButton)
    jest.advanceTimersByTime(0)

    expect(onClose).toHaveBeenCalled()
  })
})


