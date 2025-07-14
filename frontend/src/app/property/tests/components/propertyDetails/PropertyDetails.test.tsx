import { render, screen, waitFor } from '@testing-library/react';
import PropertyDetails from '../../../components/propertyDetails/PropertyDetailsTwo';
import { Property } from '../../../types/property';
import { afterEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { NeighborhoodType } from '../../../types/neighborhood';

// Mocks
vi.mock('axios');
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

const mockProperty: Property = {
  id: 1,
  title: 'Casa Moderna',
  street: 'Calle Falsa 123',
  number: '123',
  description: 'Una casa muy linda',
  status: 'available',
  operation: 'sale',
  currency: 'USD',
  rooms: 3,
  bathrooms: 2,
  bedrooms: 2,
  area: 120,
  coveredArea: 100,
  price: 200000,
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
  mainImage: 'https://example.com/image.jpg',
  images: [new File([], 'mock.jpg')],
};

const theme = createTheme();

describe('PropertyDetails', () => {
  it('renderiza correctamente los datos principales', async () => {
    (axios.get as any).mockResolvedValueOnce({
      data: [{ lat: '-34.6037', lon: '-58.3816' }],
    });

    render(
      <ThemeProvider theme={theme}>
        <PropertyDetails property={mockProperty} />
      </ThemeProvider>
    );

    expect(screen.getByText(/Casa Moderna/i)).toBeInTheDocument();
    expect(screen.getByText(/Una casa muy linda/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('map')).toBeInTheDocument();
    });
  });

  it('muestra mensaje de ubicación no encontrada si no hay resultados', async () => {
    (axios.get as any).mockResolvedValueOnce({ data: [] });

    render(
      <ThemeProvider theme={theme}>
        <PropertyDetails property={mockProperty} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ubicación no encontrada/i)).toBeInTheDocument();
    });
  });

  it('muestra fallback si ocurre un error en axios', async () => {
    (axios.get as any).mockRejectedValueOnce(new Error('Error'));

    render(
      <ThemeProvider theme={theme}>
        <PropertyDetails property={mockProperty} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ubicación no encontrada/i)).toBeInTheDocument();
    });
  });

  it('abre Google Maps al hacer clic en el mapa', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    (axios.get as any).mockResolvedValueOnce({
      data: [{ lat: '-34.6037', lon: '-58.3816' }],
    });

    render(
      <ThemeProvider theme={theme}>
        <PropertyDetails property={mockProperty} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('map')).toBeInTheDocument();
    });

    const mapContainer = screen.getByTestId('map').parentElement!;
    mapContainer.click();

    expect(openSpy).toHaveBeenCalled();

    openSpy.mockRestore();
  });

  it('renderiza correctamente imágenes cuando son objetos', async () => {
    const propertyWithObjectImages = {
      ...mockProperty,
      mainImage: { url: 'https://example.com/main-object.jpg' } as any,
      images: [
        { url: 'https://example.com/gallery1.jpg' },
        { url: 'https://example.com/gallery2.jpg' },
      ] as any,
    };

    (axios.get as any).mockResolvedValueOnce({
      data: [{ lat: '-34.6037', lon: '-58.3816' }],
    });

    render(
      <ThemeProvider theme={theme}>
        <PropertyDetails property={propertyWithObjectImages} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('map')).toBeInTheDocument();
    });

    const images = screen.getAllByAltText(/Casa Moderna/i);
    expect(images.length).toBeGreaterThan(0);

  });


});
