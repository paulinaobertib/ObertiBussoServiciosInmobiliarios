import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { PropertyCrudProvider, usePropertyCrud } from '../../context/PropertiesContext';

/* mocks */
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
  getAllProperties: vi.fn().mockResolvedValue([{ id: 1, title: 'Propiedad 1', operation: 'alquiler' }]),
  getPropertyById: vi.fn().mockResolvedValue({ id: 1, title: 'Propiedad 1', operation: 'alquiler' })
}));
vi.mock('../../services/maintenance.service', () => ({
  getMaintenanceByPropertyId: vi.fn().mockResolvedValue([{ id: 1, title: 'Revisión' }])
}));
vi.mock('../../services/comment.service', () => ({
  getCommentsByPropertyId: vi.fn().mockResolvedValue([{ id: 1, content: 'Comentario' }])
}));

/* wrapper para consumir el contexto */
const Consumer = () => {
  const ctx = usePropertyCrud();

  return (
    <div>
      <button onClick={() => ctx.pickItem('category', 'owner')}>Pick Owner</button>
      <button onClick={() => ctx.toggleSelect(1)}>Toggle Select</button>
      <button onClick={() => ctx.resetSelected()}>Reset</button>
      <button onClick={() => ctx.refresh()}>Refresh</button>
      <button onClick={() => ctx.toggleCompare(1)}>Toggle Compare</button>
      <button onClick={() => ctx.clearComparison()}>Clear Compare</button>
      <div data-testid="picked">{ctx.pickedItem?.type}</div>
      <div data-testid="selected">{JSON.stringify(ctx.selected)}</div>
      <div data-testid="comparison">{ctx.selectedPropertyIds.join(',')}</div>
    </div>
  );
};

describe('PropertyCrudProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('proporciona valores iniciales y permite selección', async () => {
    render(
      <PropertyCrudProvider>
        <Consumer />
      </PropertyCrudProvider>
    );

    // Pick item
    act(() => {
      screen.getByText('Pick Owner').click();
    });
    expect(screen.getByTestId('picked')).toHaveTextContent('category');

    // Toggle select
    act(() => {
      screen.getByText('Toggle Select').click();
    });
    expect(screen.getByTestId('selected').textContent).toContain('"owner":1');

    // Reset
    act(() => {
      screen.getByText('Reset').click();
    });
    expect(screen.getByTestId('selected').textContent).toContain('"owner":null');

    // Refresh category
    act(() => {
      screen.getByText('Refresh').click();
    });
    await waitFor(() => {
      expect(screen.getByTestId('selected')).toBeTruthy();
    });

    // Toggle compare
    act(() => {
      screen.getByText('Toggle Compare').click();
    });
    expect(screen.getByTestId('comparison').textContent).toContain('1'); // <-- ✅ ARREGLADO

    // Clear comparison
    act(() => {
      screen.getByText('Clear Compare').click();
    });
    expect(screen.getByTestId('comparison').textContent).toBe('');
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

    act(() => {
      screen.getByText('Load Property').click();
    });

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

    act(() => {
      screen.getByText('Load').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('No se pudo cargar');
    });
  });
});
