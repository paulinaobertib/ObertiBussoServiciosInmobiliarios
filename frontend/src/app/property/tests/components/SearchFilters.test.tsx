import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchFilters from '../../components/catalog/SearchFilters';
import { PropertyCrudProvider } from '../../context/PropertiesContext';
import { AlertProvider } from '../../../shared/context/AlertContext';
import { ReactElement } from 'react';

// Mock de los servicios
const mockGetPropertiesByFilters = vi.fn();
const mockGetAllProperties = vi.fn();
const mockGetAllTypes = vi.fn();
const mockGetAllNeighborhoods = vi.fn();

vi.mock('../../services/property.service', () => ({
  getPropertiesByFilters: (filters: any) => mockGetPropertiesByFilters(filters),
  getAllProperties: () => mockGetAllProperties(),
  getAllTypes: () => mockGetAllTypes(),
  getAllNeighborhoods: () => mockGetAllNeighborhoods(),
}));

// Mock del contexto PropertyCrudProvider
vi.mock('../../context/PropertiesContext', () => ({
  usePropertyCrud: () => ({
    typesList: [{ id: 1, name: 'Casa' }, { id: 2, name: 'Departamento' }],
    neighborhoodsList: [{ id: 1, name: 'Centro', city: 'Ciudad' }],
    amenitiesList: [{ id: 1, name: 'Piscina' }],
    operationsList: ['VENTA', 'ALQUILER'], // Aseguramos que VENTA esté incluido
    selected: { owner: null, neighborhood: null, type: null, amenities: [] },
    setSelected: vi.fn(),
    buildSearchParams: vi.fn((filters) => filters),
  }),
  PropertyCrudProvider: ({ children }: { children: ReactElement }) => <>{children}</>,
}));

const renderWithProviders = (ui: ReactElement) => {
  return render(
    <AlertProvider>
      <PropertyCrudProvider>
        {ui}
      </PropertyCrudProvider>
    </AlertProvider>
  );
};

describe('SearchFilters component', () => {
  const onSearchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ejecuta búsqueda y llama onSearch con resultados', async () => {
    mockGetPropertiesByFilters.mockResolvedValue([{ id: 1, title: 'Propiedad 1' }]);
    renderWithProviders(<SearchFilters onSearch={onSearchMock} />);

    const btnBuscar = screen.getByRole('button', { name: 'Buscar' });
    fireEvent.click(btnBuscar);

    await waitFor(() => {
      expect(mockGetPropertiesByFilters).toHaveBeenCalled();
      expect(onSearchMock).toHaveBeenCalledWith([{ id: 1, title: 'Propiedad 1' }]);
    });
  });

  it('resetea filtros y realiza búsqueda con valores iniciales al cancelar', async () => {
    mockGetPropertiesByFilters.mockResolvedValue([{ id: 2, title: 'Propiedad 2' }]);
    renderWithProviders(<SearchFilters onSearch={onSearchMock} />);

    const btnCancelar = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(btnCancelar);

    await waitFor(() => {
      expect(mockGetPropertiesByFilters).toHaveBeenCalled();
      expect(onSearchMock).toHaveBeenCalledWith([{ id: 2, title: 'Propiedad 2' }]);
    });
  });

  it('renderiza correctamente con filtros iniciales', () => {
    renderWithProviders(<SearchFilters onSearch={onSearchMock} />);

    expect(screen.getByText('Filtros de Búsqueda')).toBeInTheDocument();
    expect(screen.getByTestId('operation-select')).toBeInTheDocument();
  });

  it('muestra alerta si se pone un valor negativo', () => {
    renderWithProviders(<SearchFilters onSearch={onSearchMock} />);
    const [inputPriceFrom] = screen.getAllByPlaceholderText('Desde');

    fireEvent.change(inputPriceFrom, { target: { name: 'priceFrom', value: '-10' } });

    expect(screen.getByText('El valor no puede ser negativo')).toBeInTheDocument();
  });

  it('muestra alerta si priceFrom es mayor a priceTo', async () => {
    renderWithProviders(<SearchFilters onSearch={onSearchMock} />);
    const [inputDesde] = screen.getAllByPlaceholderText('Desde');
    const [inputHasta] = screen.getAllByPlaceholderText('Hasta');

    fireEvent.change(inputDesde, { target: { name: 'priceFrom', value: '1000' } });
    fireEvent.change(inputHasta, { target: { name: 'priceTo', value: '500' } });

    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => {
      expect(screen.getByText('El precio DESDE no puede ser mayor al precio HASTA')).toBeInTheDocument();
      expect(mockGetPropertiesByFilters).not.toHaveBeenCalled();
      expect(onSearchMock).not.toHaveBeenCalled();
    });
  });

  it('cambia el select Operación y actualiza params', async () => {
    renderWithProviders(<SearchFilters onSearch={onSearchMock} />);
    const user = userEvent.setup();

    // 1. Buscar el botón que abre el Select (Material UI usa un button con label)
    const selectOperacion = screen.getByLabelText(/operación/i)

    // 2. Abrir el menú
    await user.click(selectOperacion);

    // 3. Buscar la opción 'Venta' dentro del menú que aparece (puede tardar en renderizar)
    const optionVenta = await screen.findByText(/^Venta$/i);

    // 4. Seleccionar la opción
    await user.click(optionVenta);

    // 5. Verificar que el botón ahora muestre 'Venta' (case insensitive)
    await waitFor(() => {
      expect(selectOperacion).toHaveTextContent(/venta/i);
    });
  });

  it('muestra y permite seleccionar los checkboxes "Apto Crédito" y "Apto Financiamiento" cuando operación es VENTA', async () => {
    renderWithProviders(<SearchFilters onSearch={onSearchMock} />);
    const user = userEvent.setup();

    // Seleccionar operación "VENTA"
    const selectOperacion = screen.getByLabelText(/operación/i);
    await user.click(selectOperacion);
    const optionVenta = await screen.findByText(/^Venta$/i);
    await user.click(optionVenta);

    // Los checkboxes deberían estar visibles
    expect(screen.getByLabelText(/Apto Crédito/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Apto Financiamiento/i)).toBeInTheDocument();

    // Interactuar con los checkboxes
    await user.click(screen.getByLabelText(/Apto Crédito/i));
    await user.click(screen.getByLabelText(/Apto Financiamiento/i));
  });

  it('muestra alerta si areaFrom es mayor a areaTo', async () => {
    renderWithProviders(<SearchFilters onSearch={onSearchMock} />);
    const [inputAreaFrom] = screen.getAllByPlaceholderText('Desde');
    const [inputAreaTo] = screen.getAllByPlaceholderText('Hasta');

    fireEvent.change(inputAreaFrom, { target: { name: 'areaFrom', value: '100' } });
    fireEvent.change(inputAreaTo, { target: { name: 'areaTo', value: '50' } });

    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => {
      expect(screen.getByText('La superficie DESDE no puede ser mayor a la superficie HASTA')).toBeInTheDocument();
      expect(mockGetPropertiesByFilters).not.toHaveBeenCalled();
    });
  });

  it('muestra alerta si coveredAreaFrom es mayor a coveredAreaTo', async () => {
    renderWithProviders(<SearchFilters onSearch={onSearchMock} />);
    const [inputCoveredAreaFrom] = screen.getAllByPlaceholderText('Desde');
    const [inputCoveredAreaTo] = screen.getAllByPlaceholderText('Hasta');

    fireEvent.change(inputCoveredAreaFrom, { target: { name: 'coveredAreaFrom', value: '100' } });
    fireEvent.change(inputCoveredAreaTo, { target: { name: 'coveredAreaTo', value: '50' } });

    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => {
      expect(screen.getByText('La superficie DESDE no puede ser mayor a la superficie HASTA')).toBeInTheDocument();
      expect(mockGetPropertiesByFilters).not.toHaveBeenCalled();
      expect(onSearchMock).not.toHaveBeenCalled();
    });
  });

  it('maneja input vacío en campos numéricos', async () => {
    renderWithProviders(<SearchFilters onSearch={onSearchMock} />);
    const [inputPriceFrom] = screen.getAllByPlaceholderText('Desde');

    fireEvent.change(inputPriceFrom, { target: { name: 'priceFrom', value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => {
      expect(mockGetPropertiesByFilters).toHaveBeenCalledWith(
        expect.objectContaining({ priceFrom: 0 })
      );
    });
  });

  it('permite seleccionar una ciudad', async () => {
    renderWithProviders(<SearchFilters onSearch={onSearchMock} />);
    const user = userEvent.setup();

    // Usa el label asociado correctamente
    const ciudadSelect = screen.getByLabelText('Ciudad');
    await user.click(ciudadSelect);

    // Selecciona la opción "Ciudad"
    const ciudadOption = await screen.findByRole('option', { name: 'Ciudad' });
    await user.click(ciudadOption);

    // Verifica que se haya seleccionado correctamente
    await waitFor(() => {
      expect(ciudadSelect).toHaveTextContent('Ciudad');
    });
  });

  it('permite seleccionar características (amenities)', async () => {
    renderWithProviders(<SearchFilters onSearch={onSearchMock} />);
    const user = userEvent.setup();

    // Abre el select
    const selectAmenities = screen.getByLabelText(/Características/i);
    await user.click(selectAmenities);

    // Click en "Piscina"
    const amenityOption = await screen.findByText(/Piscina/i);
    await user.click(amenityOption);

    // Cierra el dropdown haciendo click afuera
    await user.click(document.body);

    // Verifica que el texto renderizado en el Select incluye "Piscina"
    await waitFor(() => {
      expect(screen.getByText(/Piscina/)).toBeInTheDocument();
    });
  });
  it('filtra correctamente propiedades con +3 ambientes (rooms = 3)', async () => {
    mockGetPropertiesByFilters.mockResolvedValue([
      { id: 1, rooms: 2, title: 'P2' },
      { id: 2, rooms: 4, title: 'P4' },
    ]);

    renderWithProviders(<SearchFilters onSearch={onSearchMock} />);
    const user = userEvent.setup();

    // Obtenemos todos los combobox (selects)
    const comboboxes = screen.getAllByRole('combobox');

    // Según el orden, el de "Ambientes" suele ser el segundo o tercero:
    // Puedes inspeccionar el HTML del test y ajustar el índice si es necesario.
    // Por ejemplo, probemos con el segundo:
    const selAmb = comboboxes[2]; // ← este SÍ es "Ambientes"
    await user.click(selAmb);

    // Elegimos "+3"
    const opt3 = await screen.findByText('+3');
    await user.click(opt3);

    // Disparamos la búsqueda y comprobamos
    fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));
    await waitFor(() => {
      expect(onSearchMock).toHaveBeenCalledWith([
        { id: 2, rooms: 4, title: 'P4' },
      ]);
    });
  });
});
