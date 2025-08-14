/// <reference types="vitest" />
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, type Mock } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { FavoritesPanel } from "../../../components/favorites/FavoritesPanel";
import { useFavorites } from "../../../hooks/useFavorites";

vi.mock("../../../hooks/useFavorites", () => ({
  useFavorites: vi.fn(),
}));

vi.mock("../../../../property/services/property.service", () => ({
  getPropertyById: vi.fn(),
}));

vi.mock("../../../../property/components/catalog/CatalogList", () => ({
  CatalogList: ({ properties, onCardClick }: any) => (
    <div data-testid="catalog-list">
      {(properties ?? []).map((p: any) => (
        <button
          key={p.id}
          data-testid={`property-${p.id}`}
          onClick={() => onCardClick?.(p)}
        >
          {p.title}
        </button>
      ))}
    </div>
  ),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual: any = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Traemos la función mockeada para poder hacer .mockResolvedValueOnce
import { getPropertyById as _getPropertyById } from "../../../../property/services/property.service";

const getPropertyById = _getPropertyById as unknown as Mock;
const useFavoritesMock = useFavorites as unknown as Mock;

// ─────────────────── Tests ───────────────────

describe("FavoritesPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra loading mientras carga favoritos", () => {
    useFavoritesMock.mockReturnValue({ favorites: [], loading: true });

    render(
      <BrowserRouter>
        <FavoritesPanel />
      </BrowserRouter>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("muestra mensaje cuando hay favoritos pero ninguno 'disponible'", async () => {
    useFavoritesMock.mockReturnValue({
      favorites: [{ propertyId: 1 }, { propertyId: 2 }],
      loading: false,
    });

    // Ninguna disponible
    getPropertyById
      .mockResolvedValueOnce({ id: 1, status: "PAUSADA", title: "Prop 1" })
      .mockResolvedValueOnce({ id: 2, status: "  NO DISPONIBLE ", title: "Prop 2" });

    render(
      <BrowserRouter>
        <FavoritesPanel />
      </BrowserRouter>
    );

    await waitFor(() =>
      expect(
        screen.getByText(/No tienes favoritos disponibles/i)
      ).toBeInTheDocument()
    );
  });

  it("renderiza SOLO las propiedades con status 'disponible' (case/trim) y navega al hacer click", async () => {
    useFavoritesMock.mockReturnValue({
      favorites: [{ propertyId: 10 }, { propertyId: 20 }, { propertyId: 30 }],
      loading: false,
    });

    getPropertyById
      .mockResolvedValueOnce({ id: 10, status: "DISPONIBLE", title: "Propiedad 10" })
      .mockResolvedValueOnce({ id: 20, status: "  disponible  ", title: "Propiedad 20" })
      .mockResolvedValueOnce({ id: 30, status: "Pausada", title: "Propiedad 30" });

    render(
      <BrowserRouter>
        <FavoritesPanel />
      </BrowserRouter>
    );

    await screen.findByTestId("catalog-list");

    // Deben aparecer solo 10 y 20
    expect(screen.getByText("Propiedad 10")).toBeInTheDocument();
    expect(screen.getByText("Propiedad 20")).toBeInTheDocument();
    expect(screen.queryByText("Propiedad 30")).not.toBeInTheDocument();

    // Click → navega al detalle
    await userEvent.click(screen.getByTestId("property-10"));
    expect(mockNavigate).toHaveBeenCalledWith("/properties/10");
  });

  it("filtra respuestas nulas/invalidas de getPropertyById", async () => {
    useFavoritesMock.mockReturnValue({
      favorites: [{ propertyId: 1 }, { propertyId: 2 }, { propertyId: 3 }],
      loading: false,
    });

    // 1) válida y disponible
    // 2) null → se filtra
    // 3) objeto sin id numérico → se filtra
    getPropertyById
      .mockResolvedValueOnce({ id: 1, status: "disponible", title: "OK 1" })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "3", status: "disponible", title: "INVALIDA" });

    render(
      <BrowserRouter>
        <FavoritesPanel />
      </BrowserRouter>
    );

    await screen.findByTestId("catalog-list");

    expect(screen.getByText("OK 1")).toBeInTheDocument();
    expect(screen.queryByText("INVALIDA")).not.toBeInTheDocument();
  });
});
