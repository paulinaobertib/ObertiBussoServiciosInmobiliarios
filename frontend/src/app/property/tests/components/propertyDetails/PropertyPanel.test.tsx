/// <reference types="vitest" />
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { Property } from '../../../types/property';
import { PropertyPanel } from '../../../components/propertyDetails/PropertyPanel';

// Mock del PropertyCarousel para no renderizar el real
vi.mock('../../../components/propertyDetails/PropertyCarousel', () => ({
  PropertyCarousel: ({ mainImage, images, title }: any) => (
    <div data-testid="carousel">
      <div data-testid="main-image">{mainImage}</div>
      {images.map((img: any, i: number) => (
        <div key={i} data-testid="carousel-image">{img.url}</div>
      ))}
      <div>{title}</div>
    </div>
  ),
}));

describe('PropertyPanel', () => {
  const mockProperty: Property = {
    id: 1,
    title: 'Departamento Test',
    street: 'Calle Falsa 123',
    number: '123',
    description: 'Hermoso departamento',
    status: 'Disponible',
    operation: 'Venta',
    currency: 'USD',
    rooms: 3,
    bathrooms: 2,
    bedrooms: 2,
    area: 80,
    coveredArea: 70,
    price: 120000,
    expenses: 2000,
    showPrice: true,
    credit: false,
    financing: false,
    outstanding: false,
    owner: { id: 1, firstName: 'Juan', lastName: 'Perez', email: 'juan@example.com', phone: '123456789' },
    neighborhood: { id: 1, name: 'Palermo', city: 'Buenos Aires', type: '' as any },
    type: { id: 1, name: 'Departamento', hasBedrooms: true, hasBathrooms: true, hasRooms: true, hasCoveredArea: true },
    amenities: [{ id: 2, name: 'Gimnasio' }],
    mainImage: 'main.jpg' as any, // <- cast para tests
    images: ['img1.jpg', 'img2.jpg'] as any[], // <- cast para tests
    date: new Date().toISOString(),
  };

  const MockInfo = ({ property }: { property: Property; hideDescription?: boolean }) => (
    <div data-testid="info">{property.title}</div>
  );

  it('renderiza carrusel y componente de info', () => {
    render(<PropertyPanel property={mockProperty} InfoComponent={MockInfo} />);
    
    // Verifica que el carrusel se renderizó con las imágenes
    expect(screen.getByTestId('carousel')).toBeInTheDocument();
    expect(screen.getByTestId('main-image')).toHaveTextContent('main.jpg');
    expect(screen.getAllByTestId('carousel-image').length).toBe(2);

    // Verifica que InfoComponent se renderizó
    expect(screen.getByTestId('info')).toHaveTextContent('Departamento Test');
  });

  it('respeta la prop vertical', () => {
    const { container } = render(<PropertyPanel property={mockProperty} InfoComponent={MockInfo} vertical />);
    
    // Verifica que el Box principal tenga flexDirection column (vertical)
    const mainBox = container.firstChild as HTMLElement;
    expect(mainBox).toHaveStyle('flex-direction: column');
  });

  it('muestra la descripción debajo cuando showDescriptionBelow es true', () => {
    render(<PropertyPanel property={mockProperty} InfoComponent={MockInfo} showDescriptionBelow />);

    expect(screen.getByText('Descripción')).toBeInTheDocument();
    expect(screen.getByText(mockProperty.description)).toBeInTheDocument();
  });
});
