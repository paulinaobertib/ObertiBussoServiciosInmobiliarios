import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import PropertyInfo from '../../../components/propertyDetails/PropertyInfoCompare';
import { Property } from '../../../types/property';
import { NeighborhoodType } from '../../../types/neighborhood';

// Mocks
vi.mock('../../../context/PropertiesContext', () => ({
  usePropertyCrud: vi.fn(),
}));

import { usePropertyCrud } from '../../../context/PropertiesContext';

const theme = createTheme();

const mockProperty: Property = {
  id: 1,
  title: 'Propiedad Demo',
  street: 'Av. Siempre Viva',
  number: '742',
  description: 'Una propiedad muy bonita',
  status: 'available',
  operation: 'sale',
  currency: 'USD',
  rooms: 3,
  bathrooms: 2,
  bedrooms: 2,
  area: 120,
  coveredArea: 100,
  price: 250000,
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
    name: 'Palermo',
    city: 'Buenos Aires',
    type: NeighborhoodType.ABIERTO,
  },
  type: {
    id: 1,
    name: 'Casa',
    hasBedrooms: true,
    hasBathrooms: true,
    hasRooms: true,
    hasCoveredArea: true,
  },
  amenities: [],
  mainImage: '',
  images: [],
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('PropertyInfoCompare', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra título, dirección, precio, chips y descripción', () => {
    (usePropertyCrud as any).mockReturnValue({ comparisonItems: [] });

    renderWithTheme(<PropertyInfo property={mockProperty} />);

    expect(screen.getByRole('heading', { name: /propiedad demo/i })).toBeInTheDocument();
    expect(screen.getByText(/Av\. Siempre Viva, Palermo, Buenos Aires/i)).toBeInTheDocument();
    expect(screen.getByText(/\$250,000/)).toBeInTheDocument();
    expect(screen.getByText(/sale/i)).toBeInTheDocument();
    expect(screen.getByText(/available/i)).toBeInTheDocument();
    expect(screen.getByText(/2 dormitorios/)).toBeInTheDocument();
    expect(screen.getByText(/2 baños/)).toBeInTheDocument();
    expect(screen.getByText(/3 ambientes/)).toBeInTheDocument();
    expect(screen.getByText(/120 m²/)).toBeInTheDocument();
    expect(screen.getByText(/100 m² cubiertos/)).toBeInTheDocument();
    expect(screen.getByText(/una propiedad muy bonita/i)).toBeInTheDocument();
  });

  it('muestra "Ubicación desconocida" si no hay datos de calle o barrio', () => {
    (usePropertyCrud as any).mockReturnValue({ comparisonItems: [] });

    const prop = { ...mockProperty, street: '', neighborhood: null as any };
    renderWithTheme(<PropertyInfo property={prop} />);

    expect(screen.getByText(/ubicación desconocida/i)).toBeInTheDocument();
  });

  it('muestra "Consultar precio" si no se debe mostrar el precio', () => {
    (usePropertyCrud as any).mockReturnValue({ comparisonItems: [] });

    const prop = { ...mockProperty, showPrice: false };
    renderWithTheme(<PropertyInfo property={prop} />);

    expect(screen.getByText(/consultar precio/i)).toBeInTheDocument();
  });

    it('oculta características no relevantes si hay múltiples propiedades', () => {
    const noRoomsProperty = { ...mockProperty, rooms: 0, area: 0, coveredArea: 0 };
    const otherProperty = { ...mockProperty, id: 2 };

    (usePropertyCrud as any).mockReturnValue({
        comparisonItems: [noRoomsProperty, otherProperty],
    });

    renderWithTheme(<PropertyInfo property={noRoomsProperty} />);

    // No deberían mostrarse estas características irrelevantes
    expect(screen.queryByText(/0 ambientes/)).not.toBeInTheDocument();
    expect(screen.queryByText(/0 m²/)).not.toBeInTheDocument();
    expect(screen.queryByText(/0 m² cubiertos/)).not.toBeInTheDocument();

    // Estas sí deberían mostrarse
    expect(screen.getByText(/2 dormitorios/)).toBeInTheDocument();
    });

});
