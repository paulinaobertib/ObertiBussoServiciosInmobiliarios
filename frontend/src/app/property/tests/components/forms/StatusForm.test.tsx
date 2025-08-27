/// <reference types="vitest" />
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";

const putPropertyStatusMock = vi.fn();
const loadPropertyMock = vi.fn();
const showAlertMock = vi.fn();

vi.mock("../../../services/property.service", () => ({
  putPropertyStatus: (...args: any[]) => putPropertyStatusMock(...args),
}));
vi.mock("../../../context/PropertiesContext", () => ({
  usePropertiesContext: vi.fn(() => ({ loadProperty: loadPropertyMock })),
}));
vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: vi.fn(() => ({ showAlert: showAlertMock })),
}));
vi.mock("../../../utils/useLoading", () => ({
  // devolvemos run como wrapper del fn para mantener async
  useLoading: vi.fn((fn: () => Promise<void>) => ({
    loading: false,
    run: fn,
  })),
}));

import { StatusForm } from "../../../components/forms/StatusForm";
const useLoadingModule = await import("../../../utils/useLoading");

describe("<StatusForm />", () => {
  const baseItem = { id: 77, status: "DISPONIBLE" };
  const onDone = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const openSelectByLabel = () => {
    // Algunos temas de MUI crean más de un elemento asociado al label.
    // Tomamos el PRIMERO con aria-label "Estado".
    const [button] = screen.getAllByLabelText(/Estado/i);
    fireEvent.mouseDown(button);
    return { button, listbox: screen.getByRole("listbox") };
  };

  it("renderiza el Select con el estado inicial y el botón 'Guardar' deshabilitado si no hay cambios", () => {
    render(<StatusForm item={baseItem} onDone={onDone} />);

    const [selectButton] = screen.getAllByLabelText(/Estado/i);
    expect(selectButton).toHaveTextContent(/DISPONIBLE/i);

    const save = screen.getByRole("button", { name: /Guardar/i });
    expect(save).toBeDisabled();
  });

  it("al cambiar el estado, habilita 'Guardar' y en éxito llama servicio, alerta, recarga y onDone", async () => {
    putPropertyStatusMock.mockResolvedValueOnce(undefined);

    render(<StatusForm item={baseItem} onDone={onDone} />);

    const { button, listbox } = openSelectByLabel();
    const option = within(listbox).getByRole("option", { name: /RESERVADA/i });
    fireEvent.click(option);

    expect(button).toHaveTextContent(/RESERVADA/i);

    const save = screen.getByRole("button", { name: /Guardar/i });
    expect(save).toBeEnabled();
    fireEvent.click(save);

    await waitFor(() =>
      expect(putPropertyStatusMock).toHaveBeenCalledWith(77, "RESERVADA")
    );
    await waitFor(() =>
      expect(showAlertMock).toHaveBeenCalledWith(
        "Estado actualizado con éxito",
        "success"
      )
    );
    await waitFor(() => expect(loadPropertyMock).toHaveBeenCalledWith(77));
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
  });

  it("en error muestra alerta de error y NO llama onDone ni recarga", async () => {
    putPropertyStatusMock.mockRejectedValueOnce({
      response: { data: "Fallo al actualizar" },
    });

    render(<StatusForm item={baseItem} onDone={onDone} />);

    const { listbox } = openSelectByLabel();
    const optVendida = within(listbox).getByRole("option", { name: /VENDIDA/i });
    fireEvent.click(optVendida);

    const save = screen.getByRole("button", { name: /Guardar/i });
    fireEvent.click(save);

    await waitFor(() =>
      expect(putPropertyStatusMock).toHaveBeenCalledWith(77, "VENDIDA")
    );
    await waitFor(() =>
      expect(showAlertMock).toHaveBeenCalledWith("Fallo al actualizar", "error")
    );
    expect(loadPropertyMock).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });

  it("cuando loading=true, muestra estado de carga y deshabilita 'Guardar'", () => {
    (useLoadingModule.useLoading as unknown as Mock).mockImplementationOnce(
      (_fn: any) => ({
        loading: true,
        run: vi.fn(),
      })
    );

    render(<StatusForm item={baseItem} onDone={onDone} />);

    const save = screen.getByRole("button", { name: /Guardar/i });
    expect(save).toBeDisabled();
  });

  it("permite seleccionar todas las opciones válidas del dropdown", () => {
    render(<StatusForm item={baseItem} onDone={onDone} />);

    let { button, listbox } = openSelectByLabel();
    ["DISPONIBLE", "RESERVADA", "ALQUILADA", "VENDIDA"].forEach((label) => {
      expect(
        within(listbox).getByRole("option", { name: new RegExp(label, "i") })
      ).toBeInTheDocument();
    });

    // Seleccionar una, volver a abrir y seleccionar otra
    fireEvent.click(within(listbox).getByRole("option", { name: /ALQUILADA/i }));
    expect(button).toHaveTextContent(/ALQUILADA/i);

    ({ button, listbox } = openSelectByLabel());
    fireEvent.click(within(listbox).getByRole("option", { name: /VENDIDA/i }));
    expect(button).toHaveTextContent(/VENDIDA/i);
  });
});
