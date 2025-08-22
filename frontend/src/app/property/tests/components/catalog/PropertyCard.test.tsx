/// <reference types="vitest" />
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../../../user/components/favorites/FavoriteButtom", () => ({
  FavoriteButton: ({ propertyId }: { propertyId: number }) => (
    <div data-testid="fav-btn">fav-{propertyId}</div>
  ),
}));

vi.mock("../../../../user/context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

vi.mock("../../../../user/hooks/useFavorites", () => ({
  useFavorites: () => ({ favorites: [], toggle: vi.fn() }),
}));

vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => ({ showAlert: vi.fn() }),
}));

if (!(URL as any).createObjectURL) {
  (URL as any).createObjectURL = vi.fn(() => "blob:mock-url");
}

const { useAuthContext } = await import("../../../../user/context/AuthContext");
const { PropertyCard } = await import("../../../components/catalog/PropertyCard");

const theme: any = createTheme({
  palette: {
    primary: { main: "#1976d2", dark: "#115293" },
    quaternary: { main: "#f5f5f7", contrastText: "#111" },
  },
});

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

/* ====== DATA BASE ====== */
const baseProp = {
  id: 10,
  title: "Casa con patio",
  description: "Desc",
  price: 123456,
  area: 80,
  coveredArea: 60,
  expenses: 15000,
  currency: "ARS",
  operation: "VENTA" as const,
  status: "DISPONIBLE",
  rooms: 3,
  bedrooms: 2,
  bathrooms: 1,
  credit: false,
  financing: false,
  showPrice: true,
  outstanding: false,
  street: "Calle",
  number: "123",
  owner: { id: 1, firstName: "", lastName: "", phone: "", email: "" },
  neighborhood: { id: 1, name: "Centro", city: "X", type: "U" },
  type: {
    id: 1,
    name: "Casa",
    hasRooms: true,
    hasBedrooms: true,
    hasBathrooms: true,
    hasCoveredArea: true,
  },
  amenities: [],
  mainImage: "https://img/test.jpg" as any,
  images: [],
  date: new Date().toISOString(),
};

/* ====== TESTS ====== */
describe("<PropertyCard />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthContext as any).mockReturnValue({ isAdmin: false });
  });

  it("renderiza imagen y título; hace onClick cuando selectionMode=false", () => {
    const onClick = vi.fn();
    renderWithTheme(
      <PropertyCard property={baseProp as any} onClick={onClick} />
    );

    expect(
      screen.getByRole("img", { name: /casa con patio/i })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText(/casa con patio/i));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("selectionMode=true: no dispara onClick y checkbox llama toggleSelection", () => {
    const onClick = vi.fn();
    const toggleSelection = vi.fn();
    const isSelected = vi.fn().mockReturnValue(true);

    renderWithTheme(
      <PropertyCard
        property={baseProp as any}
        selectionMode
        isSelected={isSelected}
        toggleSelection={toggleSelection}
        onClick={onClick}
      />
    );

    fireEvent.click(screen.getByText(/casa con patio/i));
    expect(onClick).not.toHaveBeenCalled();

    const cb = screen.getByRole("checkbox");
    expect(cb).toBeChecked();
    fireEvent.click(cb);
    expect(toggleSelection).toHaveBeenCalledWith(baseProp.id);
  });

  it("usa URL.createObjectURL cuando mainImage es File", () => {
    const fileProp = { ...baseProp, mainImage: new File(["x"], "f.png") } as any;
    renderWithTheme(<PropertyCard property={fileProp} />);

    const img = screen.getByRole("img", { name: /casa con patio/i }) as HTMLImageElement;
    expect((URL as any).createObjectURL).toHaveBeenCalledTimes(1);
    expect(img.src).toContain("blob:mock-url");
  });

  it("muestra badge DESTACADA si outstanding=true", () => {
    renderWithTheme(
      <PropertyCard property={{ ...baseProp, outstanding: true } as any} />
    );
    expect(screen.getByText(/DESTACADA/i)).toBeInTheDocument();
  });

  it("chip NUEVA aparece si la fecha es reciente y NO si es vieja", () => {
    const { unmount } = renderWithTheme(
      <PropertyCard property={{ ...baseProp, date: new Date().toISOString() } as any} />
    );
    expect(screen.getByText(/NUEVA/i)).toBeInTheDocument();
    unmount();

    const oldDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    renderWithTheme(
      <PropertyCard property={{ ...baseProp, date: oldDate } as any} />
    );
    expect(screen.queryByText(/NUEVA/i)).toBeNull();
  });

  it("chip de estado: 'DISPONIBLE - VENTA' y 'Sin Estado' cuando no hay status", () => {
    const { unmount } = renderWithTheme(
      <PropertyCard property={{ ...baseProp, status: "DISPONIBLE", operation: "VENTA" } as any} />
    );
    expect(screen.getByText(/DISPONIBLE - VENTA/i)).toBeInTheDocument();
    unmount();

    renderWithTheme(
      <PropertyCard property={{ ...baseProp, status: "", operation: "" } as any} />
    );
    expect(screen.getByText(/Sin Estado/i)).toBeInTheDocument();
  });

  it("showPrice=true: muestra Precio y Expensas; con expensas 0 muestra 'No'", () => {
    const { unmount } = renderWithTheme(
      <PropertyCard property={{ ...baseProp, showPrice: true, expenses: 5000 } as any} />
    );
    expect(screen.getByText(/Precio/i)).toBeInTheDocument();
    expect(screen.getByText(/Expensas/i)).toBeInTheDocument();
    expect(screen.getByText(/ARS \$123456/)).toBeInTheDocument();
    expect(screen.getByText(/ARS \$5000/)).toBeInTheDocument();
    unmount();

    renderWithTheme(
      <PropertyCard property={{ ...baseProp, showPrice: true, expenses: 0 } as any} />
    );
    expect(screen.getByText(/^No$/)).toBeInTheDocument();
  });

  it("showPrice=false: muestra 'Consultar'", () => {
    renderWithTheme(
      <PropertyCard property={{ ...baseProp, showPrice: false } as any} />
    );
    expect(screen.getByText(/Precio - Expensas/i)).toBeInTheDocument();
    expect(screen.getByText(/Consultar/i)).toBeInTheDocument();
  });

  it("FavoriteButton visible si no es admin y oculto si es admin", () => {
    (useAuthContext as any).mockReturnValueOnce({ isAdmin: false });
    const { unmount } = renderWithTheme(<PropertyCard property={baseProp as any} />);
    expect(screen.getByTestId("fav-btn")).toHaveTextContent(`fav-${baseProp.id}`);
    unmount();

    (useAuthContext as any).mockReturnValueOnce({ isAdmin: true });
    renderWithTheme(<PropertyCard property={baseProp as any} />);
    expect(screen.queryByTestId("fav-btn")).toBeNull();
  });
});
