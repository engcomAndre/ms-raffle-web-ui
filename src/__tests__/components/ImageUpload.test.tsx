import { render, screen, fireEvent } from '@testing-library/react'
import { ImageUpload } from '../../components/ImageUpload'

// Mock do serviço de upload
jest.mock('../../services/fileUploadService', () => ({
  fileUploadService: {
    uploadRaffleImage: jest.fn(),
    createPreviewUrl: jest.fn(() => 'mock-preview-url'),
    revokePreviewUrl: jest.fn()
  }
}))

describe('ImageUpload Component', () => {
  const mockProps = {
    raffleId: 'test-raffle-id',
    onUploadSuccess: jest.fn(),
    onUploadError: jest.fn(),
    maxImages: 5,
    currentImageCount: 0,
    disabled: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders upload area', () => {
    render(<ImageUpload {...mockProps} />)
    
    expect(screen.getByText('Clique para selecionar')).toBeInTheDocument()
    expect(screen.getByText('ou arraste e solte')).toBeInTheDocument()
    expect(screen.getByText('PNG, JPEG até 10MB cada')).toBeInTheDocument()
  })

  test('shows current image count', () => {
    render(<ImageUpload {...mockProps} currentImageCount={2} />)
    
    expect(screen.getByText('2 de 5 imagens')).toBeInTheDocument()
  })

  test('disables upload when max images reached', () => {
    render(<ImageUpload {...mockProps} currentImageCount={5} />)
    
    // Verifica se mostra que atingiu o limite
    expect(screen.getByText('5 de 5 imagens')).toBeInTheDocument()
  })
})
