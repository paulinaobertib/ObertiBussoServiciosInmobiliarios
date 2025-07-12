/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, beforeEach, expect } from 'vitest';


/** Estado único que expondrá el hook.  Lo mutaremos dentro de cada test. */
const stubGetAll = vi.fn();
const catalogState = {
  propertiesList: [],
  propertiesLoading: false,
  refreshAllCatalogs: vi.fn(),
  getAllProperties: stubGetAll,
};

vi.mock('../../context/PropertiesContext', () => ({
  PropertyCrudProvider: ({ children }: any) => children,
  usePropertiesContext: () => {
    // Simulamos la llamada al montar:
    stubGetAll();
    return catalogState;
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../context/AlertContext', () => ({ useGlobalAlert: () => ({ showAlert: vi.fn() }) }));

vi.mock('../../utils/ConfirmDialog', () => ({
  useConfirmDialog: () => ({ ask: (cb: () => void) => cb(), DialogUI: <></> }),
}));

// -------------------------------------------------------------------
// 2  Imports del código bajo prueba
// -------------------------------------------------------------------
import { render, screen, fireEvent } from '@testing-library/react';
import PropertyCatalog from '../../components/catalog/PropertyCatalog';
import { MemoryRouter } from 'react-router-dom';
import { Property } from '../../types/property';
import { NeighborhoodType } from '../../types/neighborhood';

// -------------------------------------------------------------------
// 3  Fixture
// -------------------------------------------------------------------
const mockProperty: Property = {
  id: 1,
  title: 'Casa en venta',
  street: 'Calle Falsa',
  number: '123',
  description: 'Hermosa casa familiar',
  status: 'Disponible',
  operation: 'Venta',
  currency: 'USD',
  rooms: 3,
  bathrooms: 2,
  bedrooms: 2,
  area: 120,
  coveredArea: 100,
  price: 150000,
  showPrice: true,
  credit: true,
  financing: false,
  owner: { id: 1, firstName: 'Juan', lastName: 'Pérez', mail: '', phone: '' },
  neighborhood: { id: 1, name: 'Centro', city: 'Ciudad', type: NeighborhoodType.ABIERTO },
  type: { id: 1, name: 'Casa', hasRooms: true, hasBathrooms: true, hasBedrooms: true, hasCoveredArea: true },
  amenities: [],
  mainImage: '',
  images: [],
};

// -------------------------------------------------------------------
// 4  Tests
// -------------------------------------------------------------------
describe('PropertyCatalog', () => {
  beforeEach(() => {
    // estado por defecto
    catalogState.propertiesList = [];
    catalogState.propertiesLoading = false;
    catalogState.getAllProperties.mockClear();
  });

  it('muestra loader mientras carga', () => {
    catalogState.propertiesLoading = true;

    render(
      <MemoryRouter>
        <PropertyCatalog mode="normal" onFinishAction={() => { }} />
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    catalogState.propertiesLoading = false; // reset
  });

  it('renderiza propiedades pasadas como prop', () => {
    render(
      <MemoryRouter>
        <PropertyCatalog mode="normal" onFinishAction={() => { }} properties={[mockProperty]} />
      </MemoryRouter>
    );

    expect(screen.getByText('Casa en venta')).toBeInTheDocument();
    expect(screen.getByText(/\$150.000 USD/i)).toBeInTheDocument();
  });

  it('navega a detalles en modo normal', () => {
    render(
      <MemoryRouter>
        <PropertyCatalog mode="normal" onFinishAction={() => { }} properties={[mockProperty]} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Casa en venta'));
    expect(mockNavigate).toHaveBeenCalledWith('/properties/1');
  });

  it('permite selección en modo selección', () => {
    const toggle = vi.fn();
    const isSel = vi.fn().mockReturnValue(true);

    render(
      <MemoryRouter>
        <PropertyCatalog
          mode="normal"
          onFinishAction={() => { }}
          properties={[mockProperty]}
          selectionMode
          toggleSelection={toggle}
          isSelected={isSel}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('CheckIcon').parentElement!);
    expect(toggle).toHaveBeenCalledWith(1);
  });

  it('llama a getAllProperties si no se pasan propiedades', () => {
    // ­­­— preparamos el estado para que el efecto se dispare —
    stubGetAll.mockClear();
    render(
      <MemoryRouter>
        <PropertyCatalog mode="normal" onFinishAction={() => { }} />
      </MemoryRouter>
    );

    expect(stubGetAll).toHaveBeenCalled();
  });

  it('navega a editar en modo edit', () => {
    const finish = vi.fn();

    render(
      <MemoryRouter>
        <PropertyCatalog mode="edit" onFinishAction={finish} properties={[mockProperty]} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Casa en venta'));
    expect(mockNavigate).toHaveBeenCalledWith('/properties/1/edit');
    expect(finish).toHaveBeenCalled();
  });

  it('no muestra ícono de selección si no está seleccionado', () => {
    const isSel = vi.fn().mockReturnValue(false);

    render(
      <MemoryRouter>
        <PropertyCatalog
          mode="normal"
          onFinishAction={() => { }}
          properties={[mockProperty]}
          selectionMode
          isSelected={isSel}
          toggleSelection={() => { }}
        />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('CheckIcon')).toBeNull();
  });

  it('muestra mensaje cuando no hay propiedades disponibles', () => {
    render(
      <MemoryRouter>
        <PropertyCatalog mode="normal" onFinishAction={() => { }} properties={[]} />
      </MemoryRouter>
    );
    expect(
      screen.getByText('No hay propiedades disponibles.')
    ).toBeInTheDocument();
  });
});
