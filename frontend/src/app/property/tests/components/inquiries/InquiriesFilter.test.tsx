import { render, screen, fireEvent } from "@testing-library/react";
import { vi, Mock } from "vitest";
import { InquiriesFilter } from "../../../components/inquiries/InquiriesFilter";

vi.mock("@mui/material", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mui/material")>();
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});

import { useMediaQuery } from "@mui/material";

describe("InquiriesFilter", () => {
  const statusOptions = ["Activo", "Pendiente"];
  const propertyOptions = [
    { id: 1, title: "Propiedad A" },
    { id: 2, title: "Propiedad B" },
  ];

  const renderComponent = (props = {}) =>
    render(
      <InquiriesFilter
        statusOptions={statusOptions}
        propertyOptions={propertyOptions}
        selectedStatus=""
        selectedProperty=""
        onStatusChange={vi.fn()}
        onPropertyChange={vi.fn()}
        {...props}
      />
    );

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza ToggleButtonGroup en desktop y permite cambiar estado", () => {
    (useMediaQuery as Mock).mockReturnValue(false);
    const onStatusChange = vi.fn();

    renderComponent({ onStatusChange });

    // Renderiza botones
    expect(screen.getByRole("button", { name: "Todos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Activo" })).toBeInTheDocument();

    // Simular click en un botón
    fireEvent.click(screen.getByRole("button", { name: "Pendiente" }));
    expect(onStatusChange).toHaveBeenCalledWith("Pendiente");
  });

  it("renderiza Select en mobile y permite cambiar estado", () => {
    (useMediaQuery as Mock).mockReturnValue(true);
    const onStatusChange = vi.fn();

    renderComponent({ onStatusChange });

    const select = screen.getByLabelText("Estado");
    fireEvent.mouseDown(select); // abrir el menú
    const option = screen.getByRole("option", { name: "Activo" });
    fireEvent.click(option);

    expect(onStatusChange).toHaveBeenCalledWith("Activo");
  });

  it("renderiza Autocomplete y permite seleccionar propiedad", () => {
    (useMediaQuery as Mock).mockReturnValue(false);
    const onPropertyChange = vi.fn();

    renderComponent({ onPropertyChange });

    const input = screen.getByPlaceholderText("Buscar propiedad…");

    // Escribir texto para filtrar opciones
    fireEvent.change(input, { target: { value: "Propiedad A" } });

    // La opción debería estar en el DOM
    const option = screen.getByText("Propiedad A");
    fireEvent.click(option);

    expect(onPropertyChange).toHaveBeenCalledWith(1);
  });

  it("envía '' cuando se limpia la propiedad en Autocomplete", () => {
    (useMediaQuery as Mock).mockReturnValue(false);
    const onPropertyChange = vi.fn();

    renderComponent({ onPropertyChange, selectedProperty: 1 });

    const input = screen.getByDisplayValue("Propiedad A");
    fireEvent.change(input, { target: { value: "" } });

    // Simular limpieza manual (v=null)
    fireEvent.blur(input);
    expect(onPropertyChange).toHaveBeenCalledWith("");
  });
});
