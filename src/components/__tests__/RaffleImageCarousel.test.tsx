import { render, screen, fireEvent } from '@testing-library/react'
import { RaffleImageCarousel } from '../RaffleImageCarousel'

describe('RaffleImageCarousel', () => {
  const mockImages = [
    'http://localhost:4566/files/image1.jpg',
    'http://localhost:4566/files/image2.jpg',
    'http://localhost:4566/files/image3.jpg'
  ]

  it('should render placeholder when no images are provided', () => {
    render(<RaffleImageCarousel images={[]} />)
    
    expect(screen.getByText('Sem imagens')).toBeInTheDocument()
    expect(screen.getByText('Sem imagens')).toHaveClass('text-xs', 'font-medium')
  })

  it('should render placeholder when images array is null', () => {
    render(<RaffleImageCarousel images={null as any} />)
    
    expect(screen.getByText('Sem imagens')).toBeInTheDocument()
  })

  it('should render the first image when images are provided', () => {
    render(<RaffleImageCarousel images={mockImages} />)
    
    const image = screen.getByAltText('Imagem 1 da rifa')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', mockImages[0])
  })

  it('should show navigation buttons on hover', () => {
    render(<RaffleImageCarousel images={mockImages} />)
    
    const carousel = screen.getByAltText('Imagem 1 da rifa').closest('div')
    
    // Hover over the carousel
    fireEvent.mouseEnter(carousel!)
    
    // Check if navigation buttons are visible
    expect(screen.getByLabelText('Imagem anterior')).toBeInTheDocument()
    expect(screen.getByLabelText('Próxima imagem')).toBeInTheDocument()
  })

  it('should hide navigation buttons when not hovering', () => {
    render(<RaffleImageCarousel images={mockImages} />)
    
    const carousel = screen.getByAltText('Imagem 1 da rifa').closest('div')
    
    // Initially, buttons should not be visible
    expect(screen.queryByLabelText('Imagem anterior')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Próxima imagem')).not.toBeInTheDocument()
  })

  it('should navigate to next image when next button is clicked', () => {
    render(<RaffleImageCarousel images={mockImages} />)
    
    const carousel = screen.getByAltText('Imagem 1 da rifa').closest('div')
    
    // Hover to show buttons
    fireEvent.mouseEnter(carousel!)
    
    // Click next button
    const nextButton = screen.getByLabelText('Próxima imagem')
    fireEvent.click(nextButton)
    
    // Check if second image is now displayed
    const image = screen.getByAltText('Imagem 2 da rifa')
    expect(image).toHaveAttribute('src', mockImages[1])
  })

  it('should navigate to previous image when previous button is clicked', () => {
    render(<RaffleImageCarousel images={mockImages} />)
    
    const carousel = screen.getByAltText('Imagem 1 da rifa').closest('div')
    
    // Hover to show buttons
    fireEvent.mouseEnter(carousel!)
    
    // Click previous button (should go to last image)
    const prevButton = screen.getByLabelText('Imagem anterior')
    fireEvent.click(prevButton)
    
    // Check if last image is now displayed
    const image = screen.getByAltText('Imagem 3 da rifa')
    expect(image).toHaveAttribute('src', mockImages[2])
  })

  it('should show image counter when multiple images exist', () => {
    render(<RaffleImageCarousel images={mockImages} />)
    
    expect(screen.getByText('1/3')).toBeInTheDocument()
  })

  it('should not show image counter when only one image exists', () => {
    render(<RaffleImageCarousel images={[mockImages[0]]} />)
    
    expect(screen.queryByText('1/1')).not.toBeInTheDocument()
  })

  it('should show dots indicator when multiple images exist', () => {
    render(<RaffleImageCarousel images={mockImages} />)
    
    // Should have 3 dots
    const dots = screen.getAllByRole('generic').filter(el => 
      el.className.includes('w-2 h-2 rounded-full')
    )
    expect(dots).toHaveLength(3)
  })

  it('should update counter when navigating', () => {
    render(<RaffleImageCarousel images={mockImages} />)
    
    const carousel = screen.getByAltText('Imagem 1 da rifa').closest('div')
    
    // Initially should show 1/3
    expect(screen.getByText('1/3')).toBeInTheDocument()
    
    // Hover and click next
    fireEvent.mouseEnter(carousel!)
    fireEvent.click(screen.getByLabelText('Próxima imagem'))
    
    // Should now show 2/3
    expect(screen.getByText('2/3')).toBeInTheDocument()
  })

  it('should handle image load error gracefully', () => {
    // Mock console.error to avoid error logs in test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<RaffleImageCarousel images={['invalid-url']} />)
    
    const image = screen.getByAltText('Imagem 1 da rifa')
    
    // Simulate image load error
    fireEvent.error(image)
    
    // Image should still be in the document
    expect(image).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })
})
