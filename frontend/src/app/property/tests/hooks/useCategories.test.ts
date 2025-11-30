import { renderHook, act } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import { useCategories } from "../../hooks/useCategories";
import { useGlobalAlert } from "../../../shared/context/AlertContext";

// ---- Mocks ----
vi.mock("../../../shared/context/AlertContext", () => ({
  useGlobalAlert: vi.fn(),
}));

const handleErrorMock = vi.fn();
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: handleErrorMock }),
}));

// mock de useLoading que ejecuta la callback
vi.mock("../../utils/useLoading", () => ({
  useLoading: (fn: () => Promise<void>) => {
    return {
      loading: false,
      run: vi.fn(fn), // ← importante: ejecuta fn al llamarse
    };
  },
}));

describe("useCategories", () => {
  const showAlert = vi.fn();
  const save = vi.fn();
  const refresh = vi.fn();
  const onDone = vi.fn();
  let alertApi: any;

  beforeEach(() => {
    vi.clearAllMocks();
    alertApi = { showAlert };
    (useGlobalAlert as Mock).mockImplementation(() => alertApi);
    handleErrorMock.mockReset();
  });

  it("ejecuta correctamente la acción 'add' quitando el id", async () => {
    const initial = { id: 1, name: "cat 1" };
    const { result } = renderHook(() => useCategories({ initial, action: "add", save, refresh, onDone }));

    await act(async () => {
      await result.current.run();
    });

    expect(save).toHaveBeenCalledWith({ name: "cat 1" }); // id removido
    expect(refresh).toHaveBeenCalled();
    expect(onDone).toHaveBeenCalled();
    expect(showAlert).toHaveBeenCalledWith("Creado correctamente", "success");
  });

  it("ejecuta correctamente la acción 'edit'", async () => {
    const initial = { id: 1, name: "cat 1" };
    const { result } = renderHook(() => useCategories({ initial, action: "edit", save, refresh, onDone }));

    await act(async () => {
      await result.current.run();
    });

    expect(save).toHaveBeenCalledWith(initial);
    expect(refresh).toHaveBeenCalled();
    expect(onDone).toHaveBeenCalled();
    expect(showAlert).toHaveBeenCalledWith("Cambios guardados", "success");
  });

  it("maneja errores al ejecutar run()", async () => {
    const error = { response: { data: "Error del servidor" } };
    save.mockRejectedValueOnce(error);

    const initial = { id: 1, name: "cat 1" };
    const { result } = renderHook(() => useCategories({ initial, action: "edit", save, refresh, onDone }));

    await act(async () => {
      await result.current.run();
    });

    expect(handleErrorMock).toHaveBeenCalledWith(error);
  });

  it("marca invalid si algún campo string está vacío", () => {
    const initial = { id: 1, name: "" };
    const { result } = renderHook(() => useCategories({ initial, action: "edit", save, refresh, onDone }));

    expect(result.current.invalid).toBe(true);
  });

  it("no marca invalid si la acción es delete", () => {
    const initial = { id: 1, name: "" };
    const { result } = renderHook(() => useCategories({ initial, action: "delete", save, refresh, onDone }));

    expect(result.current.invalid).toBe(false);
  });

  it("cancelá delete si doubleConfirm devuelve false", async () => {
    alertApi = { doubleConfirm: vi.fn().mockResolvedValue(false) };
    const initial = { id: 1, name: "Cat" };
    const { result } = renderHook(() => useCategories({ initial, action: "delete", save, refresh, onDone }));

    await act(async () => {
      await result.current.run();
    });

    expect(alertApi.doubleConfirm).toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("delete confirmado: refresca, ejecuta onDone y usa success", async () => {
    const success = vi.fn();
    alertApi = {
      doubleConfirm: vi.fn().mockResolvedValue(true),
      success,
    };
    const message = "Eliminado";
    save.mockResolvedValueOnce(message);

    const initial = { id: 5, name: "X" };
    const { result } = renderHook(() => useCategories({ initial, action: "delete", save, refresh, onDone }));

    await act(async () => {
      await result.current.run();
    });

    expect(save).toHaveBeenCalledWith(initial);
    expect(refresh).toHaveBeenCalled();
    expect(onDone).toHaveBeenCalled();
    expect(success).toHaveBeenCalledWith({
      title: "Eliminado correctamente",
      description: message,
      primaryLabel: "Volver",
    });
  });

  it("si refresh lanza error igualmente notifica mediante handleError", async () => {
    refresh.mockRejectedValueOnce(new Error("refresh fail"));

    const initial = { id: 7, name: "Cat" };
    const { result } = renderHook(() => useCategories({ initial, action: "edit", save, refresh, onDone }));

    await act(async () => {
      await result.current.run();
    });

    expect(handleErrorMock).toHaveBeenCalledWith(expect.any(Error));
  });
});
