/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { IncreaseIndexForm } from "../../../components/increases/IncreaseIndexForm";

/* ========== Mocks ========== */
const showAlertSpy = vi.fn();

vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => ({ showAlert: showAlertSpy }),
}));

vi.mock("../../../services/increaseIndex.service", () => ({
  postIncreaseIndex: vi.fn(),
  putIncreaseIndex: vi.fn(),
  deleteIncreaseIndex: vi.fn(),
}));

import {
  postIncreaseIndex,
  putIncreaseIndex,
  deleteIncreaseIndex,
} from "../../../services/increaseIndex.service";

/* ========== Helpers ========== */
const getFields = () => {
  const codigo = screen.getByLabelText("Código") as HTMLInputElement;
  const nombre = screen.getByLabelText("Nombre") as HTMLInputElement;
  const submitBtn = screen.getByRole("button");
  return { codigo, nombre, submitBtn };
};

const typeInto = async (el: HTMLElement, value: string) => {
  const user = userEvent.setup();
  // limpiamos primero para evitar concatenar
  // (si el input viene vacío, clear no rompe)
  // y evitamos user.type("") (causa error de user-event)
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

    // si completamos correctamente, se habilita
    await typeInto(codigo, "IDX");
    expect(submitBtn).toBeEnabled();
  });

  it("ADD: envía payload sin id, muestra success y llama onDone; maneja loading", async () => {
    const onDone = vi.fn();

    let resolve!: (v?: unknown) => void;
    (postIncreaseIndex as any).mockImplementation(
      () => new Promise((res) => (resolve = res))
    );

    render(<IncreaseIndexForm action="add" onDone={onDone} />);

    const { codigo, nombre, submitBtn } = getFields();

    await typeInto(codigo, "CPI");
    await typeInto(nombre, "Coeficiente de Precios al Inquilino");

    expect(submitBtn).toBeEnabled();

    const user = userEvent.setup();
    await user.click(submitBtn);

    // durante loading
    expect(submitBtn).toBeDisabled();

    // resolvemos la promesa del servicio
    resolve({});
    await waitFor(() => {
      expect(postIncreaseIndex).toHaveBeenCalledWith({
        code: "CPI",
        name: "Coeficiente de Precios al Inquilino",
      });
      expect(showAlertSpy).toHaveBeenCalledWith("Índice creado", "success");
      expect(onDone).toHaveBeenCalledWith({
        action: "add",
        form: { id: 0, code: "CPI", name: "Coeficiente de Precios al Inquilino" },
      });
    });

    // vuelve a estar habilitado
    expect(submitBtn).toBeEnabled();
  });

  it("EDIT: trimmea campos, envía payload con id y muestra success", async () => {
    const onDone = vi.fn();
    let resolve!: (v?: unknown) => void;
    (putIncreaseIndex as any).mockImplementation(
      () => new Promise((res) => (resolve = res))
    );

    render(
      <IncreaseIndexForm
        action="edit"
        item={{ id: 9, code: "OLD", name: "Viejo nombre" }}
        onDone={onDone}
      />
    );

    const { codigo, nombre, submitBtn } = getFields();

    // Sobrescribimos con espacios para validar trim()
    await typeInto(codigo, "  NEW-CODE  ");
    await typeInto(nombre, "  Nuevo Nombre  ");

    expect(submitBtn).toBeEnabled();

    const user = userEvent.setup();
    await user.click(submitBtn);

    resolve({});
    await waitFor(() => {
      expect(putIncreaseIndex).toHaveBeenCalledWith({
        id: 9,
        code: "NEW-CODE",
        name: "Nuevo Nombre",
      });
      expect(showAlertSpy).toHaveBeenCalledWith("Índice actualizado", "success");
      expect(onDone).toHaveBeenCalledWith({
        action: "edit",
        form: { id: 9, code: "NEW-CODE", name: "Nuevo Nombre" },
      });
    });
  });

  it("DELETE: deshabilita inputs, botón dice 'Eliminar', llama deleteIncreaseIndex y onDone", async () => {
    const onDone = vi.fn();
    let resolve!: (v?: unknown) => void;
    (deleteIncreaseIndex as any).mockImplementation(
      () => new Promise((res) => (resolve = res))
    );

    render(
      <IncreaseIndexForm
        action="delete"
        item={{ id: 3, code: "DEL", name: "A borrar" }}
        onDone={onDone}
      />
    );

    const { codigo, nombre, submitBtn } = getFields();

    // En delete, los inputs están deshabilitados y el botón no está invalid
    expect(codigo).toBeDisabled();
    expect(nombre).toBeDisabled();
    expect(submitBtn).toHaveTextContent("Eliminar");
    expect(submitBtn).toBeEnabled();

    const user = userEvent.setup();
    await user.click(submitBtn);

    resolve({});
    await waitFor(() => {
      expect(deleteIncreaseIndex).toHaveBeenCalledWith(3);
      expect(showAlertSpy).toHaveBeenCalledWith("Índice eliminado", "success");
      expect(onDone).toHaveBeenCalledWith({
        action: "delete",
        form: { id: 3, code: "DEL", name: "A borrar" },
      });
    });
  });

  it("maneja error del servicio y muestra alerta de error (sin llamar onDone)", async () => {
    const onDone = vi.fn();
    (postIncreaseIndex as any).mockRejectedValueOnce(new Error("boom"));

    render(<IncreaseIndexForm action="add" onDone={onDone} />);

    const { codigo, nombre, submitBtn } = getFields();

    await typeInto(codigo, "ERR");
    await typeInto(nombre, "Provocar error");

    const user = userEvent.setup();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(postIncreaseIndex).toHaveBeenCalledTimes(1);
      expect(showAlertSpy).toHaveBeenCalledWith("boom", "error");
      expect(onDone).not.toHaveBeenCalled();
    });

    // el botón vuelve a habilitarse tras el catch/finally
    expect(submitBtn).toBeEnabled();
  });
});
