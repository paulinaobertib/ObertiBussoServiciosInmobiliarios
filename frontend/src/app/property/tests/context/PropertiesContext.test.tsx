import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor, renderHook } from '@testing-library/react';
import { PropertyCrudProvider, usePropertyCrud } from '../../context/PropertiesContext';

/* Mocks de servicios */
vi.mock('../../services/amenity.service', () => ({
  getAllAmenities: vi.fn().mockResolvedValue([{ id: 1, name: 'Piscina' }])
}));
vi.mock('../../services/owner.service', () => ({
  getAllOwners: vi.fn().mockResolvedValue([{ id: 1, name: 'Juan Pérez' }])
}));
vi.mock('../../services/neighborhood.service', () => ({
  getAllNeighborhoods: vi.fn().mockResolvedValue([{ id: 1, name: 'Centro' }])
}));
vi.mock('../../services/type.service', () => ({
  getAllTypes: vi.fn().mockResolvedValue([{ id: 1, name: 'Departamento' }])
}));
vi.mock('../../services/property.service', () => ({
  getAllProperties: vi.fn().mockResolvedValue([
    { id: 1, title: 'Propiedad 1', operation: 'alquiler' },
    { id: 2, title: 'Propiedad 2', operation: 'alquiler' }
  ]),
  getPropertyById: vi.fn().mockResolvedValue({ id: 1, title: 'Propiedad 1', operation: 'alquiler' })
}));
vi.mock('../../services/maintenance.service', () => ({
  getMaintenanceByPropertyId: vi.fn().mockResolvedValue([{ id: 1, title: 'Revisión' }])
}));
vi.mock('../../services/comment.service', () => ({
  getCommentsByPropertyId: vi.fn().mockResolvedValue([{ id: 1, content: 'Comentario' }])
}));

/* Consumer de prueba */
const Consumer = () => {
  const ctx = usePropertyCrud();
  return (
    <div>
      {/* Acciones */}
      <button onClick={() => ctx.pickItem('category', 'owner')}>Pick Owner</button>
      <button onClick={() => ctx.pickItem('category', 'amenity')}>Pick Amenity</button>
      <button onClick={() => ctx.pickItem('category', 'neighborhood')}>Pick Neighborhood</button>
      <button onClick={() => ctx.pickItem('category', 'type')}>Pick Type</button>
      <button onClick={() => ctx.pickItem('property', { id: 1 })}>Pick Property</button>
      <button onClick={() => ctx.toggleSelect(1)}>Toggle Select</button>
      <button onClick={() => ctx.resetSelected()}>Reset</button>
      <button onClick={() => ctx.refreshAllCatalogs()}>Refresh All</button>
      <button onClick={() => ctx.refreshMaintenances()}>Refresh Maintenance</button>
      <button onClick={() => ctx.refreshComments()}>Refresh Comments</button>
      <button onClick={() => ctx.toggleCompare(1)}>Toggle Compare</button>
      <button onClick={() => ctx.clearComparison()}>Clear Compare</button>

      {/* Estados expuestos */}
      <div data-testid="picked">{ctx.pickedItem?.type}</div>
      <div data-testid="selected">{JSON.stringify(ctx.selected)}</div>
      <div data-testid="comparison">{ctx.selectedPropertyIds.join(',')}</div>
      <div data-testid="operations">{ctx.operationsList.join(',')}</div>
      <div data-testid="maintenancesLength">{ctx.maintenancesList.length}</div>
      <div data-testid="commentsLength">{ctx.commentsList.length}</div>
    </div>
  );
};

describe('PropertyCrudProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws if hook used outside provider', () => {
    const Test = () => { usePropertyCrud(); return null; };
    expect(() => render(<Test />)).toThrow('usePropertyCrud debe usarse dentro de PropertyCrudProvider');
  });

  it('proporciona valores iniciales y permite selección de owner', () => {
    render(
      <PropertyCrudProvider>
        <Consumer />
      </PropertyCrudProvider>
    );

    // Pick Owner
    act(() => screen.getByText('Pick Owner').click());
    expect(screen.getByTestId('picked')).toHaveTextContent('category');

    // Toggle Select
    act(() => screen.getByText('Toggle Select').click());
    expect(screen.getByTestId('selected').textContent).toContain('"owner":1');

    // Reset
    act(() => screen.getByText('Reset').click());
    expect(screen.getByTestId('selected').textContent).toContain('"owner":null');

    // Toggle Compare y Clear
    act(() => screen.getByText('Toggle Compare').click());
    expect(screen.getByTestId('comparison')).toHaveTextContent('1');
    act(() => screen.getByText('Clear Compare').click());
    expect(screen.getByTestId('comparison')).toBeEmptyDOMElement();
  });

  it('toggleSelect añade y quita amenity', () => {
    render(
      <PropertyCrudProvider>
        <Consumer />
      </PropertyCrudProvider>
    );

    // Pick Amenity
    act(() => screen.getByText('Pick Amenity').click());
    // Toggle Select
    act(() => screen.getByText('Toggle Select').click());
    expect(screen.getByTestId('selected').textContent).toContain('"amenities":[1]');
    act(() => screen.getByText('Toggle Select').click());
    expect(screen.getByTestId('selected').textContent).toContain('"amenities":[]');
  });

  it('toggleSelect añade y quita neighborhood', () => {
    render(
      <PropertyCrudProvider>
        <Consumer />
      </PropertyCrudProvider>
    );

    act(() => screen.getByText('Pick Neighborhood').click());
    act(() => screen.getByText('Toggle Select').click());
    expect(screen.getByTestId('selected').textContent).toContain('"neighborhood":1');
    act(() => screen.getByText('Toggle Select').click());
    expect(screen.getByTestId('selected').textContent).toContain('"neighborhood":null');
  });

  it('toggleSelect añade y quita type', () => {
    render(
      <PropertyCrudProvider>
        <Consumer />
      </PropertyCrudProvider>
    );

    act(() => screen.getByText('Pick Type').click());
    act(() => screen.getByText('Toggle Select').click());
    expect(screen.getByTestId('selected').textContent).toContain('"type":1');
    act(() => screen.getByText('Toggle Select').click());
    expect(screen.getByTestId('selected').textContent).toContain('"type":null');
  });

  it('refreshAllCatalogs rellena operationsList único', async () => {
    render(
      <PropertyCrudProvider>
        <Consumer />
      </PropertyCrudProvider>
    );
    await act(async () => screen.getByText('Refresh All').click());
    expect(screen.getByTestId('operations').textContent).toContain('alquiler');
  });

  it('refreshMaintenances y refreshComments muestran longitud correcta', async () => {
    render(
      <PropertyCrudProvider>
        <Consumer />
      </PropertyCrudProvider>
    );
    act(() => screen.getByText('Pick Property').click());
    await act(async () => screen.getByText('Refresh Maintenance').click());
    expect(screen.getByTestId('maintenancesLength')).toHaveTextContent('1');
    await act(async () => screen.getByText('Refresh Comments').click());
    expect(screen.getByTestId('commentsLength')).toHaveTextContent('1');
  });

  it('carga propiedades correctamente', async () => {
    const TestComponent = () => {
      const { loadProperty, currentProperty, loadingProperty, errorProperty } = usePropertyCrud();
      return (
        <div>
          <button onClick={() => loadProperty(1)}>Load Property</button>
          <div data-testid="property">{currentProperty?.title ?? 'none'}</div>
          <div data-testid="loading">{loadingProperty ? 'loading' : 'idle'}</div>
          <div data-testid="error">{errorProperty ?? 'no error'}</div>
        </div>
      );
    };

    render(
      <PropertyCrudProvider>
        <TestComponent />
      </PropertyCrudProvider>
    );

    act(() => screen.getByText('Load Property').click());
    await waitFor(() => {
      expect(screen.getByTestId('property')).toHaveTextContent('Propiedad 1');
      expect(screen.getByTestId('loading')).toHaveTextContent('idle');
      expect(screen.getByTestId('error')).toHaveTextContent('no error');
    });
  });

  it('maneja errores de carga de propiedad', async () => {
    const { getPropertyById } = await import('../../services/property.service');
    (getPropertyById as any).mockRejectedValueOnce(new Error('fail'));

    const TestComponent = () => {
      const { loadProperty, errorProperty } = usePropertyCrud();
      return (
        <div>
          <button onClick={() => loadProperty(999)}>Load</button>
          <div data-testid="error">{errorProperty ?? 'no error'}</div>
        </div>
      );
    };

    render(
      <PropertyCrudProvider>
        <TestComponent />
      </PropertyCrudProvider>
    );

    act(() => screen.getByText('Load').click());
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('No se pudo cargar');
    });
  });

  it('refresca datos de categoría y actualiza `data` y `categoryLoading`', async () => {
    // preparamos el mock para getAllTypes

    // Creamos un consumidor ad hoc para probar refresh()
    const CatConsumer = () => {
      const { pickItem, refresh, data, categoryLoading } = usePropertyCrud();
      return (
        <>
          <button onClick={() => { pickItem('category', 'type'); refresh(); }}>
            Refresh
          </button>
          <div data-testid="data">{data?.[0]?.name}</div>
          <div data-testid="loading">{categoryLoading.toString()}</div>
        </>
      );
    };

    render(
      <PropertyCrudProvider>
        <CatConsumer />
      </PropertyCrudProvider>
    );

    act(() => screen.getByText('Refresh').click());

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('Departamento');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('buildSearchParams convierte IDs de amenities a nombres', async () => {
    const { result } = renderHook(() => usePropertyCrud(), { wrapper: PropertyCrudProvider });
    await act(async () => result.current.refreshAllCatalogs());
    act(() => result.current.setSelected({ owner: null, neighborhood: null, type: null, amenities: [1] }));
    expect(result.current.buildSearchParams({}).amenities).toEqual(['Piscina']);
  });
});