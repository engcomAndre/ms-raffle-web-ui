import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExistingImageList } from '../../components/ExistingImageList'
import { fileUploadService } from '../../services/fileUploadService'

// Mock do serviço de upload
jest.mock('../../services/fileUploadService', () => ({
  fileUploadService: {
    deleteRaffleImage: jest.fn()
  }
}))

// Mock do window.confirm
const mockConfirm = jest.fn()
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true
})

// Mock do window.alert
const mockAlert = jest.fn()
Object.defineProperty(window, 'alert', {
  value: mockAlert,
  writable: true
})

describe('ExistingImageList Component', () => {
  const mockProps = {
    raffleId: 'test-raffle-id',
    imageUrls: [
      'http://localhost:4566/files/image1.jpg',
      'http://localhost:4566/files/image2.jpg'
    ],
    onImageDeleted: jest.fn(),
    disabled: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockConfirm.mockReturnValue(true)
  })

  test('renders existing images', () => {
    render(<ExistingImageList {...mockProps} />)
    
    expect(screen.getByText('Imagens Existentes (2)')).toBeInTheDocument()
    expect(screen.getAllByAltText(/Imagem \d+/)).toHaveLength(2)
  })

  test('does not render when no images', () => {
    render(<ExistingImageList {...mockProps} imageUrls={[]} />)
    
    expect(screen.queryByText('Imagens Existentes')).not.toBeInTheDocument()
  })

  test('shows delete buttons on hover', () => {
    render(<ExistingImageList {...mockProps} />)
    
    const deleteButtons = screen.getAllByTitle('Excluir imagem')
    expect(deleteButtons).toHaveLength(2)
    
    // Botões devem estar ocultos inicialmente (opacity-0)
    deleteButtons.forEach(button => {
      expect(button).toHaveClass('opacity-0')
    })
  })

  test('calls onImageDeleted when image is successfully deleted', async () => {
    const mockDeleteRaffleImage = fileUploadService.deleteRaffleImage as jest.MockedFunction<typeof fileUploadService.deleteRaffleImage>
    mockDeleteRaffleImage.mockResolvedValue({
      success: true,
      message: 'Imagem excluída com sucesso'
    })

    render(<ExistingImageList {...mockProps} />)
    
    const deleteButtons = screen.getAllByTitle('Excluir imagem')
    fireEvent.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith('Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita.')
      expect(mockDeleteRaffleImage).toHaveBeenCalledWith(
        mockProps.raffleId,
        mockProps.imageUrls[0]
      )
      expect(mockProps.onImageDeleted).toHaveBeenCalledWith(mockProps.imageUrls[0])
    })
  })

  test('does not delete when user cancels confirmation', async () => {
    mockConfirm.mockReturnValue(false)
    const mockDeleteRaffleImage = fileUploadService.deleteRaffleImage as jest.MockedFunction<typeof fileUploadService.deleteRaffleImage>

    render(<ExistingImageList {...mockProps} />)
    
    const deleteButtons = screen.getAllByTitle('Excluir imagem')
    fireEvent.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled()
      expect(mockDeleteRaffleImage).not.toHaveBeenCalled()
      expect(mockProps.onImageDeleted).not.toHaveBeenCalled()
    })
  })

  test('shows error alert when deletion fails', async () => {
    const mockDeleteRaffleImage = fileUploadService.deleteRaffleImage as jest.MockedFunction<typeof fileUploadService.deleteRaffleImage>
    mockDeleteRaffleImage.mockResolvedValue({
      success: false,
      error: 'API Error'
    })

    render(<ExistingImageList {...mockProps} />)
    
    const deleteButtons = screen.getAllByTitle('Excluir imagem')
    fireEvent.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Erro ao excluir imagem: API Error')
      expect(mockProps.onImageDeleted).not.toHaveBeenCalled()
    })
  })

  test('disables delete buttons when disabled prop is true', () => {
    render(<ExistingImageList {...mockProps} disabled={true} />)
    
    const deleteButtons = screen.getAllByTitle('Excluir imagem')
    deleteButtons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  test('shows loading state during deletion', async () => {
    const mockDeleteRaffleImage = fileUploadService.deleteRaffleImage as jest.MockedFunction<typeof fileUploadService.deleteRaffleImage>
    // Mock uma promise que não resolve imediatamente
    mockDeleteRaffleImage.mockImplementation(() => new Promise(() => {}))

    render(<ExistingImageList {...mockProps} />)
    
    const deleteButtons = screen.getAllByTitle('Excluir imagem')
    fireEvent.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText('Excluindo...')).toBeInTheDocument()
      expect(screen.getByTitle('Excluindo...')).toBeInTheDocument()
    })
  })

  test('handles image load error with fallback', () => {
    render(<ExistingImageList {...mockProps} />)
    
    const images = screen.getAllByAltText(/Imagem \d+/)
    fireEvent.error(images[0])
    
    // Verifica se a imagem foi substituída pelo fallback
    expect(images[0]).toHaveAttribute('src', expect.stringContaining('data:image/svg+xml'))
  })
})
