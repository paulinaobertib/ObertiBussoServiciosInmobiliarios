/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import IncreaseIndexForm from "../../../components/increases/IncreaseIndexForm";

/* ========== Mocks ========== */
const showAlertSpy = vi.fn();
vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => ({ showAlert: showAlertSpy }),
}));

// mock del hook useIncreaseIndexes
const createMock = vi.fn();
const updateMock = vi.fn();
const removeMock = vi.fn();
vi.mock("../../../hooks/useIncreaseIndexes", () => ({
  useIncreaseIndexes: () => ({
    create: createMock,
    update: updateMock,
    remove: removeMock,
  }),
}));

/* ========== Helpers ========== */
const getFields = () => {
  const codigo = screen.getByLabelText("Código") as HTMLInputElement;
  const nombre = screen.getByLabelText("Nombre") as HTMLInputElement;
  const submitBtn = screen.getByRole("button", { name: /Confirmar|Guardar|Eliminar/i });
  return { codigo, nombre, submitBtn };
};

const typeInto = async (el: HTMLElement, value: string) => {
  const user = userEvent.setup();
  await user.clear(el);
  if (value !== "") {
    await user.type(el, value);
  }
};

/* ========== Tests ========== */
describe("IncreaseIndexForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deshabilita el botón cuando el formulario es inválido (espacios en blanco)", async () => {
    const onDone = vi.fn();
    render(<IncreaseIndexForm action="add" onDone={onDone} />);

    const { codigo, nombre, submitBtn } = getFields();
    await typeInto(codigo, "   ");
    await typeInto(nombre, "ABC");

    expect(submitBtn).toHaveTextContent("Confirmar");
    expect(submitBtn).toBeDisabled();

    await typeInto(codigo, "IDX");
    expect(submitBtn).toBeEnabled();
  });

  it("ADD: envía payload sin id y llama onDone", async () => {
    const onDone = vi.fn();
    createMock.mockResolvedValue({ id: 1, code: "CPI", name: "Coeficiente de Precios al Inquilino" });

    render(<IncreaseIndexForm action="add" onDone={onDone} />);
    const { codigo, nombre, submitBtn } = getFields();

    await typeInto(codigo, "CPI");
    await typeInto(nombre, "Coeficiente de Precios al Inquilino");

    expect(submitBtn).toBeEnabled();
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledWith({
        code: "CPI",
        name: "Coeficiente de Precios al Inquilino",
      });
      expect(onDone).toHaveBeenCalledWith({
        action: "add",
        form: { code: "CPI", name: "Coeficiente de Precios al Inquilino" },
        saved: { id: 1, code: "CPI", name: "Coeficiente de Precios al Inquilino" },
      });
    });
  });

  it("DELETE: deshabilita inputs, botón dice 'Eliminar', llama remove y onDone", async () => {
    const onDone = vi.fn();
    removeMock.mockResolvedValue(true);

    render(
      <IncreaseIndexForm
        action="delete"
        item={{ id: 3, code: "DEL", name: "A borrar" }}
        onDone={onDone}
      />
    );

    const { codigo, nombre, submitBtn } = getFields();
    expect(codigo).toBeDisabled();
    expect(nombre).toBeDisabled();
    expect(submitBtn).toHaveTextContent("Eliminar");
    expect(submitBtn).toBeEnabled();

    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(removeMock).toHaveBeenCalledWith(3);
      expect(onDone).toHaveBeenCalledWith({
        action: "delete",
        form: { code: "DEL", name: "A borrar" },
      });
    });
  });

it("EDIT: trimmea campos, envía payload con id y muestra success", async () => {
  const onDone = vi.fn();
  updateMock.mockResolvedValue(true);

  render(
    <IncreaseIndexForm
      action="edit"
      item={{ id: 9, code: "OLD", name: "Viejo nombre" }}
      onDone={onDone}
    />
  );

  const { codigo, nombre, submitBtn } = getFields();
  await typeInto(codigo, "  NEW-CODE  ");
  await typeInto(nombre, "  Nuevo Nombre  ");

  expect(submitBtn).toBeEnabled();
  await userEvent.click(submitBtn);

  await waitFor(() => {
    // el hook recibe campos trimmeados
    expect(updateMock).toHaveBeenCalledWith({
      id: 9,
      code: "NEW-CODE",
      name: "Nuevo Nombre",
    });

    // onDone recibe el form sin trim, igual que el estado interno
    expect(onDone).toHaveBeenCalledWith({
      action: "edit",
      form: { code: "  NEW-CODE  ", name: "  Nuevo Nombre  " },
      saved: { id: 9, code: "  NEW-CODE  ", name: "  Nuevo Nombre  " },
    });
  });
});

});
