import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchBar } from "../../components/SearchBar";

describe("SearchBar", () => {
  const mockOnSearch = vi.fn();
  const mockFetchAll = vi.fn();
  const mockFetchByText = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza correctamente el input con placeholder", () => {
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

  it("NO llama a fetchAll al montar (evita doble carga)", () => {
    const mockResults = [{ id: 1, title: "Propiedad A" }];
    mockFetchAll.mockResolvedValueOnce(mockResults);

    render(
      <SearchBar fetchAll={mockFetchAll} fetchByText={mockFetchByText} onSearch={mockOnSearch} debounceMs={100} />
    );

    // SearchBar NO hace búsqueda inicial con input vacío
    expect(mockFetchAll).not.toHaveBeenCalled();
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it("llama a fetchByText cuando el input tiene texto", async () => {
    const mockResults = [{ id: 2, title: "Propiedad B" }];
    mockFetchByText.mockResolvedValueOnce(mockResults);

    render(
      <SearchBar fetchAll={mockFetchAll} fetchByText={mockFetchByText} onSearch={mockOnSearch} debounceMs={100} />
    );

    const input = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(input, { target: { value: "casa" } });

    await waitFor(() => {
      expect(mockFetchByText).toHaveBeenCalledWith("casa");
      expect(mockOnSearch).toHaveBeenCalledWith(mockResults);
    });
  });

  it("muestra el spinner de carga mientras espera resultados", async () => {
    let resolver: (value: any[]) => void;
    const promise = new Promise<any[]>((res) => {
      resolver = res;
    });

    mockFetchByText.mockReturnValueOnce(promise);

    render(
      <SearchBar fetchAll={mockFetchAll} fetchByText={mockFetchByText} onSearch={mockOnSearch} debounceMs={100} />
    );

    const input = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(input, { target: { value: "loading" } });

    await waitFor(() => {
      expect(screen.getByRole("progressbar")).toBeVisible();
    });

    resolver!([{ id: 3, title: "Propiedad cargada" }]);

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });

  it("maneja errores y llama a onSearch con array vacío", async () => {
    mockFetchByText.mockRejectedValueOnce(new Error("fail"));

    render(
      <SearchBar fetchAll={mockFetchAll} fetchByText={mockFetchByText} onSearch={mockOnSearch} debounceMs={100} />
    );

    const input = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(input, { target: { value: "error" } });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith([]);
    });
  });

  it("filtra localmente cuando no se provee fetchByText", async () => {
    render(
      <SearchBar
        data={[
          { id: 1, title: "Casa amplia", city: "Córdoba" },
          { id: 2, title: "Depto chico", city: "Rosario" },
        ]}
        onSearch={mockOnSearch}
        debounceMs={0}
        localFilterFields={["title"]}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/buscar/i), { target: { value: "casa" } });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith([{ id: 1, title: "Casa amplia", city: "Córdoba" }]);
    });
  });

  it("al limpiar búsqueda tras escribir llama a fetchAll", async () => {
    mockFetchByText.mockResolvedValueOnce([]);
    mockFetchAll.mockResolvedValueOnce([{ id: 9 }]);

    render(
      <SearchBar fetchAll={mockFetchAll} fetchByText={mockFetchByText} onSearch={mockOnSearch} debounceMs={0} />
    );

    const input = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(input, { target: { value: "casa" } });
    await waitFor(() => {
      expect(mockFetchByText).toHaveBeenCalledWith("casa");
    });

    fireEvent.change(input, { target: { value: "" } });
    await waitFor(() => {
      expect(mockFetchAll).toHaveBeenCalled();
    });
  });
});
