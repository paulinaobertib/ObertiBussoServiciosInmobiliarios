import { render, screen, fireEvent } from '@testing-library/react';
import { CatalogList } from '../../../components/catalog/CatalogList';
import { useAuthContext } from '../../../../user/context/AuthContext';
import type { Property } from '../../../types/property';
import { vi } from 'vitest';

// Mockeamos AuthContext e interceptamos PropertyCard
vi.mock('../../../../user/context/AuthContext');
vi.mock('../../../components/catalog/PropertyCard', () => ({
  PropertyCard: vi.fn(({ property, onClick, selectionMode, isSelected }: any) => (
    <div
      data-testid={`card-${property.id}`}
      data-selection={String(selectionMode)}
      data-selected={String(isSelected?.(property.id))}
      onClick={onClick}
    >
      {property.title}
    </div>
  )),
}));

// Traemos el mock para inspeccionar props y llamadas
import { PropertyCard } from '../../../components/catalog/PropertyCard';

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

  it('ordena: destacadas primero por fecha desc, luego normales por fecha desc (no admin)', () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: false });
    const props: Property[] = [
      // outstanding
      makeProperty({ id: 11, title: 'O2', outstanding: true, date: '2025-06-01', status: 'disponible' }),
      makeProperty({ id: 10, title: 'O1', outstanding: true, date: '2025-05-01', status: 'disponible' }),
      // normales
      makeProperty({ id: 21, title: 'N2', outstanding: false, date: '2025-07-01', status: 'disponible' }),
      makeProperty({ id: 20, title: 'N1', outstanding: false, date: '2025-03-01', status: 'disponible' }),
    ];
    const { container } = render(<CatalogList properties={props} />);

    // Leemos el orden en el DOM
    const cards = Array.from(container.querySelectorAll('[data-testid^="card-"]')) as HTMLElement[];
    const titles = cards.map((c) => c.textContent);
    expect(titles).toEqual(['O2', 'O1', 'N2', 'N1']);
  });

  it('incluye propiedades sin status o con "DISPONIBLE" (case-insensitive) cuando no es admin', () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: false });
    const props: Property[] = [
      makeProperty({ id: 1, title: 'OK1', status: 'DISPONIBLE' as any }), // mayúsculas
      makeProperty({ id: 2, title: 'OK2', status: '' as any }),            // falsy
      makeProperty({ id: 3, title: 'NO', status: 'vendido' }),
    ];
    render(<CatalogList properties={props} />);
    expect(screen.queryByText('OK1')).toBeInTheDocument();
    expect(screen.queryByText('OK2')).toBeInTheDocument();
    expect(screen.queryByText('NO')).not.toBeInTheDocument();
  });

  it('si properties no es array (null), muestra mensaje vacío correspondiente', () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: false });
    // @ts-expect-error: forzamos un valor no array para cubrir safeProperties
    render(<CatalogList properties={null} />);
    expect(screen.getByText(/No hay propiedades disponibles/i)).toBeInTheDocument();
  });

  it('pasa selectionMode, toggleSelection e isSelected hacia PropertyCard y conserva onClick', () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });

    const toggleSelection = vi.fn();
    const isSelected = vi.fn((id: number) => id === 2);
    const props: Property[] = [
      makeProperty({ id: 1, title: 'A' }),
      makeProperty({ id: 2, title: 'B' }),
    ];

    render(
      <CatalogList
        properties={props}
        selectionMode
        toggleSelection={toggleSelection}
        isSelected={isSelected}
        onCardClick={mockOnCardClick}
      />
    );

    // Se llamó PropertyCard por cada propiedad, con las props que esperamos
    expect((PropertyCard as any).mock.calls.length).toBe(2);
    const firstCallProps = (PropertyCard as any).mock.calls[0][0];
    const secondCallProps = (PropertyCard as any).mock.calls[1][0];

    expect(firstCallProps.selectionMode).toBe(true);
    expect(typeof firstCallProps.toggleSelection).toBe('function');
    expect(typeof firstCallProps.isSelected).toBe('function');

    // isSelected se evalúa correctamente (true solo para id=2)
    expect(firstCallProps.isSelected(1)).toBe(false);
    expect(secondCallProps.isSelected(2)).toBe(true);

    // onClick sigue funcionando
    fireEvent.click(screen.getByTestId('card-1'));
    expect(mockOnCardClick).toHaveBeenCalledWith(props[0]);
  });

  it('cuando es admin y hay destacadas + normales, también respeta el orden (mismo criterio)', () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    const props: Property[] = [
      makeProperty({ id: 1, title: 'N1', outstanding: false, date: '2025-01-01', status: 'vendido' }),
      makeProperty({ id: 2, title: 'O1', outstanding: true, date: '2025-02-01', status: 'vendido' }),
      makeProperty({ id: 3, title: 'N2', outstanding: false, date: '2025-03-01', status: 'vendido' }),
      makeProperty({ id: 4, title: 'O2', outstanding: true, date: '2025-04-01', status: 'vendido' }),
    ];
    const { container } = render(<CatalogList properties={props} />);

    const cards = Array.from(container.querySelectorAll('[data-testid^="card-"]')) as HTMLElement[];
    const titles = cards.map((c) => c.textContent);
    expect(titles).toEqual(['O2', 'O1', 'N2', 'N1']);
  });
});
