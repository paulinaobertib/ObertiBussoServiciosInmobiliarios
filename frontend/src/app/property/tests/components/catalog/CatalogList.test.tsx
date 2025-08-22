import { render, screen, fireEvent } from '@testing-library/react';
import { CatalogList } from '../../../components/catalog/CatalogList';
import { useAuthContext } from '../../../../user/context/AuthContext';
import type { Property } from '../../../types/property';
import { vi } from 'vitest';

vi.mock('../../../../user/context/AuthContext');
vi.mock('../../../components/catalog/PropertyCard', () => ({
  PropertyCard: vi.fn(({ property, onClick }: any) => (
    <div data-testid={`card-${property.id}`} onClick={onClick}>
      {property.title}
    </div>
  )),
}));

describe('CatalogList', () => {
  const mockOnCardClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const makeProperty = (overrides: Partial<Property> = {}): Property => ({
    id: 1,
    title: 'P1',
    status: 'disponible',
    outstanding: false,
    date: '2025-01-01',
    owner: {} as any,
    neighborhood: {} as any,
    type: {} as any,
    amenities: [],
    street: '',
    number: '',
    description: '',
    currency: 'ARS',
    rooms: 1,
    bathrooms: 1,
    bedrooms: 1,
    area: 50,
    coveredArea: 40,
    price: 100,
    operation: 'Venta',
    expenses: null,
    showPrice: true,
    credit: false,
    financing: false,
    mainImage: '',
    images: [],
    ...overrides,
  });

  it('muestra mensaje cuando no hay propiedades y es admin', () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    render(<CatalogList properties={[]} />);
    expect(screen.getByText(/No hay propiedades cargadas/i)).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay propiedades y no es admin', () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: false });
    render(<CatalogList properties={[]} />);
    expect(screen.getByText(/No hay propiedades disponibles/i)).toBeInTheDocument();
  });

  it('filtra propiedades según status si no es admin', () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: false });
    const props: Property[] = [
      makeProperty({ id: 1, title: 'P1', status: 'disponible' }),
      makeProperty({ id: 2, title: 'P2', status: 'vendido' }),
    ];
    render(<CatalogList properties={props} />);
    expect(screen.queryByText('P1')).toBeInTheDocument();
    expect(screen.queryByText('P2')).not.toBeInTheDocument();
  });

  it('renderiza todas las propiedades si es admin', () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    const props: Property[] = [
      makeProperty({ id: 1, title: 'P1', status: 'disponible' }),
      makeProperty({ id: 2, title: 'P2', status: 'vendido' }),
    ];
    render(<CatalogList properties={props} />);
    expect(screen.getByText('P1')).toBeInTheDocument();
    expect(screen.getByText('P2')).toBeInTheDocument();
  });

  it('llama onCardClick al hacer click en PropertyCard', () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    const props: Property[] = [makeProperty({ id: 1, title: 'P1' })];
    render(<CatalogList properties={props} onCardClick={mockOnCardClick} />);
    fireEvent.click(screen.getByTestId('card-1'));
    expect(mockOnCardClick).toHaveBeenCalledWith(props[0]);
  });
});
