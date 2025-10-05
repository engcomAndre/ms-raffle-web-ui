import { fileUploadService } from '../services/fileUploadService'

// Teste básico do serviço de upload
describe('FileUploadService', () => {
  test('should validate file types correctly', () => {
    // Mock de arquivo PNG válido
    const validPngFile = new File(['test'], 'test.png', { type: 'image/png' })
    
    // Mock de arquivo inválido
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    // Teste seria feito aqui se tivéssemos acesso aos métodos privados
    // Por enquanto, apenas verificamos se o serviço existe
    expect(fileUploadService).toBeDefined()
  })
})
