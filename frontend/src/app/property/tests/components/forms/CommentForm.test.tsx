/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../../hooks/useCategories", () => ({
  useCategories: vi.fn(),
}));

import { CommentForm } from "../../../components/forms/CommentForm";
const { useCategories } = await import("../../../hooks/useCategories");

describe("<CommentForm />", () => {
  const refresh = vi.fn(async () => {});
  const onDone = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ADD: textarea habilitado; 'Confirmar' llama run() y luego resetea con el payload inicial (se usa waitFor)", async () => {
    const setForm = vi.fn();
    const run = vi.fn(async () => {});

    (useCategories as any).mockReturnValue({
      form: { id: 0, propertyId: 7, description: "listo para confirmar", date: "" },
      setForm,
      run,
      loading: false,
    });

    render(
      <CommentForm propertyId={7} action="add" refresh={refresh} onDone={onDone} />
    );

    const input = screen.getByLabelText(/Descripción/i);
    expect(input).toBeEnabled();

    fireEvent.change(input, { target: { value: "Nuevo comentario" } });
    expect(setForm).toHaveBeenCalledWith({
      id: 0,
      propertyId: 7,
      description: "Nuevo comentario",
      date: "",
    });

    const confirm = screen.getByRole("button", { name: /Confirmar/i });
    expect(confirm).toBeEnabled();

    fireEvent.click(confirm);

    await waitFor(() => {
      expect(run).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(setForm).toHaveBeenCalledWith({
        id: 0,
        propertyId: 7,
        description: "",
        date: "",
      });
    });
  });

  it("EDIT: setea el form con el item (mockeado ya con descripción); 'Cancelar' resetea y llama onDone (usar waitFor si hace falta)", async () => {
    const item = {
      id: 123,
      propertyId: 9,
      description: "Texto a editar",
      date: "2024-10-01T12:00:00Z",
    };
    const setForm = vi.fn();
    const run = vi.fn();

    (useCategories as any).mockReturnValue({
      form: {
        id: 123,
        propertyId: 9,
        description: "Texto a editar",
        date: "2024-10-01T12:00:00Z",
      },
      setForm,
      run,
      loading: false,
    });

    render(
      <CommentForm
        propertyId={9}
        action="edit"
        item={item as any}
        refresh={refresh}
        onDone={onDone}
      />
    );

    const cancel = screen.getByRole("button", { name: /Cancelar/i });
    expect(cancel).toBeEnabled();

    fireEvent.click(cancel);

    await waitFor(() => {
      expect(setForm).toHaveBeenCalledWith({
        id: 123,
        propertyId: 9,
        description: "Texto a editar",
        date: "2024-10-01T12:00:00Z",
      });
    });

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("DELETE: textarea deshabilitado y botón 'Eliminar' ejecuta run()", async () => {
    const item = {
      id: 55,
      propertyId: 3,
      description: "Borrar este comentario",
      date: "2024-09-10T08:00:00Z",
    };
    const setForm = vi.fn();
    const run = vi.fn(async () => {});

    (useCategories as any).mockReturnValue({
      form: {
        id: 55,
        propertyId: 3,
        description: "Borrar este comentario",
        date: "2024-09-10T08:00:00Z",
      },
      setForm,
      run,
      loading: false,
    });

    render(
      <CommentForm
        propertyId={3}
        action="delete"
        item={item as any}
        refresh={refresh}
        onDone={onDone}
      />
    );

    expect(screen.getByLabelText(/Descripción/i)).toBeDisabled();
    const delBtn = screen.getByRole("button", { name: /Eliminar/i });
    expect(delBtn).toBeEnabled();

    fireEvent.click(delBtn);

    await waitFor(() => {
      expect(run).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(setForm).toHaveBeenCalledWith({
        id: 55,
        propertyId: 3,
        description: "Borrar este comentario",
        date: "2024-09-10T08:00:00Z",
      });
    });
  });

  it("reglas de disabled para Confirmar y Cancelar", () => {
    const setForm = vi.fn();

    (useCategories as any).mockReturnValueOnce({
      form: { id: 0, propertyId: 1, description: "algo", date: "" },
      setForm,
      run: vi.fn(),
      loading: true,
    });
    const { rerender } = render(
      <CommentForm propertyId={1} action="add" refresh={refresh} onDone={onDone} />
    );
    expect(screen.getByRole("button", { name: /Confirmar/i })).toBeDisabled();

    (useCategories as any).mockReturnValueOnce({
      form: { id: 0, propertyId: 1, description: "", date: "" },
      setForm,
      run: vi.fn(),
      loading: false,
    });
    rerender(
      <CommentForm propertyId={1} action="add" refresh={refresh} onDone={onDone} />
    );
    expect(screen.getByRole("button", { name: /Confirmar/i })).toBeDisabled();

    (useCategories as any).mockReturnValueOnce({
      form: { id: 0, propertyId: 2, description: "x", date: "" },
      setForm,
      run: vi.fn(),
      loading: true,
    });
    rerender(
      <CommentForm propertyId={2} action="edit" refresh={refresh} onDone={onDone} />
    );
    expect(screen.getByRole("button", { name: /Cancelar/i })).toBeDisabled();

    (useCategories as any).mockReturnValueOnce({
      form: { id: 0, propertyId: 2, description: "", date: "" },
      setForm,
      run: vi.fn(),
      loading: false,
    });
    rerender(
      <CommentForm propertyId={2} action="edit" refresh={refresh} onDone={onDone} />
    );
    expect(screen.getByRole("button", { name: /Cancelar/i })).toBeDisabled();
  });

  it("ADD: el useEffect resetea el form al initialPayload cuando no hay item", () => {
    const setForm = vi.fn();
    (useCategories as any).mockReturnValue({
      form: { id: 99, propertyId: 10, description: "otro", date: "x" },
      setForm,
      run: vi.fn(),
      loading: false,
    });

    render(
      <CommentForm propertyId={10} action="add" refresh={refresh} onDone={onDone} />
    );

    expect(setForm).toHaveBeenCalledWith({
      id: 0,
      propertyId: 10,
      description: "",
      date: "",
    });
  });
});
