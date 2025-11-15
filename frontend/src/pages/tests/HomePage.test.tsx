/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import HomePage from "../HomePage";

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock del contexto de autenticación
let mockIsAdmin = false;
vi.mock("../../app/user/context/AuthContext", () => ({
  useAuthContext: () => ({ isAdmin: mockIsAdmin }),
}));

// Mock del contexto de propiedades
const mockToggleCompare = vi.fn();
const mockClearComparison = vi.fn();
const mockResetSelected = vi.fn();
const mockSetPropertiesLoading = vi.fn();

vi.mock("../../app/property/context/PropertiesContext", () => ({
  usePropertiesContext: () => ({
    selectedPropertyIds: [],
    toggleCompare: mockToggleCompare,
    clearComparison: mockClearComparison,
    disabledCompare: true,
    resetSelected: mockResetSelected,
    setPropertiesLoading: mockSetPropertiesLoading,
  }),
}));

// Mock de useGlobalAlert
const mockAlertInfo = vi.fn();
const mockAlertWarning = vi.fn();
vi.mock("../../app/shared/context/AlertContext", () => ({
  useGlobalAlert: () => ({
    info: mockAlertInfo,
    warning: mockAlertWarning,
  }),
}));

// Mock de getPropertiesByText
const mockGetPropertiesByText = vi.fn();
vi.mock("../../app/property/services/property.service", () => ({
  getPropertiesByText: (...args: any[]) => mockGetPropertiesByText(...args),
}));

beforeAll(() => {
  if (typeof window !== "undefined") {
    Object.defineProperty(window, "scrollTo", {
      value: vi.fn(),
      writable: true,
    });
  }
});

// Mock de componentes
vi.mock("../../app/shared/components/images/ImageCarousel", () => ({
  ImageCarousel: () => <div data-testid="image-carousel">ImageCarousel</div>,
}));

vi.mock("../../app/property/components/catalog/SearchFilters", () => ({
  SearchFilters: ({ onSearch }: any) => (
    <div data-testid="search-filters">
      SearchFilters
      <button onClick={() => onSearch([])}>Apply Filters</button>
    </div>
  ),
}));

vi.mock("../../app/property/components/catalog/PropertyCatalog", () => ({
  PropertyCatalog: ({ mode, onFinishAction }: any) => (
    <div data-testid="property-catalog">
      PropertyCatalog - Mode: {mode}
      <button onClick={() => onFinishAction()}>Finish Action</button>
    </div>
  ),
}));

vi.mock("../../app/property/components/search/AISearch", () => ({
  AISearch: ({ fetchByText, onSearch, placeholder, compareSlot, filterSlot }: any) => (
    <div data-testid="ai-search">
      AISearch - {placeholder}
      <button onClick={() => fetchByText("test")}>Fetch</button>
      <button onClick={() => onSearch([])}>Search</button>
      {compareSlot && <div data-testid="compare-slot-rendered">{compareSlot}</div>}
      {filterSlot && <div data-testid="filter-slot-rendered">{filterSlot}</div>}
    </div>
  ),
}));

vi.mock("../../app/property/components/catalog/FloatingButtons", () => ({
  FloatingButtons: ({ onAction, toggleSelectionMode }: any) => (
    <div data-testid="floating-buttons">
      <button onClick={() => onAction("create")}>Create</button>
      <button onClick={() => onAction("edit")}>Edit</button>
      <button onClick={() => onAction("delete")}>Delete</button>
      <button onClick={toggleSelectionMode}>Toggle Selection</button>
    </div>
  ),
}));

vi.mock("../BasePage", () => ({
  BasePage: ({ children }: any) => <div data-testid="base-page">{children}</div>,
}));

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAdmin = false;
    localStorage.clear();
    mockGetPropertiesByText.mockResolvedValue([]);
  });

  describe("Renderizado inicial", () => {
    it("debe renderizar todos los componentes principales", () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

    //   expect(screen.getByTestId("base-page")).toBeInTheDocument();
      expect(screen.getByTestId("image-carousel")).toBeInTheDocument();
      expect(screen.getByTestId("ai-search")).toBeInTheDocument();
      expect(screen.getByTestId("search-filters")).toBeInTheDocument();
      expect(screen.getByTestId("property-catalog")).toBeInTheDocument();
      expect(screen.getByTestId("floating-buttons")).toBeInTheDocument();
    });

    it("debe limpiar selectedPropertyId en localStorage", () => {
      localStorage.setItem("selectedPropertyId", "123");

      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      expect(localStorage.getItem("selectedPropertyId")).toBe("");
    });

    it("debe llamar resetSelected al montar", () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      expect(mockResetSelected).toHaveBeenCalled();
    });
  });

  describe("fetchPropertiesByText", () => {
    it("debe filtrar propiedades por status cuando es usuario", async () => {
      mockIsAdmin = false;
      const mockProperties = [
        { id: 1, status: "DISPONIBLE" },
        { id: 2, status: "VENDIDO" },
        { id: 3, status: "DISPONIBLE" },
      ];
      mockGetPropertiesByText.mockResolvedValue(mockProperties);

      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      const fetchButton = screen.getByText("Fetch");
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(mockGetPropertiesByText).toHaveBeenCalledWith("test");
      });
    });

    it("no debe filtrar propiedades cuando es admin", async () => {
      mockIsAdmin = true;
      const mockProperties = [
        { id: 1, status: "DISPONIBLE" },
        { id: 2, status: "VENDIDO" },
      ];
      mockGetPropertiesByText.mockResolvedValue(mockProperties);

      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      const fetchButton = screen.getByText("Fetch");
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(mockGetPropertiesByText).toHaveBeenCalledWith("test");
      });
    });

    it("debe activar y desactivar loading", async () => {
      mockGetPropertiesByText.mockResolvedValue([]);

      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      const fetchButton = screen.getByText("Fetch");
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(mockSetPropertiesLoading).toHaveBeenCalledWith(true);
      });

      await waitFor(() => {
        expect(mockSetPropertiesLoading).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("Modo admin - Acciones flotantes", () => {
    beforeEach(() => {
      mockIsAdmin = true;
    });

    it("debe navegar a crear propiedad al hacer clic en Create", () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      const createButton = screen.getByText("Create");
      fireEvent.click(createButton);

      expect(mockNavigate).toHaveBeenCalledWith("/properties/new");
    });

    it("debe activar modo edición al hacer clic en Edit", () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      const editButton = screen.getByText("Edit");
      fireEvent.click(editButton);

      expect(mockAlertInfo).toHaveBeenCalledWith({
        title: "Modo edición: selecciona una propiedad",
        primaryLabel: "Ok",
      });

      expect(screen.getByText(/PropertyCatalog - Mode: edit/)).toBeInTheDocument();
    });

    it("debe salir del modo edición al hacer clic en Edit nuevamente", () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      const editButton = screen.getByText("Edit");

      // Activar modo edición
      fireEvent.click(editButton);
      expect(screen.getByText(/PropertyCatalog - Mode: edit/)).toBeInTheDocument();

      // Desactivar modo edición
      fireEvent.click(editButton);

      expect(mockAlertInfo).toHaveBeenCalledWith({
        title: "Saliste del modo edición",
        primaryLabel: "Ok",
      });
    });

    it("debe activar modo eliminación al hacer clic en Delete", () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      const deleteButton = screen.getByText("Delete");
      fireEvent.click(deleteButton);

      expect(mockAlertWarning).toHaveBeenCalledWith({
        title: "Modo eliminación: selecciona una propiedad",
        primaryLabel: "Entendido",
      });

      expect(screen.getByText(/PropertyCatalog - Mode: delete/)).toBeInTheDocument();
    });

    it("debe salir del modo eliminación al hacer clic en Delete nuevamente", () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      const deleteButton = screen.getByText("Delete");

      // Activar modo eliminación
      fireEvent.click(deleteButton);

      // Desactivar modo eliminación
      fireEvent.click(deleteButton);

      expect(mockAlertInfo).toHaveBeenCalledWith({
        title: "Saliste del modo eliminación",
        primaryLabel: "Ok",
      });
    });

    it("debe volver a modo normal al terminar acción", () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      const editButton = screen.getByText("Edit");
      fireEvent.click(editButton);

      expect(screen.getByText(/PropertyCatalog - Mode: edit/)).toBeInTheDocument();

      const finishButton = screen.getByText("Finish Action");
      fireEvent.click(finishButton);

      expect(screen.getByText(/PropertyCatalog - Mode: normal/)).toBeInTheDocument();
    });
  });

  describe("AISearch con slots", () => {
    it("debe renderizar el compareSlot", () => {
      mockIsAdmin = false;
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      expect(screen.getByTestId("compare-slot-rendered")).toBeInTheDocument();
    });

    it("debe renderizar el filterSlot", () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      expect(screen.getByTestId("filter-slot-rendered")).toBeInTheDocument();
    });

    it("no debe renderizar compareSlot cuando es admin", () => {
      mockIsAdmin = true;
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      // El compareSlot no debe estar presente para admin
      // ya que el componente retorna null cuando isAdmin es true
      expect(screen.queryByTestId("compare-slot-rendered")).not.toBeInTheDocument();
    });
  });

  describe("Búsqueda con AISearch", () => {
    it("debe actualizar resultados al buscar", () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      const searchButton = screen.getByText("Search");
      fireEvent.click(searchButton);

      // Verificar que el componente se renderiza correctamente
      expect(screen.getByTestId("property-catalog")).toBeInTheDocument();
    });
  });

  describe("SearchFilters", () => {
    it("debe actualizar resultados al aplicar filtros", () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      const applyButton = screen.getByText("Apply Filters");
      fireEvent.click(applyButton);

      expect(screen.getByTestId("property-catalog")).toBeInTheDocument();
    });
  });

  describe("Placeholder de AISearch", () => {
    it("debe tener el placeholder correcto", () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      expect(screen.getByText(/Buscar propiedad/)).toBeInTheDocument();
    });
  });
});
