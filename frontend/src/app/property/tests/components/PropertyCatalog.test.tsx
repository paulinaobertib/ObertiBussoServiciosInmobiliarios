import { describe, it, vi, beforeEach, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropertyCatalog from '../../components/PropertyCatalog';
import { MemoryRouter } from 'react-router-dom';
import { useGlobalAlert } from '../../context/AlertContext';
import * as propertyService from '../../services/property.service';
import { Property } from '../../types/property';
import { NeighborhoodType } from '../../types/neighborhood';

// Mock global mockNavigate para useNavigate
const mockNavigate = vi.fn();

// Mock react-router-dom para que useNavigate retorne mockNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../context/AlertContext', () => ({
  useGlobalAlert: vi.fn(),
}));

const mockAsk = vi.fn((cb: () => void) => cb());

vi.mock('../../utils/ConfirmDialog', () => {
  return {
    useConfirmDialog: () => ({
      ask: mockAsk,
      DialogUI: <div data-testid="dialog-ui" />,
    }),
  };
});


vi.mock('../../services/property.service', () => {
  return {
    getAllProperties: vi.fn(),
    deleteProperty: vi.fn(),
  };
});

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
  owner: {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    mail: 'juan@example.com',
    phone: '123456789',
  },
  neighborhood: {
    id: 1,
    name: 'Centro',
    city: 'Ciudad',
    type: NeighborhoodType.ABIERTO,
  },
  type: {
    id: 1,
    name: 'Casa',
    hasRooms: true,
    hasBathrooms: true,
    hasBedrooms: true,
    hasCoveredArea: true,
  },
  amenities: [],
  mainImage: 'https://example.com/image.jpg',
  images: [],
};

describe('PropertyCatalog', () => {
  const showAlert = vi.fn();

  beforeEach(() => {
    (useGlobalAlert as any).mockReturnValue({ showAlert });
    vi.clearAllMocks();
  });

  it('muestra loader mientras carga', () => {
    (propertyService.getAllProperties as any).mockImplementation(() => new Promise(() => {}));
    render(
      <MemoryRouter>
        <PropertyCatalog mode="normal" onFinishAction={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renderiza propiedades pasadas como prop', () => {
    render(
      <MemoryRouter>
        <PropertyCatalog
          mode="normal"
          onFinishAction={() => {}}
          properties={[mockProperty]}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Casa en venta')).toBeInTheDocument();
    expect(screen.getByText(/\$150.000 USD/i)).toBeInTheDocument();
  });

  it('navega a detalles en modo normal', () => {
    render(
      <MemoryRouter>
        <PropertyCatalog
          mode="normal"
          onFinishAction={() => {}}
          properties={[mockProperty]}
        />
      </MemoryRouter>
    );

    const cardTitle = screen.getByText('Casa en venta');
    fireEvent.click(cardTitle);

    expect(mockNavigate).toHaveBeenCalledWith('/properties/1');
  });

  it('permite selección en modo selección', () => {
    const toggleSelection = vi.fn();
    const isSelected = vi.fn().mockReturnValue(true);

    render(
      <MemoryRouter>
        <PropertyCatalog
          mode="normal"
          onFinishAction={() => {}}
          properties={[mockProperty]}
          selectionMode
          toggleSelection={toggleSelection}
          isSelected={isSelected}
        />
      </MemoryRouter>
    );

    const selector = screen.getByTestId('CheckIcon').parentElement!;
    fireEvent.click(selector);
    expect(toggleSelection).toHaveBeenCalledWith(1);
  });

  it('llama a getAllProperties si no se pasan propiedades', async () => {
  const getAllPropertiesSpy = vi.spyOn(propertyService, 'getAllProperties').mockResolvedValue({ data: [mockProperty] });

  render(
    <MemoryRouter>
      <PropertyCatalog
        mode="normal"
        onFinishAction={() => {}}
      />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText('Casa en venta')).toBeInTheDocument();
    expect(getAllPropertiesSpy).toHaveBeenCalled();
  });
});

it('navega a editar en modo edit', () => {
  const onFinishAction = vi.fn();

  render(
    <MemoryRouter>
      <PropertyCatalog
        mode="edit"
        onFinishAction={onFinishAction}
        properties={[mockProperty]}
      />
    </MemoryRouter>
  );

  const cardTitle = screen.getByText('Casa en venta');
  fireEvent.click(cardTitle);

  expect(mockNavigate).toHaveBeenCalledWith('/properties/1/edit');
  expect(onFinishAction).toHaveBeenCalled();
});

it('no muestra ícono de selección si no está seleccionado', () => {
  const isSelected = vi.fn().mockReturnValue(false);

  render(
    <MemoryRouter>
      <PropertyCatalog
        mode="normal"
        onFinishAction={() => {}}
        properties={[mockProperty]}
        selectionMode
        isSelected={isSelected}
        toggleSelection={() => {}}
      />
    </MemoryRouter>
  );

  expect(screen.queryByTestId('CheckIcon')).not.toBeInTheDocument();
});

});
