import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PropertyDetailsCompare from '../../../components/propertyDetails/PropertyDetailsCompare';
import { Property } from '../../../types/property';
import axios from 'axios';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { NeighborhoodType } from '../../../types/neighborhood';

// Mocks
vi.mock('axios');
vi.mock('../../../components/propertyDetails/PropertyCarousel', () => ({
  default: ({ title }: { title: string }) => <div data-testid="carousel">{title}</div>,
}));
vi.mock('../../../components/propertyDetails/PropertyInfoCompare', () => ({
  default: ({ property }: { property: Property }) => (
    <div data-testid="info">{property.title}</div>
  ),
}));
vi.mock('react-leaflet', async () => {
  const actual = await vi.importActual<typeof import('react-leaflet')>('react-leaflet');
  return {
    ...actual,
    MapContainer: ({ children }: any) => <div data-testid="map">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: () => <div data-testid="marker" />,
    Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
    Circle: () => <div data-testid="circle" />,
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

const mockProperty = (id: number, title: string): Property => ({
  id,
  title,
  street: 'Calle Falsa',
  number: '123',
  description: 'Descripción',
  status: 'available',
  operation: 'sale',
  currency: 'USD',
  rooms: 3,
  bathrooms: 1,
  bedrooms: 2,
  area: 100,
  coveredArea: 90,
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
  mainImage: 'https://example.com/main.jpg',
  images: [new File([], 'mock.jpg')],
});

const theme = createTheme();

describe('PropertyDetailsCompare', () => {
  it('renderiza mensaje si hay menos de 2 propiedades', () => {
    render(
      <ThemeProvider theme={theme}>
        <PropertyDetailsCompare comparisonItems={[mockProperty(1, 'Propiedad A')]} />
      </ThemeProvider>
    );

    expect(screen.getByText(/Selecciona 2 o 3 propiedades para comparar/i)).toBeInTheDocument();
  });

  it('renderiza las propiedades con mapas si las coordenadas se obtienen correctamente', async () => {
    (axios.get as any).mockResolvedValue({
      data: [{ lat: '-34.6037', lon: '-58.3816' }],
    });

    render(
      <ThemeProvider theme={theme}>
        <PropertyDetailsCompare
          comparisonItems={[mockProperty(1, 'Prop A'), mockProperty(2, 'Prop B')]}
        />
      </ThemeProvider>
    );

    // Carousel e info deberían aparecer dos veces
    expect(await screen.findAllByTestId('carousel')).toHaveLength(2);
    expect(await screen.findAllByTestId('info')).toHaveLength(2);

    await waitFor(() => {
      expect(screen.getAllByTestId('map')).toHaveLength(2);
    });
  });

  it('muestra "Ubicación no encontrada" si la API no devuelve resultados', async () => {
    (axios.get as any).mockResolvedValue({ data: [] });

    render(
      <ThemeProvider theme={theme}>
        <PropertyDetailsCompare
          comparisonItems={[mockProperty(1, 'Prop A'), mockProperty(2, 'Prop B')]}
        />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Ubicación no encontrada/i)).toHaveLength(2);
    });
  });

  it('muestra "Ubicación no encontrada" si axios falla', async () => {
    (axios.get as any).mockRejectedValue(new Error('Network Error'));

    render(
      <ThemeProvider theme={theme}>
        <PropertyDetailsCompare
          comparisonItems={[mockProperty(1, 'Prop A'), mockProperty(2, 'Prop B')]}
        />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Ubicación no encontrada/i)).toHaveLength(2);
    });
  });
});
