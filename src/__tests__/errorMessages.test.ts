import { getErrorMessage, isAuthenticationError, isValidationError, isConflictError } from '@/utils/errorMessages'

const wrap = (data: any) => ({ response: { data } })

describe('errorMessages', () => {
  test('prioriza userMessage', () => {
    expect(getErrorMessage(wrap({ userMessage: 'Mensagem ao usuário', message: 'Outra', status: 400 }))).toBe('Mensagem ao usuário')
  })

  test('usa message quando não há userMessage', () => {
    expect(getErrorMessage(wrap({ message: 'Mensagem geral' }))).toBe('Mensagem geral')
  })

  test('mapeia 404 com Active raffle', () => {
    expect(getErrorMessage(wrap({ status: 404, detail: 'Active raffle with id X not found' }))).toBe('Esta rifa não está ativa ou foi removida')
  })

  test('mapeia 409 Already reserved', () => {
    expect(getErrorMessage(wrap({ status: 409, detail: 'Already reserved' }))).toBe('Este número já foi reservado por outro usuário')
  })

  test('mapeia 410 sold', () => {
    expect(getErrorMessage(wrap({ status: 410 }))).toBe('Este número já foi vendido')
  })

  test('mapeia 400 Required header', () => {
    expect(getErrorMessage(wrap({ status: 400, detail: 'Required header Authorization is not present' }))).toBe('Erro de autenticação. Faça login novamente')
  })

  test('fallback desconhecido', () => {
    expect(getErrorMessage({} as any)).toBe('Erro desconhecido')
  })

  test('validators de tipo de erro', () => {
    expect(isAuthenticationError(wrap({ status: 401 }))).toBe(true)
    expect(isAuthenticationError(wrap({ status: 403 }))).toBe(true)
    expect(isValidationError(wrap({ status: 400 }))).toBe(true)
    expect(isValidationError(wrap({ status: 422 }))).toBe(true)
    expect(isConflictError(wrap({ status: 409 }))).toBe(true)
    expect(isConflictError(wrap({ status: 410 }))).toBe(true)
  })
})









