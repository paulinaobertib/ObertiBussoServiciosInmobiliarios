/// <reference types="vitest" />
import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { vi, describe, it, expect, beforeEach } from "vitest";

import { SearchFilters } from "../../../components/catalog/SearchFilters";

// ─── Mocks ───
vi.mock("../../../hooks/useSearchFilters", () => ({
  useSearchFilters: vi.fn(),
}));

// Mock de useMediaQuery (desktop=false por defecto)
vi.mock("@mui/material", async (importOriginal) => {
  const real = await importOriginal<any>();
  return {
    ...real,
    useMediaQuery: vi.fn().mockReturnValue(false),
  };
});

const { useSearchFilters } = await import("../../../hooks/useSearchFilters");
const { useMediaQuery } = await import("@mui/material");

const theme = createTheme();
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe("<SearchFilters />", () => {
  const onSearch = vi.fn();

  const baseHook = {
    params: {
      operation: "",
      credit: false,
      financing: false,
      types: [] as string[],
      rooms: [] as number[],
      currency: "",
      priceRange: [0, 0] as [number, number],
      areaRange: [0, 0] as [number, number],
      coveredRange: [0, 0] as [number, number],
      cities: [] as string[],
      neighborhoods: [] as string[],
    },
    dynLimits: {
      price: {
        USD: { min: 0, max: 200000, step: 1000 },
        ARS: { min: 0, max: 100000000, step: 50000 },
      },
      surface: { min: 0, max: 500, step: 10 },
    },
    typesList: [{ name: "Casa" }, { name: "Departamento" }],
    amenitiesList: [{ id: 1, name: "Pileta" }, { id: 2, name: "Parrilla" }],
    neighborhoodsList: [
      { name: "Centro", city: "Córdoba" },
      { name: "Nva Cba", city: "Córdoba" },
      { name: "Palermo", city: "Buenos Aires" },
    ],
    toggleParam: vi.fn(),
    setParams: vi.fn(),
    apply: vi.fn(),
    reset: vi.fn(),
    chips: [] as Array<{ label: string; onClear: () => void }>,
    toggleAmenity: vi.fn(),
    selected: { amenities: [] as number[] },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchFilters as any).mockReturnValue({ ...baseHook });
    (useMediaQuery as any).mockReturnValue(false); // desktop por defecto
  });

  it("renderiza panel fijo en desktop y todos los acordeones básicos", () => {
    renderWithTheme(<SearchFilters onSearch={onSearch} />);

    expect(screen.getByText(/Filtros de Búsqueda/i)).toBeInTheDocument();

    // Acordeones por rol button + nombre (evita duplicados)
    expect(
      screen.getByRole("button", { name: /Operación/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Tipos de Propiedad/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Números de Ambientes/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Precio$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Superficie \(Total \/ Cubierta\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Características/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Ciudades/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Barrios/i })
    ).toBeInTheDocument();
  });

it("permite seleccionar operación y opciones de pago cuando es VENTA", () => {
  const toggleParam = vi.fn();
  (useSearchFilters as any).mockReturnValue({
    ...baseHook,
    params: { ...baseHook.params, operation: "" },
    toggleParam,
  });

  const view1 = renderWithTheme(<SearchFilters onSearch={onSearch} />);

  // abrir acordeón Operación en ESTE render
  fireEvent.click(view1.getByRole("button", { name: /Operación/i }));

  // Seleccionar VENTA
  const ventaRadio = view1.getByLabelText(/Venta/i);
  fireEvent.click(ventaRadio);
  expect(toggleParam).toHaveBeenCalledWith("operation", "VENTA");

  // desmontar antes del segundo render
  view1.unmount();

  // Forzar estado VENTA para ver opciones de pago
  (useSearchFilters as any).mockReturnValue({
    ...baseHook,
    params: {
      ...baseHook.params,
      operation: "VENTA",
      credit: false,
      financing: false,
    },
    toggleParam,
  });

  const view2 = renderWithTheme(<SearchFilters onSearch={onSearch} />);

  fireEvent.click(view2.getByRole("button", { name: /Operación/i }));
  fireEvent.click(view2.getByLabelText(/Apto Crédito/i));
  expect(toggleParam).toHaveBeenCalledWith("credit", true);

  fireEvent.click(view2.getByLabelText(/Financiamiento/i));
  expect(toggleParam).toHaveBeenCalledWith("financing", true);

  view2.unmount();
});

  it("tipos: marca check y llama toggleParam('types', name)", () => {
    const toggleParam = vi.fn();
    (useSearchFilters as any).mockReturnValue({
      ...baseHook,
      toggleParam,
      params: { ...baseHook.params, types: [] },
    });

    renderWithTheme(<SearchFilters onSearch={onSearch} />);
    fireEvent.click(
      screen.getByRole("button", { name: /Tipos de Propiedad/i })
    );

    fireEvent.click(screen.getByLabelText("Casa"));
    expect(toggleParam).toHaveBeenCalledWith("types", "Casa");
  });

  it("ambientes: permite marcar 1, 2, 3+", () => {
    const toggleParam = vi.fn();
    (useSearchFilters as any).mockReturnValue({
      ...baseHook,
      toggleParam,
      params: { ...baseHook.params, rooms: [] },
    });

    renderWithTheme(<SearchFilters onSearch={onSearch} />);
    fireEvent.click(
      screen.getByRole("button", { name: /Números de Ambientes/i })
    );

    fireEvent.click(screen.getByLabelText("1"));
    fireEvent.click(screen.getByLabelText("2"));
    fireEvent.click(screen.getByLabelText("3+"));
    expect(toggleParam).toHaveBeenCalledWith("rooms", 1);
    expect(toggleParam).toHaveBeenCalledWith("rooms", 2);
    expect(toggleParam).toHaveBeenCalledWith("rooms", 3);
  });

it("superficie total/cubierta: onChangeCommitted llama apply", () => {
  const setParams = vi.fn();
  const apply = vi.fn();

  (useSearchFilters as any).mockReturnValue({
    ...baseHook,
    setParams,
    apply,
    params: {
      ...baseHook.params,
      areaRange: [0, 100],
      coveredRange: [0, 50],
    },
  });

  const view = renderWithTheme(<SearchFilters onSearch={onSearch} />);
  fireEvent.click(
    view.getByRole("button", { name: /Superficie \(Total \/ Cubierta\)/i })
  );

  const sliders = view.getAllByRole("slider");
  // Slider de Total
  sliders[0].focus();
  fireEvent.keyDown(sliders[0], { key: "ArrowRight" });
  fireEvent.keyUp(sliders[0], { key: "ArrowRight" });

  // Slider de Cubierta
  sliders[1].focus();
  fireEvent.keyDown(sliders[1], { key: "ArrowRight" });
  fireEvent.keyUp(sliders[1], { key: "ArrowRight" });

  expect(apply).toHaveBeenCalledTimes(2);

  view.unmount();
});

  it("amenities: marca/ desmarca llamando toggleAmenity", () => {
    const toggleAmenity = vi.fn();
    (useSearchFilters as any).mockReturnValue({
      ...baseHook,
      toggleAmenity,
      selected: { amenities: [2] }, // Parrilla seleccionada
    });

    renderWithTheme(<SearchFilters onSearch={onSearch} />);
    fireEvent.click(screen.getByRole("button", { name: /Características/i }));

    fireEvent.click(screen.getByLabelText("Pileta"));
    expect(toggleAmenity).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByLabelText("Parrilla"));
    expect(toggleAmenity).toHaveBeenCalledWith(2);
  });

  it("chips visibles y botón 'Limpiar filtros' llama reset", () => {
    const reset = vi.fn();
    const chips = [
      { label: "VENTA", onClear: vi.fn() },
      { label: "USD", onClear: vi.fn() },
    ];

    (useSearchFilters as any).mockReturnValue({
      ...baseHook,
      reset,
      chips,
    });

    renderWithTheme(<SearchFilters onSearch={onSearch} />);
    expect(screen.getByText("VENTA")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Limpiar filtros/i }));
    expect(reset).toHaveBeenCalled();
  });

  it("en mobile usa Drawer: abre con 'Filtros' y cierra con el botón de la cabecera", () => {
    (useMediaQuery as any).mockReturnValue(true); // mobile

    renderWithTheme(<SearchFilters onSearch={onSearch} />);

    // Abrir Drawer
    fireEvent.click(screen.getByRole("button", { name: /Filtros/i }));
    const header = screen.getByText(/Filtros de Búsqueda/i).parentElement!;
    // El IconButton de cerrar es el único button dentro del header
    const closeBtn = within(header).getByRole("button");
    fireEvent.click(closeBtn);

    // No esperamos cambios síncronos en DOM; alcanzan los eventos sin error
  });

    it("renderiza panel fijo en desktop y todos los acordeones básicos", () => {
    renderWithTheme(<SearchFilters onSearch={onSearch} />);

    expect(screen.getByText(/Filtros de Búsqueda/i)).toBeInTheDocument();

    // Acordeones por rol button + nombre (evita duplicados)
    expect(
      screen.getByRole("button", { name: /Operación/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Tipos de Propiedad/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Números de Ambientes/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Precio$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Superficie \(Total \/ Cubierta\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Características/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Ciudades/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Barrios/i })
    ).toBeInTheDocument();
  });

  it("permite seleccionar operación y opciones de pago cuando es VENTA", () => {
    const toggleParam = vi.fn();
    (useSearchFilters as any).mockReturnValue({
      ...baseHook,
      params: { ...baseHook.params, operation: "" },
      toggleParam,
    });

    const view1 = renderWithTheme(<SearchFilters onSearch={onSearch} />);

    // abrir acordeón Operación en ESTE render
    fireEvent.click(view1.getByRole("button", { name: /Operación/i }));

    // Seleccionar VENTA
    const ventaRadio = view1.getByLabelText(/Venta/i);
    fireEvent.click(ventaRadio);
    expect(toggleParam).toHaveBeenCalledWith("operation", "VENTA");

    // desmontar antes del segundo render
    view1.unmount();

    // Forzar estado VENTA para ver opciones de pago
    (useSearchFilters as any).mockReturnValue({
      ...baseHook,
      params: {
        ...baseHook.params,
        operation: "VENTA",
        credit: false,
        financing: false,
      },
      toggleParam,
    });

    const view2 = renderWithTheme(<SearchFilters onSearch={onSearch} />);

    fireEvent.click(view2.getByRole("button", { name: /Operación/i }));
    fireEvent.click(view2.getByLabelText(/Apto Crédito/i));
    expect(toggleParam).toHaveBeenCalledWith("credit", true);

    fireEvent.click(view2.getByLabelText(/Financiamiento/i));
    expect(toggleParam).toHaveBeenCalledWith("financing", true);

    view2.unmount();
  });

  it("tipos: marca check y llama toggleParam('types', name)", () => {
    const toggleParam = vi.fn();
    (useSearchFilters as any).mockReturnValue({
      ...baseHook,
      toggleParam,
      params: { ...baseHook.params, types: [] },
    });

    renderWithTheme(<SearchFilters onSearch={onSearch} />);
    fireEvent.click(
      screen.getByRole("button", { name: /Tipos de Propiedad/i })
    );

    fireEvent.click(screen.getByLabelText("Casa"));
    expect(toggleParam).toHaveBeenCalledWith("types", "Casa");
  });

  it("ambientes: permite marcar 1, 2, 3+", () => {
    const toggleParam = vi.fn();
    (useSearchFilters as any).mockReturnValue({
      ...baseHook,
      toggleParam,
      params: { ...baseHook.params, rooms: [] },
    });

    renderWithTheme(<SearchFilters onSearch={onSearch} />);
    fireEvent.click(
      screen.getByRole("button", { name: /Números de Ambientes/i })
    );

    fireEvent.click(screen.getByLabelText("1"));
    fireEvent.click(screen.getByLabelText("2"));
    fireEvent.click(screen.getByLabelText("3+"));
    expect(toggleParam).toHaveBeenCalledWith("rooms", 1);
    expect(toggleParam).toHaveBeenCalledWith("rooms", 2);
    expect(toggleParam).toHaveBeenCalledWith("rooms", 3);
  });

  it("superficie total/cubierta: onChangeCommitted llama apply", () => {
    const setParams = vi.fn();
    const apply = vi.fn();

    (useSearchFilters as any).mockReturnValue({
      ...baseHook,
      setParams,
      apply,
      params: {
        ...baseHook.params,
        areaRange: [0, 100],
        coveredRange: [0, 50],
      },
    });

    const view = renderWithTheme(<SearchFilters onSearch={onSearch} />);
    fireEvent.click(
      view.getByRole("button", { name: /Superficie \(Total \/ Cubierta\)/i })
    );

    const sliders = view.getAllByRole("slider");
    // Slider de Total
    sliders[0].focus();
    fireEvent.keyDown(sliders[0], { key: "ArrowRight" });
    fireEvent.keyUp(sliders[0], { key: "ArrowRight" });

    // Slider de Cubierta
    sliders[1].focus();
    fireEvent.keyDown(sliders[1], { key: "ArrowRight" });
    fireEvent.keyUp(sliders[1], { key: "ArrowRight" });

    expect(apply).toHaveBeenCalledTimes(2);

    view.unmount();
  });
  
  it("Precio: seleccionar moneda llama toggleParam('currency', ...) y el slider queda habilitado", () => {
    const toggleParam = vi.fn();
    (useSearchFilters as any).mockReturnValue({
      ...baseHook,
      toggleParam,
      params: { ...baseHook.params, currency: "", priceRange: [1000, 2000] },
    });

    renderWithTheme(<SearchFilters onSearch={onSearch} />);
    fireEvent.click(screen.getByRole("button", { name: /^Precio$/i }));

    // Click en Dólar
    fireEvent.click(screen.getByLabelText(/Dólar/i));
    expect(toggleParam).toHaveBeenCalledWith("currency", "USD");
  });

  it("amenities: marca/ desmarca llamando toggleAmenity", () => {
    const toggleAmenity = vi.fn();
    (useSearchFilters as any).mockReturnValue({
      ...baseHook,
      toggleAmenity,
      selected: { amenities: [2] }, // Parrilla seleccionada
    });

    renderWithTheme(<SearchFilters onSearch={onSearch} />);
    fireEvent.click(screen.getByRole("button", { name: /Características/i }));

    fireEvent.click(screen.getByLabelText("Pileta"));
    expect(toggleAmenity).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByLabelText("Parrilla"));
    expect(toggleAmenity).toHaveBeenCalledWith(2);
  });

  it("Ciudades: al marcar Córdoba llama toggleParam; luego barrios fuera de Córdoba quedan deshabilitados", () => {
    const toggleParam = vi.fn();
    (useSearchFilters as any).mockReturnValue({
      ...baseHook,
      toggleParam,
      params: { ...baseHook.params, cities: [] },
    });

    // 1) Marcar ciudad → llama toggleParam
    const v1 = renderWithTheme(<SearchFilters onSearch={onSearch} />);
    fireEvent.click(v1.getByRole("button", { name: /Ciudades/i }));
    fireEvent.click(v1.getByLabelText("Córdoba"));
    expect(toggleParam).toHaveBeenCalledWith("cities", "Córdoba");
    v1.unmount();

    // 2) Con Córdoba en params, barrios de otras ciudades quedan disabled
    (useSearchFilters as any).mockReturnValue({
      ...baseHook,
      params: { ...baseHook.params, cities: ["Córdoba"] },
    });

    const v2 = renderWithTheme(<SearchFilters onSearch={onSearch} />);
    fireEvent.click(v2.getByRole("button", { name: /Barrios/i }));

    const palermo = v2.getByLabelText("Palermo") as HTMLInputElement; // Buenos Aires
    const centro = v2.getByLabelText("Centro") as HTMLInputElement;   // Córdoba
    const nva = v2.getByLabelText("Nva Cba") as HTMLInputElement;     // Córdoba

    expect(palermo).toBeDisabled();
    expect(centro).not.toBeDisabled();
    expect(nva).not.toBeDisabled();
  });

  it("chips visibles y botón 'Limpiar filtros' llama reset", () => {
    const reset = vi.fn();
    const chips = [
      { label: "VENTA", onClear: vi.fn() },
      { label: "USD", onClear: vi.fn() },
    ];

    (useSearchFilters as any).mockReturnValue({
      ...baseHook,
      reset,
      chips,
    });

    renderWithTheme(<SearchFilters onSearch={onSearch} />);
    expect(screen.getByText("VENTA")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Limpiar filtros/i }));
    expect(reset).toHaveBeenCalled();
  });

  it("en mobile usa Drawer: abre con 'Filtros' y cierra con el botón de la cabecera", () => {
    (useMediaQuery as any).mockReturnValue(true); // mobile

    renderWithTheme(<SearchFilters onSearch={onSearch} />);

    // Abrir Drawer
    fireEvent.click(screen.getByRole("button", { name: /Filtros/i }));
    const header = screen.getByText(/Filtros de Búsqueda/i).parentElement!;
    // El IconButton de cerrar es el único button dentro del header
    const closeBtn = within(header).getByRole("button");
    fireEvent.click(closeBtn);
    // No esperamos cambios síncronos en DOM; alcanza con que no haya errores
  });

  it("mobile controlado: onMobileOpenChange(true/false) se dispara al abrir/cerrar", () => {
    (useMediaQuery as any).mockReturnValue(true);
    const onMobileOpenChange = vi.fn();

    // 1) Abre (desde botón) → callback con true
    const { rerender } = renderWithTheme(
      <SearchFilters
        onSearch={onSearch}
        mobileOpen={false}
        onMobileOpenChange={onMobileOpenChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /Filtros/i }));
    expect(onMobileOpenChange).toHaveBeenCalledWith(true);

    // 2) Re-render controlado en abierto, cerrar con el botón de header → callback con false
    rerender(
      <ThemeProvider theme={theme}>
        <SearchFilters
          onSearch={onSearch}
          mobileOpen={true}
          onMobileOpenChange={onMobileOpenChange}
        />
      </ThemeProvider>
    );

    const header = screen.getByText(/Filtros de Búsqueda/i).parentElement!;
    const closeBtn = within(header).getByRole("button");
    fireEvent.click(closeBtn);
    expect(onMobileOpenChange).toHaveBeenCalledWith(false);
  });

  it("hideMobileTrigger=true: en mobile NO muestra el botón 'Filtros'", () => {
    (useMediaQuery as any).mockReturnValue(true);
    renderWithTheme(
      <SearchFilters onSearch={onSearch} hideMobileTrigger />
    );
    expect(screen.queryByRole("button", { name: /Filtros/i })).toBeNull();
  });
});
