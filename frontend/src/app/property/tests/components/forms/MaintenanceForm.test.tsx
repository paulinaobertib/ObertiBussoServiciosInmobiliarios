/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// ─── Mocks (deben declararse ANTES del SUT) ───
vi.mock("../../../hooks/useCategories", () => ({
  useCategories: vi.fn(),
}));

// SUT
import { MaintenanceForm } from "../../../components/forms/MaintenanceForm";
const { useCategories } = await import("../../../hooks/useCategories");

describe("<MaintenanceForm />", () => {
  const refresh = vi.fn(async () => {});
  const onDone = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ADD: campos habilitados; permite editar y 'Confirmar' llama run() y resetea al payload inicial", async () => {
    const setForm = vi.fn();
    const run = vi.fn(async () => {});
    // Para que el botón Confirmar no esté deshabilitado por invalid,
    // devolvemos invalid=false y loading=false
    (useCategories as any).mockReturnValue({
      form: { id: 0, propertyId: 7, title: "", description: "", date: "" },
      setForm,
      run,
      loading: false,
      invalid: false,
    });

    render(
      <MaintenanceForm
        propertyId={7}
        action="add"
        refresh={refresh}
        onDone={onDone}
      />
    );

    const title = screen.getByLabelText(/Título/i) as HTMLInputElement;
    const date = screen.getByLabelText(/Fecha/i) as HTMLInputElement;
    const desc = screen.getByLabelText(/Descripción/i) as HTMLTextAreaElement;

    expect(title).toBeEnabled();
    expect(date).toBeEnabled();
    expect(desc).toBeEnabled();

    // tras cambiar título
    fireEvent.change(title, { target: { value: "Cambiar llave" } });
    expect(setForm).toHaveBeenCalledWith(
    expect.objectContaining({ title: "Cambiar llave" })
    );

    // tras cambiar fecha
    fireEvent.change(date, { target: { value: "2025-02-01T10:30" } });
    expect(setForm).toHaveBeenCalledWith(
    expect.objectContaining({ date: "2025-02-01T10:30" })
    );

    // tras cambiar descripción
    fireEvent.change(desc, { target: { value: "Reemplazo de cerradura" } });
    expect(setForm).toHaveBeenCalledWith(
    expect.objectContaining({ description: "Reemplazo de cerradura" })
    );

    const confirm = screen.getByRole("button", { name: /Confirmar/i });
    expect(confirm).toBeEnabled();

    fireEvent.click(confirm);

    await waitFor(() => {
    expect(run).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
    expect(setForm).toHaveBeenLastCalledWith(
        expect.objectContaining({
        id: 0,
        propertyId: 7,
        title: "",
        description: "",
        date: "",
        })
    );
    });

  });

  it("EDIT: setea el form con item (useEffect). 'Cancelar' resetea al initialPayload y llama onDone (isDirty=true habilita el botón)", async () => {
    const item = {
      id: 15,
      propertyId: 9,
      title: "Pintura",
      description: "Pintar el frente",
      date: "2024-11-10T09:00",
    };
    const setForm = vi.fn();
    const run = vi.fn();

    // Para que Cancelar esté habilitado, devolvemos un form distinto al initialPayload
    // (isDirty=true). El useEffect igualmente debe invocar setForm(item...).
    (useCategories as any).mockReturnValue({
      form: {
        id: 15,
        propertyId: 9,
        title: "Pintura (tmp)",
        description: "Pintar el frente",
        date: "2024-11-10T09:00",
      },
      setForm,
      run,
      loading: false,
      invalid: false,
    });

    render(
      <MaintenanceForm
        propertyId={9}
        action="edit"
        item={item as any}
        refresh={refresh}
        onDone={onDone}
      />
    );

    // useEffect debería setear el form con los valores del item/initialPayload
    expect(setForm).toHaveBeenCalledWith({
      id: 15,
      propertyId: 9,
      title: "Pintura",
      description: "Pintar el frente",
      date: "2024-11-10T09:00",
    });

    const cancel = screen.getByRole("button", { name: /Cancelar/i });
    expect(cancel).toBeEnabled();

    fireEvent.click(cancel);

    // Reset a initialPayload (coincide con item en edit)
    await waitFor(() =>
    expect(setForm).toHaveBeenCalledWith(
        expect.objectContaining({
        id: 15,
        propertyId: 9,
        title: "Pintura",
        description: "Pintar el frente",
        date: "2024-11-10T09:00",
        })
    )
    );
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("DELETE: deshabilita campos y el botón 'Eliminar' llama run() y luego resetea al initialPayload", async () => {
    const item = {
      id: 77,
      propertyId: 3,
      title: "Luz",
      description: "Cambiar lámparas",
      date: "2024-12-01T19:30",
    };
    const setForm = vi.fn();
    const run = vi.fn(async () => {});

    (useCategories as any).mockReturnValue({
      form: {
        id: 77,
        propertyId: 3,
        title: "Luz",
        description: "Cambiar lámparas",
        date: "2024-12-01T19:30",
      },
      setForm,
      run,
      loading: false,
      invalid: false,
    });

    render(
      <MaintenanceForm
        propertyId={3}
        action="delete"
        item={item as any}
        refresh={refresh}
        onDone={onDone}
      />
    );

    expect(screen.getByLabelText(/Título/i)).toBeDisabled();
    expect(screen.getByLabelText(/Fecha/i)).toBeDisabled();
    expect(screen.getByLabelText(/Descripción/i)).toBeDisabled();

    const del = screen.getByRole("button", { name: /Eliminar/i });
    expect(del).toBeEnabled();

    fireEvent.click(del);

    await waitFor(() => expect(run).toHaveBeenCalledTimes(1));
    await waitFor(() =>
    expect(setForm).toHaveBeenCalledWith(
        expect.objectContaining({
        id: 77,
        propertyId: 3,
        title: "Luz",
        description: "Cambiar lámparas",
        date: "2024-12-01T19:30",
        })
    )
    );
  });

  it("reglas de disabled: Confirmar se deshabilita por invalid o loading; Cancelar por !isDirty o loading", () => {
    const setForm = vi.fn();

    // Confirmar disabled por invalid=true
    (useCategories as any).mockReturnValueOnce({
      form: { id: 0, propertyId: 1, title: "X", description: "Y", date: "2025-01-01T10:00" },
      setForm,
      run: vi.fn(),
      loading: false,
      invalid: true,
    });
    const { rerender } = render(
      <MaintenanceForm
        propertyId={1}
        action="add"
        refresh={refresh}
        onDone={onDone}
      />
    );
    expect(screen.getByRole("button", { name: /Confirmar/i })).toBeDisabled();

    // Confirmar disabled por loading=true
    (useCategories as any).mockReturnValueOnce({
      form: { id: 0, propertyId: 1, title: "X", description: "Y", date: "2025-01-01T10:00" },
      setForm,
      run: vi.fn(),
      loading: true,
      invalid: false,
    });
    rerender(
      <MaintenanceForm
        propertyId={1}
        action="add"
        refresh={refresh}
        onDone={onDone}
      />
    );
    expect(screen.getByRole("button", { name: /Confirmar/i })).toBeDisabled();

    // Cancelar disabled por !isDirty (form igual a initialPayload); usamos EDIT
    const item = {
      id: 10,
      propertyId: 2,
      title: "AAA",
      description: "BBB",
      date: "2024-10-10T10:10",
    };
    (useCategories as any).mockReturnValueOnce({
      form: { ...item }, // igual al initialPayload -> isDirty=false
      setForm,
      run: vi.fn(),
      loading: false,
      invalid: false,
    });
    rerender(
      <MaintenanceForm
        propertyId={2}
        action="edit"
        item={item as any}
        refresh={refresh}
        onDone={onDone}
      />
    );
    const cancel1 = screen.getByRole("button", { name: /Cancelar/i });
    expect(cancel1).toBeDisabled();

    // Cancelar disabled por loading=true aunque sea dirty
    (useCategories as any).mockReturnValueOnce({
      form: { ...item, title: "Dirty" }, // distinto al initialPayload -> isDirty=true
      setForm,
      run: vi.fn(),
      loading: true,
      invalid: false,
    });
    rerender(
      <MaintenanceForm
        propertyId={2}
        action="edit"
        item={item as any}
        refresh={refresh}
        onDone={onDone}
      />
    );
    const cancel2 = screen.getByRole("button", { name: /Cancelar/i });
    expect(cancel2).toBeDisabled();
  });
});
