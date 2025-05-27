import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropertyInfo, { formatFeatureLabel } from '../../../components/propertyDetails/PropertyInfo';
import { emptyProperty, Property } from '../../../types/property';
import { Neighborhood } from '../../../types/neighborhood';
import { PropertyCrudProvider } from '../../../context/PropertiesContext';
import { AlertProvider } from '../../../context/AlertContext';

// Mock del ModalItem para simplificar el test
vi.mock('../ModalItem', () => ({
  default: ({ info, close }: any) => (
    <div data-testid="modal">
      <button onClick={close}>Cerrar</button>
      <span>{info?.action}</span>
    </div>
  ),
}));

// Mock de formatPrice para que devuelva siempre lo mismo y sea predecible en el test
vi.mock('../../../utils/formatPrice', () => ({
  formatPrice: () => '$5,000,000',
}));

const mockProperty: Property = {
  ...emptyProperty,
  id: 1,
  title: 'Casa en venta',
  street: 'Calle Falsa 123',
  number: '123',
  neighborhood: { id: 1, name: 'Centro', city: 'Ciudad', type: '' } as Neighborhood,
  status: 'Disponible',
  operation: 'Venta',
  currency: 'ARS',
  rooms: 2,
  bathrooms: 1,
  bedrooms: 3,
  area: 100,
  coveredArea: 80,
  price: 5000000,
  showPrice: true,
  description: 'Hermosa casa céntrica',
  owner: emptyProperty.owner,
  type: emptyProperty.type,
  amenities: [],
  mainImage: '',
  images: [],
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <AlertProvider>
    <PropertyCrudProvider>
      {children}
    </PropertyCrudProvider>
  </AlertProvider>
);

describe('PropertyInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza título, ubicación, precio y chips', () => {
    render(<PropertyInfo property={mockProperty} />, { wrapper: Wrapper });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Casa en venta');
    expect(screen.getByText(/Calle Falsa 123, Centro, Ciudad/)).toBeInTheDocument();
    expect(screen.getByText('$5,000,000')).toBeInTheDocument();
    expect(screen.getByText('Venta')).toBeInTheDocument();
    expect(screen.getByText('Disponible')).toBeInTheDocument();
  });

  it('muestra características filtrando las inválidas', () => {
    const property = { ...mockProperty, bedrooms: 0, bathrooms: 0, area: 0 };
    render(<PropertyInfo property={property} />, { wrapper: Wrapper });

    expect(screen.queryByText('0 dormitorios')).not.toBeInTheDocument();
    expect(screen.queryByText('0 baños')).not.toBeInTheDocument();
    expect(screen.queryByText('0 m²')).not.toBeInTheDocument();
    expect(screen.getByText('2 ambientes')).toBeInTheDocument();
    expect(screen.getByText('80 m² cubiertos')).toBeInTheDocument();
  });

  it('muestra "Consultar precio" cuando showPrice es false', () => {
    const property = { ...mockProperty, showPrice: false };
    render(<PropertyInfo property={property} />, { wrapper: Wrapper });

    expect(screen.getByText('Consultar precio')).toBeInTheDocument();
    expect(screen.queryByText('$5,000,000')).not.toBeInTheDocument();
  });

  it('muestra "Consultar precio" cuando price es 0', () => {
    const property = { ...mockProperty, price: 0 };
    render(<PropertyInfo property={property} />, { wrapper: Wrapper });

    expect(screen.getByText('Consultar precio')).toBeInTheDocument();
    expect(screen.queryByText('$5,000,000')).not.toBeInTheDocument();
  });

  it('muestra "Ubicación desconocida" cuando faltan datos de ubicación', () => {
    const property: Property = {
      ...mockProperty,
      street: '',
      neighborhood: { id: 0, name: '', city: '', type: '' } as Neighborhood,
    };
    render(<PropertyInfo property={property} />, { wrapper: Wrapper });

    expect(screen.getByText('Ubicación desconocida')).toBeInTheDocument();
    expect(screen.queryByText(/Calle Falsa 123/)).not.toBeInTheDocument();
  });

  it('no renderiza la sección de descripción si no hay descripción', () => {
    const property = { ...mockProperty, description: '' };
    render(<PropertyInfo property={property} />, { wrapper: Wrapper });

    expect(screen.queryByText('Descripción')).not.toBeInTheDocument();
    expect(screen.queryByText('Hermosa casa céntrica')).not.toBeInTheDocument();
  });

it('abre el modal al hacer clic en el botón de edición', async () => {
  render(<PropertyInfo property={mockProperty} />, { wrapper: Wrapper });

  const editButton = screen.getByRole('button', { name: /editar estado/i });
  fireEvent.click(editButton);

  const modal = await screen.findByTestId('modal');
  expect(modal).toBeInTheDocument();
});

it('cierra el modal al hacer clic en el botón de cerrar', async () => {
  render(<PropertyInfo property={mockProperty} />, { wrapper: Wrapper });

  const editButton = screen.getByRole('button', { name: /edit/i });
  fireEvent.click(editButton);

  const closeButton = await screen.findByRole('button', { name: /cerrar modal/i });
  fireEvent.click(closeButton);

  await waitFor(() => {
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });
});

  it('renderiza el botón "Contactar al vendedor"', () => {
    render(<PropertyInfo property={mockProperty} />, { wrapper: Wrapper });

    expect(screen.getByRole('button', { name: 'Contactar al vendedor' })).toBeInTheDocument();
  });

  describe('formatFeatureLabel', () => {
    it('devuelve "-" para valor undefined', () => {
      expect(formatFeatureLabel(undefined, 'dormitorio', 'dormitorios')).toBe('-');
    });

    it('devuelve "-" para valor null', () => {
      expect(formatFeatureLabel(null, 'dormitorio', 'dormitorios')).toBe('-');
    });

    it('devuelve "-" para valor 0', () => {
      expect(formatFeatureLabel(0, 'dormitorio', 'dormitorios')).toBe('-');
    });

    it('devuelve singular para valor 1', () => {
      expect(formatFeatureLabel(1, 'dormitorio', 'dormitorios')).toBe('1 dormitorio');
    });

    it('devuelve plural para valor mayor a 1', () => {
      expect(formatFeatureLabel(2, 'dormitorio', 'dormitorios')).toBe('2 dormitorios');
    });
  });

  it('no muestra ninguna característica si todas son inválidas', () => {
  const property = {
    ...mockProperty,
    bedrooms: 0,
    bathrooms: 0,
    rooms: 0,
    area: 0,
    coveredArea: 0,
  };
  render(<PropertyInfo property={property} />, { wrapper: Wrapper });

  expect(screen.queryByText(/dormitorio|baño|ambiente|m²/)).not.toBeInTheDocument();
});

it('no renderiza características si no hay ninguna válida', () => {
  const property = {
    ...mockProperty,
    bedrooms: 0,
    bathrooms: 0,
    rooms: 0,
    area: 0,
    coveredArea: 0,
  };
  render(<PropertyInfo property={property} />, { wrapper: Wrapper });

  // Verifica que ninguna de las características esté presente
  expect(screen.queryByText(/dormitorio/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/baño/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/ambiente/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/m² cubiertos/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/m²/i)).not.toBeInTheDocument();
});

});