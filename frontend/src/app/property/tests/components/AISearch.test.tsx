/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AISearch } from "../../components/search/AISearch";
import type { Property } from "../../types/property";

// Mock del hook useAISearch
const mockUseAISearch: {
  isAIEnabled: boolean;
  enableAI: any;
  disableAI: any;
  prompt: string;
  setPrompt: any;
  loading: boolean;
  error: string | null;
  handleAISearch: any;
  handleKeyDown: any;
} = {
  isAIEnabled: false,
  enableAI: vi.fn(),
  disableAI: vi.fn(),
  prompt: "",
  setPrompt: vi.fn(),
  loading: false,
  error: null,
  handleAISearch: vi.fn(),
  handleKeyDown: vi.fn(),
};

vi.mock("../../hooks/useAISearch", () => ({
  useAISearch: () => mockUseAISearch,
}));

// Mock del SearchBar
vi.mock("../../../shared/components/SearchBar", () => ({
  SearchBar: ({ placeholder }: { placeholder: string }) => <div data-testid="search-bar">SearchBar: {placeholder}</div>,
}));

// Mock de LoadingButton
vi.mock("@mui/lab", () => ({
  LoadingButton: ({ children, onClick, disabled, loading, ...props }: any) => (
    <button onClick={onClick} disabled={disabled || loading} data-loading={loading} {...props}>
      {children}
    </button>
  ),
}));

describe("AISearch", () => {
  const mockProperty: Property = {
    id: 1,
    title: "Casa Test",
    street: "Calle",
    number: "123",
    description: "Descripción",
    status: "DISPONIBLE",
    operation: "VENTA",
    currency: "USD",
    rooms: 3,
    bathrooms: 2,
    bedrooms: 3,
    area: 120,
    coveredArea: 100,
    price: 100000,
    expenses: null,
    showPrice: true,
    credit: false,
    financing: false,
    outstanding: false,
    owner: { id: 1, firstName: "John", lastName: "Doe", email: "john@example.com", phone: "123456789" },
    neighborhood: { id: 1, name: "Centro", city: "Ciudad X", type: "" },
    type: { id: 1, name: "Casa", hasBedrooms: true, hasBathrooms: true, hasRooms: true, hasCoveredArea: true },
    amenities: [],
    mainImage: "image.jpg",
    images: [],
    date: new Date().toISOString(),
  };

  const mockFetchByText = vi.fn().mockResolvedValue([mockProperty]);
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAISearch.isAIEnabled = false;
    mockUseAISearch.enableAI = vi.fn();
    mockUseAISearch.disableAI = vi.fn();
    mockUseAISearch.prompt = "";
    mockUseAISearch.setPrompt = vi.fn();
    mockUseAISearch.loading = false;
    mockUseAISearch.error = null;
    mockUseAISearch.handleAISearch = vi.fn();
    mockUseAISearch.handleKeyDown = vi.fn();
  });

  describe("Renderizado inicial", () => {
    it("debe renderizar el componente con búsqueda manual activa", () => {
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      expect(screen.getByText(/SearchBar/)).toBeInTheDocument();
      expect(screen.getByText(/Búsqueda Inteligente/)).toBeInTheDocument();
    });

    it("debe mostrar el placeholder correcto", () => {
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} placeholder="Buscar inmueble" />);

      expect(screen.getByText(/Buscar inmueble/)).toBeInTheDocument();
    });

    it("debe renderizar botón de IA en desktop", () => {
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      const buttons = screen.getAllByText(/Búsqueda Inteligente/);
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Toggle de búsqueda con IA", () => {
    it("debe habilitar la búsqueda con IA al hacer clic", () => {
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      const button = screen.getAllByText(/Búsqueda Inteligente/)[0];
      fireEvent.click(button);

      expect(mockUseAISearch.enableAI).toHaveBeenCalled();
      expect(mockOnSearch).toHaveBeenCalledWith(null);
    });

    it("debe deshabilitar la búsqueda con IA cuando ya está activa", () => {
      mockUseAISearch.isAIEnabled = true;
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      const button = screen.getAllByText(/Búsqueda Manual/)[0];
      fireEvent.click(button);

      expect(mockUseAISearch.disableAI).toHaveBeenCalled();
      expect(mockOnSearch).toHaveBeenCalledWith(null);
    });
  });

  describe("Modo búsqueda con IA", () => {
    beforeEach(() => {
      mockUseAISearch.isAIEnabled = true;
    });

    it("debe mostrar el formulario de IA cuando está habilitado", async () => {
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      await waitFor(() => {
        expect(screen.getByText(/Contanos qué estás buscando/)).toBeInTheDocument();
      });
    });

    it("debe mostrar el placeholder del textarea", async () => {
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Ej: Busco una casa de 3 dormitorios/);
        expect(textarea).toBeInTheDocument();
      });
    });

    it("debe actualizar el prompt al escribir", async () => {
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Ej: Busco una casa de 3 dormitorios/);
        fireEvent.change(textarea, { target: { value: "Casa en Centro" } });
        expect(mockUseAISearch.setPrompt).toHaveBeenCalledWith("Casa en Centro");
      });
    });

    it("debe llamar handleKeyDown al presionar una tecla", async () => {
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Ej: Busco una casa de 3 dormitorios/);
        fireEvent.keyDown(textarea, { key: "Enter" });
        expect(mockUseAISearch.handleKeyDown).toHaveBeenCalled();
      });
    });

    it("debe mostrar el botón de búsqueda", async () => {
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      await waitFor(() => {
        expect(screen.getByText("Comenzar Búsqueda")).toBeInTheDocument();
      });
    });

    it("debe llamar handleAISearch al hacer clic en el botón", async () => {
      mockUseAISearch.prompt = "Test query";
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      await waitFor(() => {
        const button = screen.getByText("Comenzar Búsqueda");
        fireEvent.click(button);
        expect(mockUseAISearch.handleAISearch).toHaveBeenCalled();
      });
    });

    it("debe deshabilitar el botón cuando está cargando", async () => {
      mockUseAISearch.loading = true;
      mockUseAISearch.prompt = "Test query";
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      await waitFor(() => {
        const button = screen.getByText("Comenzar Búsqueda");
        expect(button).toBeDisabled();
      });
    });

    it("debe deshabilitar el botón cuando el prompt está vacío", async () => {
      mockUseAISearch.prompt = "";
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      await waitFor(() => {
        const button = screen.getByText("Comenzar Búsqueda");
        expect(button).toBeDisabled();
      });
    });

    it("debe mostrar mensaje de error cuando existe", async () => {
      mockUseAISearch.error = "Error de búsqueda";
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      await waitFor(() => {
        expect(screen.getByText("Error de búsqueda")).toBeInTheDocument();
      });
    });

    it("no debe mostrar SearchBar cuando IA está activa", async () => {
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      await waitFor(() => {
        expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();
      });
    });
  });

  describe("Slots personalizados", () => {
    it("debe renderizar compareSlot cuando se proporciona", () => {
      const compareSlot = <div data-testid="compare-slot">Compare Button</div>;
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} compareSlot={compareSlot} />);

      const compareSlots = screen.getAllByTestId("compare-slot");
      expect(compareSlots.length).toBeGreaterThan(0);
      expect(compareSlots[0]).toBeInTheDocument();
    });

    it("debe renderizar filterSlot cuando se proporciona", () => {
      const filterSlot = <div data-testid="filter-slot">Filter Button</div>;
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} filterSlot={filterSlot} />);

      expect(screen.getByTestId("filter-slot")).toBeInTheDocument();
    });

    it("debe manejar la ausencia de slots", () => {
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      expect(screen.queryByTestId("compare-slot")).not.toBeInTheDocument();
      expect(screen.queryByTestId("filter-slot")).not.toBeInTheDocument();
    });
  });

  describe("Props customizables", () => {
    it("debe aplicar estilos personalizados con sx prop", () => {
      const customSx = { backgroundColor: "red" };
      const { container } = render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} sx={customSx} />);

      // Verificar que el componente se renderiza (los estilos MUI son difíciles de testear directamente)
      expect(container.firstChild).toBeInTheDocument();
    });

    it("debe usar debounceMs personalizado", () => {
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} debounceMs={1000} />);

      expect(screen.getByText(/SearchBar/)).toBeInTheDocument();
    });
  });

  describe("Integración fetchByText", () => {
    it("debe pasar fetchByText al SearchBar", () => {
      const customFetch = vi.fn().mockResolvedValue([]);
      render(<AISearch fetchByText={customFetch} onSearch={mockOnSearch} />);

      expect(screen.getByText(/SearchBar/)).toBeInTheDocument();
    });
  });

  describe("Texto del botón de IA", () => {
    it("debe mostrar 'Búsqueda Manual' cuando IA está activa en desktop", () => {
      mockUseAISearch.isAIEnabled = true;
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      // Buscar en el botón de desktop (no el de mobile)
      const buttons = screen.getAllByText(/Búsqueda Manual/);
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("debe mostrar 'Búsqueda Inteligente' cuando IA está desactivada", () => {
      mockUseAISearch.isAIEnabled = false;
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      const buttons = screen.getAllByText(/Búsqueda Inteligente/);
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Instrucciones de uso", () => {
    it("debe mostrar instrucciones al usuario cuando IA está activa", async () => {
      mockUseAISearch.isAIEnabled = true;
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      await waitFor(() => {
        expect(
          screen.getByText(/Escribí debajo como si le estuvieras contando a un agente inmobiliario/)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Estado de carga", () => {
    it("debe mostrar estado de carga en el botón", async () => {
      mockUseAISearch.isAIEnabled = true;
      mockUseAISearch.loading = true;
      mockUseAISearch.prompt = "Test";
      render(<AISearch fetchByText={mockFetchByText} onSearch={mockOnSearch} />);

      await waitFor(() => {
        const button = screen.getByText("Comenzar Búsqueda");
        expect(button).toHaveAttribute("data-loading", "true");
      });
    });
  });
});
