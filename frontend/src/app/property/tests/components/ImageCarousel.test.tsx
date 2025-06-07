import { render, screen } from '@testing-library/react';
import ImageCarousel from '../../components/ImageCarousel';
import { describe, it, expect, vi } from 'vitest';

// Mock de react-slick para evitar errores de renderizado en el test
vi.mock('react-slick', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ImageCarousel', () => {
  it('renderiza todas las imágenes del carrusel', () => {
    render(<ImageCarousel />);

    // Verificamos que estén los slides por alt
    expect(screen.getByAltText('Slide 1')).toBeInTheDocument();
    expect(screen.getByAltText('Slide 2')).toBeInTheDocument();
    expect(screen.getByAltText('Slide 3')).toBeInTheDocument();
  });

  it('renderiza el logo superpuesto', () => {
    render(<ImageCarousel />);
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
  });
});
