import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from '../../components/SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = vi.fn();
  const mockFetchAll = vi.fn();
  const mockFetchByText = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza correctamente el input con placeholder', () => {
    render(
      <SearchBar
        fetchAll={mockFetchAll}
        fetchByText={mockFetchByText}
        onSearch={mockOnSearch}
        placeholder="Buscar propiedades"
      />
    );

    const input = screen.getByPlaceholderText(/buscar propiedades/i);
    expect(input).toBeInTheDocument();
  });

  it('llama a fetchAll cuando el input está vacío', async () => {
    const mockResults = [{ id: 1, title: 'Propiedad A' }];
    mockFetchAll.mockResolvedValueOnce(mockResults);

    render(
      <SearchBar
        fetchAll={mockFetchAll}
        fetchByText={mockFetchByText}
        onSearch={mockOnSearch}
        debounceMs={100}
      />
    );

    // Espera a que se dispare useEffect inicial
    await waitFor(() => {
      expect(mockFetchAll).toHaveBeenCalled();
      expect(mockOnSearch).toHaveBeenCalledWith(mockResults);
    });
  });

  it('llama a fetchByText cuando el input tiene texto', async () => {
    const mockResults = [{ id: 2, title: 'Propiedad B' }];
    mockFetchByText.mockResolvedValueOnce(mockResults);

    render(
      <SearchBar
        fetchAll={mockFetchAll}
        fetchByText={mockFetchByText}
        onSearch={mockOnSearch}
        debounceMs={100}
      />
    );

    const input = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(input, { target: { value: 'casa' } });

    await waitFor(() => {
      expect(mockFetchByText).toHaveBeenCalledWith('casa');
      expect(mockOnSearch).toHaveBeenCalledWith(mockResults);
    });
  });

  it('muestra el spinner de carga mientras espera resultados', async () => {
    let resolver: (value: any[]) => void;
    const promise = new Promise<any[]>(res => {
      resolver = res;
    });

    mockFetchByText.mockReturnValueOnce(promise);

    render(
      <SearchBar
        fetchAll={mockFetchAll}
        fetchByText={mockFetchByText}
        onSearch={mockOnSearch}
        debounceMs={100}
      />
    );

    const input = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(input, { target: { value: 'loading' } });

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeVisible();
    });

    resolver!([{ id: 3, title: 'Propiedad cargada' }]);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('maneja errores y llama a onSearch con array vacío', async () => {
    mockFetchByText.mockRejectedValueOnce(new Error('fail'));

    render(
      <SearchBar
        fetchAll={mockFetchAll}
        fetchByText={mockFetchByText}
        onSearch={mockOnSearch}
        debounceMs={100}
      />
    );

    const input = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(input, { target: { value: 'error' } });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith([]);
    });
  });
});
