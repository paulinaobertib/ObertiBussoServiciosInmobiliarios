/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, Mock } from "vitest";
import { InquiriesFilter } from "../../../components/inquiries/InquiriesFilter";

// Mock de useMediaQuery para controlar mobile/desktop
vi.mock("@mui/material", async () => {
  const actual = (await vi.importActual("@mui/material")) as any;
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});

import { useMediaQuery } from "@mui/material";

describe("<InquiriesFilter />", () => {
  const statusOptions = ["ABIERTA", "CERRADA"];
  const propertyOptions = [
    { id: 1, title: "Propiedad 1" },
    { id: 2, title: "Propiedad 2" },
  ];

  let onStatusChange: any;
  let onTypeChange: any;
  let onPropertyChange: any;

  beforeEach(() => {
    onStatusChange = vi.fn();
    onTypeChange = vi.fn();
    onPropertyChange = vi.fn();
    (useMediaQuery as unknown as Mock).mockReturnValue(false); // desktop
  });

  const renderSUT = () =>
    render(
      <InquiriesFilter
        statusOptions={statusOptions}
        propertyOptions={propertyOptions}
        selectedStatus=""
        selectedProperty={""}
        selectedType=""
        onStatusChange={onStatusChange}
        onTypeChange={onTypeChange}
        onPropertyChange={onPropertyChange}
      />
    );

  it("cambia estado, tipo y propiedad en desktop", async () => {
    renderSUT();

    // Estado (ToggleButton)
    fireEvent.click(screen.getByRole("button", { name: "Abierta" }));
    expect(onStatusChange).toHaveBeenCalledWith("ABIERTA");

    fireEvent.click(screen.getByRole("button", { name: "Cerrada" }));
    expect(onStatusChange).toHaveBeenCalledWith("CERRADA");

    // Tipo
    fireEvent.click(screen.getByRole("button", { name: "Consultas" }));
    expect(onTypeChange).toHaveBeenCalledWith("CONSULTAS");

    fireEvent.click(screen.getByRole("button", { name: "Chat" }));
    expect(onTypeChange).toHaveBeenCalledWith("CHAT");

    // Autocomplete propiedad
    const input = screen.getByPlaceholderText("Buscar propiedad…") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Propiedad 2" } });

    // Esperamos que la opción aparezca en el DOM
    const option = await screen.findByText("Propiedad 2");
    fireEvent.click(option);

    await waitFor(() => {
      expect(onPropertyChange).toHaveBeenCalledWith(2);
    });
  });

  it("cambia estado y tipo en mobile (Selects)", () => {
    (useMediaQuery as unknown as Mock).mockReturnValue(true); // mobile
    renderSUT();

    // Estado (Select)
    fireEvent.mouseDown(screen.getByLabelText("Estado"));
    fireEvent.click(screen.getByRole("option", { name: "Abiertas" }));
    expect(onStatusChange).toHaveBeenCalledWith("ABIERTA");

    // Tipo (Select)
    fireEvent.mouseDown(screen.getByLabelText("Tipo"));
    fireEvent.click(screen.getByRole("option", { name: "Chat" }));
    expect(onTypeChange).toHaveBeenCalledWith("CHAT");
  });
});
