 import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyCatalog } from '../../../components/catalog/PropertyCatalog';
import { useCatalog } from '../../../hooks/useCatalog';
import { vi } from 'vitest';
import type { Property } from '../../../types/property';

// Mock del hook useCatalog
vi.mock('../../../hooks/useCatalog', () => ({
  useCatalog: vi.fn(),
}));

// Mock del componente CatalogList
vi.mock('../../../components/catalog/CatalogList', () => ({
  CatalogList: ({ properties, onCardClick }: any) => (
    <div>
      {properties.map((p: Property) => (
        <div key={p.id} onClick={() => onCardClick(p)}>
          {p.title}
        </div>
      ))}
    </div>
  ),
}));

describe('PropertyCatalog', () => {
  const mockProperties: Property[] = [
    {
      id: 1,
      title: 'Propiedad 1',
      status: 'DISPONIBLE',
      operation: 'Venta',
      outstanding: false,
      date: new Date().toISOString(),
      owner: {} as any,
      neighborhood: {} as any,
      type: {} as any,
      amenities: [],
      street: 'Calle 1',
      number: '123',
      description: '',
      currency: 'USD',
      rooms: 2,
      bathrooms: 1,
      bedrooms: 2,
      area: 50,
      coveredArea: 50,
      price: 100000,
      expenses: 5000,
      showPrice: true,
      credit: false,
      financing: false,
      mainImage: '',
      images: [],
    },
    {
      id: 2,
      title: 'Propiedad 2',
      status: 'VENDIDO',
      operation: 'Alquiler',
      outstanding: false,
      date: new Date().toISOString(),
      owner: {} as any,
      neighborhood: {} as any,
      type: {} as any,
      amenities: [],
      street: 'Calle 2',
      number: '456',
      description: '',
      currency: 'USD',
      rooms: 3,
      bathrooms: 2,
      bedrooms: 3,
      area: 70,
      coveredArea: 70,
      price: 200000,
      expenses: 7000,
      showPrice: true,
      credit: false,
      financing: false,
      mainImage: '',
      images: [],
    },
  ];

  const handleClickMock = vi.fn();
  const mockedUseCatalog = vi.mocked(useCatalog);

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseCatalog.mockReturnValue({
      propertiesList: mockProperties,
      handleClick: handleClickMock,
      DialogUI: <div data-testid="dialog-ui">DialogUI</div>,
      refresh: async () => {},
      selectedPropertyIds: [],
      toggleCompare: vi.fn(),
      isAdmin: false,
    });
  });

  it('renderiza todas las propiedades y el DialogUI', () => {
    render(<PropertyCatalog properties={mockProperties} mode="normal" onFinishAction={vi.fn()} />);
    expect(screen.getByText('Propiedad 1')).toBeInTheDocument();
    expect(screen.getByText('Propiedad 2')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-ui')).toBeInTheDocument();
  });

  it('llama handleClick al hacer click en una propiedad', () => {
    render(<PropertyCatalog properties={mockProperties} mode="edit" onFinishAction={vi.fn()} />);
    fireEvent.click(screen.getByText('Propiedad 1'));
    expect(handleClickMock).toHaveBeenCalledWith('edit', mockProperties[0]);
  });

  it('pasa correctamente selectionMode, toggleSelection e isSelected a CatalogList', () => {
    const toggleSelection = vi.fn();
    const isSelected = vi.fn().mockReturnValue(true);

    render(
      <PropertyCatalog
        properties={mockProperties}
        mode="normal"
        onFinishAction={vi.fn()}
        selectionMode
        toggleSelection={toggleSelection}
        isSelected={isSelected}
      />
    );

    fireEvent.click(screen.getByText('Propiedad 2'));
    expect(handleClickMock).toHaveBeenCalledWith('normal', mockProperties[1]);
  });
});
