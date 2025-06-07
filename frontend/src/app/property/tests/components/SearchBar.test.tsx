import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '../../components/SearchBar';
import * as propertyService from '../../services/property.service';
import type { Property } from '../../types/property';
import { emptyProperty } from '../../types/property';

describe('SearchBar', () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el input con placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/buscar por título o descripción/i);
    expect(input).toBeInTheDocument();
  });

  it('realiza búsqueda y llama a onSearch con resultados para texto vacío', async () => {
    const mockResults = [{ id: 1, title: 'Propiedad test' }];
    vi.spyOn(propertyService, 'getAllProperties').mockResolvedValueOnce(mockResults);

    render(<SearchBar onSearch={mockOnSearch} debounceMs={100} />);

    // Al inicio el input está vacío y se ejecuta la búsqueda
    await waitFor(() => {
      expect(propertyService.getAllProperties).toHaveBeenCalled();
      expect(mockOnSearch).toHaveBeenCalledWith(mockResults);
    });
  });

it('realiza búsqueda y llama a onSearch con resultados para texto vacío', async () => {
  const mockResults: Property[] = [
    {
      ...emptyProperty,
      id: 1,
      title: 'Propiedad test',
    },
  ];
  
  vi.spyOn(propertyService, 'getAllProperties').mockResolvedValueOnce(mockResults);

  render(<SearchBar onSearch={mockOnSearch} debounceMs={100} />);

  await waitFor(() => {
    expect(propertyService.getAllProperties).toHaveBeenCalled();
    expect(mockOnSearch).toHaveBeenCalledWith(mockResults);
  });
});

it('muestra el spinner de carga mientras se espera el resultado', async () => {
  let resolver: (value: Property[]) => void;
  const promise = new Promise<Property[]>(res => {
    resolver = res;
  });

  vi.spyOn(propertyService, 'getPropertiesByText').mockReturnValueOnce(promise);

  render(<SearchBar onSearch={mockOnSearch} debounceMs={100} />);
  const input = screen.getByPlaceholderText(/buscar por título o descripción/i);

  fireEvent.change(input, { target: { value: 'loading' } });

  // Esperar a que aparezca el spinner (loading = true)
  await waitFor(() => {
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  // Resolvemos la promesa para que termine la carga
  resolver!([{ ...emptyProperty, id: 3, title: 'propiedad cargada' }]);

  // Esperamos a que desaparezca el spinner
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});

  it('maneja errores y llama a onSearch con array vacío', async () => {
    vi.spyOn(propertyService, 'getPropertiesByText').mockRejectedValueOnce(new Error('fail'));

    render(<SearchBar onSearch={mockOnSearch} debounceMs={100} />);
    const input = screen.getByPlaceholderText(/buscar por título o descripción/i);

    fireEvent.change(input, { target: { value: 'error' } });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith([]);
    });
  });
});
