import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyCatalog } from '../../../components/catalog/PropertyCatalog';
import { useCatalog } from '../../../hooks/useCatalog';
import { vi } from 'vitest';
import type { Property } from '../../../types/property';

// Mock del hook useCatalog
vi.mock('../../../hooks/useCatalog', () => ({
  useCatalog: vi.fn(),
}));

// Mock del componente CatalogList (sencillo, renderiza títulos clickeables)
vi.mock('../../../components/catalog/CatalogList', () => ({
  CatalogList: ({ properties, onCardClick }: any) => (
    <div data-testid="catalog-list">
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

  // ─────────── TESTS NUEVOS ───────────

  it('llama useCatalog con los parámetros correctos (onFinish y externalProperties)', () => {
    const onFinishAction = vi.fn();
    render(<PropertyCatalog properties={mockProperties} mode="normal" onFinishAction={onFinishAction} />);

    expect(mockedUseCatalog).toHaveBeenCalledTimes(1);
    const args = mockedUseCatalog.mock.calls[0][0];
    expect(args).toEqual(
      expect.objectContaining({
        onFinish: onFinishAction,
        externalProperties: mockProperties,
      })
    );
  });

it('si propertiesList es undefined, pasa [] a CatalogList y sigue renderizando DialogUI', () => {
  mockedUseCatalog.mockReturnValueOnce({
    // 👇 forzamos el tipo del objeto completo
    propertiesList: undefined as unknown as Property[],
    handleClick: handleClickMock,
    DialogUI: <div data-testid="dialog-ui">DialogUI</div>,
    refresh: async () => {},
    selectedPropertyIds: [],
    toggleCompare: vi.fn(),
    isAdmin: false,
  } as unknown as ReturnType<typeof useCatalog>);

  render(<PropertyCatalog properties={mockProperties} mode="normal" onFinishAction={vi.fn()} />);

  // No hay títulos porque propertiesList -> [] en CatalogList
  expect(screen.getByTestId('catalog-list').textContent).toBe('');
  // DialogUI igual aparece
  expect(screen.getByTestId('dialog-ui')).toBeInTheDocument();
});

  it('actualiza el callback cuando cambia "mode" entre renders', () => {
    const { rerender } = render(
      <PropertyCatalog properties={mockProperties} mode="normal" onFinishAction={vi.fn()} />
    );

    // Click con mode="normal"
    fireEvent.click(screen.getByText('Propiedad 1'));
    expect(handleClickMock).toHaveBeenLastCalledWith('normal', mockProperties[0]);

    // Limpiamos para el segundo paso
    handleClickMock.mockClear();

    // Cambiamos a mode="delete" y clickeamos la otra card
    rerender(<PropertyCatalog properties={mockProperties} mode="delete" onFinishAction={vi.fn()} />);
    fireEvent.click(screen.getByText('Propiedad 2'));
    expect(handleClickMock).toHaveBeenCalledWith('delete', mockProperties[1]);
  });

  it('usa el nuevo handleClick si el hook lo cambia entre renders', () => {
    const handleClick1 = vi.fn();
    const handleClick2 = vi.fn();

    mockedUseCatalog
      .mockImplementationOnce(() => ({
        propertiesList: mockProperties,
        handleClick: handleClick1,
        DialogUI: <div data-testid="dialog-ui">DialogUI</div>,
        refresh: async () => {},
        selectedPropertyIds: [],
        toggleCompare: vi.fn(),
        isAdmin: false,
      }))
      .mockImplementationOnce(() => ({
        propertiesList: mockProperties,
        handleClick: handleClick2,
        DialogUI: <div data-testid="dialog-ui">DialogUI</div>,
        refresh: async () => {},
        selectedPropertyIds: [],
        toggleCompare: vi.fn(),
        isAdmin: false,
      }));

    const { rerender } = render(
      <PropertyCatalog properties={mockProperties} mode="edit" onFinishAction={vi.fn()} />
    );
    fireEvent.click(screen.getByText('Propiedad 1'));
    expect(handleClick1).toHaveBeenCalledWith('edit', mockProperties[0]);

    // Rerender fuerza nueva llamada al hook y nuevo handleClick
    rerender(<PropertyCatalog properties={mockProperties} mode="edit" onFinishAction={vi.fn()} />);
    fireEvent.click(screen.getByText('Propiedad 2'));
    expect(handleClick2).toHaveBeenCalledWith('edit', mockProperties[1]);
  });
});
