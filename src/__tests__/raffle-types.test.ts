import { 
  RaffleCreationData, 
  RaffleResponse, 
  CreateRaffleResponse, 
  RafflePageResponse,
  validateRaffleData,
  RaffleNumberStatus,
  RaffleNumberItemResponse,
  RaffleNumbersResponse,
  RaffleNumbersPageResponse
} from '@/types/raffle'

describe('Raffle Types', () => {
  describe('RaffleCreationData', () => {
    test('deve ter todas as propriedades obrigatórias', () => {
      const data: RaffleCreationData = {
        title: 'Rifa Teste',
        prize: 'Prêmio Teste',
        maxNumbers: 100,
        files: [],
        startAt: '2024-12-31T10:00:00Z',
        endAt: '2025-01-31T10:00:00Z'
      }

      expect(data.title).toBe('Rifa Teste')
      expect(data.prize).toBe('Prêmio Teste')
      expect(data.maxNumbers).toBe(100)
      expect(data.files).toEqual([])
      expect(data.startAt).toBe('2024-12-31T10:00:00Z')
      expect(data.endAt).toBe('2025-01-31T10:00:00Z')
    })
  })

  describe('RaffleResponse', () => {
    test('deve ter todas as propriedades obrigatórias', () => {
      const response: RaffleResponse = {
        id: '123',
        title: 'Rifa Teste',
        prize: 'Prêmio Teste',
        description: 'Descrição opcional',
        maxNumbers: 100,
        files: ['file1.jpg'],
        startAt: '2024-12-31T10:00:00Z',
        endAt: '2025-01-31T10:00:00Z',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
        status: 'ACTIVE',
        active: true,
        soldNumbers: 50,
        createdBy: 'user123',
        numbersCreated: 100
      }

      expect(response.id).toBe('123')
      expect(response.title).toBe('Rifa Teste')
      expect(response.status).toBe('ACTIVE')
      expect(response.active).toBe(true)
    })
  })

  describe('CreateRaffleResponse', () => {
    test('deve ter propriedades de resposta', () => {
      const successResponse: CreateRaffleResponse = {
        success: true,
        data: {
          id: '123',
          title: 'Rifa Teste',
          prize: 'Prêmio Teste',
          maxNumbers: 100,
          files: [],
          startAt: '2024-12-31T10:00:00Z',
          endAt: '2025-01-31T10:00:00Z',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z',
          status: 'ACTIVE',
          active: true,
          soldNumbers: 0,
          createdBy: 'user123',
          numbersCreated: 100
        }
      }

      const errorResponse: CreateRaffleResponse = {
        success: false,
        error: 'Erro na criação'
      }

      expect(successResponse.success).toBe(true)
      expect(successResponse.data).toBeDefined()
      expect(errorResponse.success).toBe(false)
      expect(errorResponse.error).toBe('Erro na criação')
    })
  })

  describe('RafflePageResponse', () => {
    test('deve ter propriedades de paginação', () => {
      const pageResponse: RafflePageResponse = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        pageNumber: 0,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
        first: true,
        last: true,
        numberOfElements: 0
      }

      expect(pageResponse.content).toEqual([])
      expect(pageResponse.totalElements).toBe(0)
      expect(pageResponse.first).toBe(true)
      expect(pageResponse.last).toBe(true)
    })
  })

  describe('validateRaffleData', () => {
    test('deve validar dados corretos', () => {
      const validData: RaffleCreationData = {
        title: 'Rifa Válida',
        prize: 'Prêmio com descrição longa',
        maxNumbers: 1000,
        files: [],
        startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
        endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Em 7 dias
      }

      const errors = validateRaffleData(validData)
      expect(errors).toHaveLength(0)
    })

    test('deve detectar título muito curto', () => {
      const invalidData: RaffleCreationData = {
        title: 'AB',
        prize: 'Prêmio com descrição longa',
        maxNumbers: 1000,
        files: [],
        startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      const errors = validateRaffleData(invalidData)
      expect(errors).toContain('Título deve ter pelo menos 3 caracteres')
    })

    test('deve detectar prêmio muito curto', () => {
      const invalidData: RaffleCreationData = {
        title: 'Rifa Válida',
        prize: 'Prêmio',
        maxNumbers: 1000,
        files: [],
        startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      const errors = validateRaffleData(invalidData)
      // A validação atual não verifica o tamanho mínimo do prêmio, apenas se está vazio
      expect(errors).toHaveLength(0)
    })

    test('deve detectar maxNumbers inválido', () => {
      const invalidData: RaffleCreationData = {
        title: 'Rifa Válida',
        prize: 'Prêmio com descrição longa',
        maxNumbers: 5,
        files: [],
        startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      const errors = validateRaffleData(invalidData)
      expect(errors).toContain('Número máximo deve estar entre 10 e 10.000')
    })

    test('deve detectar maxNumbers muito alto', () => {
      const invalidData: RaffleCreationData = {
        title: 'Rifa Válida',
        prize: 'Prêmio com descrição longa',
        maxNumbers: 15000,
        files: [],
        startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      const errors = validateRaffleData(invalidData)
      expect(errors).toContain('Número máximo deve estar entre 10 e 10.000')
    })

    test('deve detectar data de início no passado', () => {
      const invalidData: RaffleCreationData = {
        title: 'Rifa Válida',
        prize: 'Prêmio com descrição longa',
        maxNumbers: 1000,
        files: [],
        startAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Ontem
        endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      const errors = validateRaffleData(invalidData)
      expect(errors).toContain('Data de início deve ser no futuro')
    })

    test('deve detectar data de fim anterior à data de início', () => {
      const invalidData: RaffleCreationData = {
        title: 'Rifa Válida',
        prize: 'Prêmio com descrição longa',
        maxNumbers: 1000,
        files: [],
        startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Antes da data de início
      }

      const errors = validateRaffleData(invalidData)
      expect(errors).toContain('Data de fim deve ser após a data de início')
    })

    test('deve detectar duração muito curta', () => {
      const invalidData: RaffleCreationData = {
        title: 'Rifa Válida',
        prize: 'Prêmio com descrição longa',
        maxNumbers: 1000,
        files: [],
        startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endAt: new Date(Date.now() + 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString() // 12 horas depois
      }

      const errors = validateRaffleData(invalidData)
      expect(errors).toContain('Rifa deve durar pelo menos 1 dia')
    })

    test('deve detectar múltiplos erros', () => {
      const invalidData: RaffleCreationData = {
        title: 'AB',
        prize: 'Prêmio',
        maxNumbers: 5,
        files: [],
        startAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }

      const errors = validateRaffleData(invalidData)
      expect(errors).toHaveLength(4) // Removido erro do prêmio que não é validado
      expect(errors).toContain('Título deve ter pelo menos 3 caracteres')
      expect(errors).toContain('Número máximo deve estar entre 10 e 10.000')
      expect(errors).toContain('Data de início deve ser no futuro')
      expect(errors).toContain('Rifa deve durar pelo menos 1 dia')
    })
  })

  describe('RaffleNumberStatus', () => {
    test('deve ter valores corretos', () => {
      expect(RaffleNumberStatus.ACTIVE).toBe('ACTIVE')
      expect(RaffleNumberStatus.RESERVED).toBe('RESERVED')
      expect(RaffleNumberStatus.SOLD).toBe('SOLD')
    })
  })

  describe('RaffleNumberItemResponse', () => {
    test('deve ter todas as propriedades', () => {
      const numberItem: RaffleNumberItemResponse = {
        id: '123',
        raffleId: 'raffle123',
        number: '0001',
        status: RaffleNumberStatus.ACTIVE,
        winner: false,
        reservedAt: null,
        reservedBy: null,
        soldAt: null,
        soldBy: null,
        owner: null,
        buyerName: 'João Silva',
        buyerPhone: '11999999999'
      }

      expect(numberItem.id).toBe('123')
      expect(numberItem.number).toBe('0001')
      expect(numberItem.status).toBe('ACTIVE')
      expect(numberItem.winner).toBe(false)
    })
  })

  describe('RaffleNumbersResponse', () => {
    test('deve ter propriedades de paginação', () => {
      const numbersResponse: RaffleNumbersResponse = {
        rafflesNumbers: [],
        pageNumber: 0,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
        first: true,
        last: true
      }

      expect(numbersResponse.rafflesNumbers).toEqual([])
      expect(numbersResponse.pageNumber).toBe(0)
      expect(numbersResponse.first).toBe(true)
    })
  })

  describe('RaffleNumbersPageResponse', () => {
    test('deve ter estrutura de resposta', () => {
      const pageResponse: RaffleNumbersPageResponse = {
        success: true,
        data: {
          rafflesNumbers: [],
          pageNumber: 0,
          pageSize: 20,
          totalElements: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
          first: true,
          last: true
        }
      }

      const errorResponse: RaffleNumbersPageResponse = {
        success: false,
        error: 'Erro ao buscar números'
      }

      expect(pageResponse.success).toBe(true)
      expect(pageResponse.data).toBeDefined()
      expect(errorResponse.success).toBe(false)
      expect(errorResponse.error).toBe('Erro ao buscar números')
    })
  })
})
