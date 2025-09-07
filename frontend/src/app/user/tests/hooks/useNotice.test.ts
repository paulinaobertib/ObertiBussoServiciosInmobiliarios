import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedFunction } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useNotices } from "../../hooks/useNotices";
import type { Notice, NoticeCreate } from "../../types/notice";

/* --------- Mocks de servicios --------- */
vi.mock("../../services/notice.service", () => ({
  getAllNotices: vi.fn(),
  searchNoticesByText: vi.fn(),
  createNotice: vi.fn(),
  updateNotice: vi.fn(),
  deleteNotice: vi.fn(),
}));

/* --------- Mock de AuthContext --------- */
vi.mock("../../../user/context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

/* --------- Mock de useApiErrors para controlar el string de error --------- */
const handleErrorMock = vi.fn((e: any) =>
  e instanceof Error ? e.message : String(e)
);
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: handleErrorMock }),
}));

/* --------- Imports reales (ya mockeados arriba) --------- */
import * as service from "../../services/notice.service";
import { useAuthContext as _useAuthContext } from "../../../user/context/AuthContext";

const getAllNotices = service.getAllNotices as MockedFunction<
  typeof service.getAllNotices
>;
const searchNoticesByText = service.searchNoticesByText as MockedFunction<
  typeof service.searchNoticesByText
>;
const createNotice = service.createNotice as MockedFunction<
  typeof service.createNotice
>;
const updateNotice = service.updateNotice as MockedFunction<
  typeof service.updateNotice
>;
const deleteNotice = service.deleteNotice as MockedFunction<
  typeof service.deleteNotice
>;
const useAuthContext = _useAuthContext as MockedFunction<typeof _useAuthContext>;

/* --------- Datos base --------- */
const n1: Notice = { id: 1, title: "A", description: "aa", userId: 10 } as any;
const n2: Notice = { id: 2, title: "B", description: "bb", userId: 10 } as any;
const n3: Notice = { id: 3, title: "C", description: "cc", userId: 99 } as any;

describe("useNotices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handleErrorMock.mockClear();
    // Contexto por defecto con user id=10
    useAuthContext.mockReturnValue({ info: { id: 10 } } as any);
  });

  it("carga inicial (fetchAll en mount) setea notices y apaga loading", async () => {
    getAllNotices.mockResolvedValueOnce([n1, n2]);

    const { result } = renderHook(() => useNotices());

    // Arranca en loading=true
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getAllNotices).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
    expect(result.current.notices).toEqual([n1, n2]);
  });

  it("carga inicial: si getAllNotices falla -> setea error (handleError) y deja []", async () => {
    getAllNotices.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useNotices());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(handleErrorMock).toHaveBeenCalled();
    expect(result.current.error).toBe("boom");
    expect(result.current.notices).toEqual([]);
  });

  it("fetchAll (llamado manualmente) devuelve lista, limpia error y hace toggle de loading", async () => {
    // mount vacío
    getAllNotices.mockResolvedValueOnce([]);
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // segunda llamada manual a fetchAll
    getAllNotices.mockResolvedValueOnce([n1]);
    await act(async () => {
      const list = await result.current.fetchAll();
      expect(list).toEqual([n1]);
    });
    expect(result.current.notices).toEqual([n1]);
    expect(result.current.error).toBeNull();
  });

  it("search: éxito actualiza notices, devuelve lista y limpia error", async () => {
    // mount
    getAllNotices.mockResolvedValueOnce([]);
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    searchNoticesByText.mockResolvedValueOnce([n3]);

    await act(async () => {
      const list = await result.current.search("c");
      expect(list).toEqual([n3]);
    });

    expect(searchNoticesByText).toHaveBeenCalledWith("c");
    expect(result.current.notices).toEqual([n3]);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("search: error setea error (handleError) y devuelve []", async () => {
    getAllNotices.mockResolvedValueOnce([]);
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    searchNoticesByText.mockRejectedValueOnce(new Error("nope"));

    await act(async () => {
      const list = await result.current.search("x");
      expect(list).toEqual([]);
    });

    expect(handleErrorMock).toHaveBeenCalled();
    expect(result.current.error).toBe("nope");
    expect(result.current.loading).toBe(false);
  });

  it("add: usa info.id, llama createNotice y luego recarga con fetchAll", async () => {
    // mount
    getAllNotices.mockResolvedValueOnce([n1]);
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // tras crear, el nuevo fetchAll trae [n1, n2]
    getAllNotices.mockResolvedValueOnce([n1, n2]);
    createNotice.mockResolvedValueOnce(undefined as any);

    const body: NoticeCreate = { title: "B", description: "bb" } as any;

    await act(async () => {
      await result.current.add(body);
    });

    expect(createNotice).toHaveBeenCalledWith({ ...body, userId: 10 });
    expect(getAllNotices).toHaveBeenCalledTimes(2);
    expect(result.current.notices).toEqual([n1, n2]);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("add: sin info.id -> setea error por handleError y no llama al servicio", async () => {
    useAuthContext.mockReturnValue({ info: null } as any);
    getAllNotices.mockResolvedValueOnce([]);
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const body: NoticeCreate = { title: "X", description: "xx" } as any;
    await act(async () => {
      await result.current.add(body);
    });

    expect(createNotice).not.toHaveBeenCalled();
    expect(handleErrorMock).toHaveBeenCalled();
    // loading no entra al try (queda false)
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("No se encontró el usuario autenticado.");
  });

  it("add: error en createNotice -> setea error vía handleError y no cambia la lista", async () => {
    getAllNotices.mockResolvedValueOnce([n1]);
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    createNotice.mockRejectedValueOnce(new Error("falló create"));

    await act(async () => {
      await result.current.add({ title: "B", description: "bb" } as any);
    });

    expect(handleErrorMock).toHaveBeenCalled();
    expect(result.current.error).toBe("falló create");
    expect(result.current.notices).toEqual([n1]);
    expect(result.current.loading).toBe(false);
  });

  it("edit: usa info.id, llama updateNotice y recarga", async () => {
    getAllNotices.mockResolvedValueOnce([n1, n2]);
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updatedN2 = { ...n2, title: "B2" } as Notice;
    getAllNotices.mockResolvedValueOnce([n1, updatedN2]);
    updateNotice.mockResolvedValueOnce(undefined as any);

    await act(async () => {
      await result.current.edit({ ...n2, title: "B2" });
    });

    expect(updateNotice).toHaveBeenCalledWith({ ...n2, title: "B2", userId: 10 });
    expect(getAllNotices).toHaveBeenCalledTimes(2);
    expect(result.current.notices).toEqual([n1, updatedN2]);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("edit: sin info.id -> error por handleError y no llama al servicio", async () => {
    useAuthContext.mockReturnValue({ info: null } as any);
    getAllNotices.mockResolvedValueOnce([n1]);
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.edit(n1);
    });

    expect(updateNotice).not.toHaveBeenCalled();
    expect(handleErrorMock).toHaveBeenCalled();
    expect(result.current.error).toBe("No se encontró el usuario autenticado.");
  });

  it("edit: error en updateNotice -> setea error y conserva lista", async () => {
    getAllNotices.mockResolvedValueOnce([n1, n2]);
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    updateNotice.mockRejectedValueOnce(new Error("falló update"));
    await act(async () => {
      await result.current.edit({ ...n2, title: "B2" });
    });

    expect(handleErrorMock).toHaveBeenCalled();
    expect(result.current.error).toBe("falló update");
    expect(result.current.notices).toEqual([n1, n2]);
  });

  it("remove: llama deleteNotice y recarga", async () => {
    getAllNotices.mockResolvedValueOnce([n1, n2]);
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    getAllNotices.mockResolvedValueOnce([n1]); // tras borrar, queda n1
    deleteNotice.mockResolvedValueOnce(undefined as any);

    await act(async () => {
      await result.current.remove(2);
    });

    expect(deleteNotice).toHaveBeenCalledWith(2);
    expect(getAllNotices).toHaveBeenCalledTimes(2);
    expect(result.current.notices).toEqual([n1]);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("remove: error en deleteNotice -> setea error y no recarga", async () => {
    getAllNotices.mockResolvedValueOnce([n1, n2]);
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    deleteNotice.mockRejectedValueOnce(new Error("falló delete"));

    await act(async () => {
      await result.current.remove(2);
    });

    expect(handleErrorMock).toHaveBeenCalled();
    expect(result.current.error).toBe("falló delete");
    // lista se mantiene igual
    expect(result.current.notices).toEqual([n1, n2]);
  });

  it("search exitoso luego de un error previo limpia error", async () => {
    // mount con error
    getAllNotices.mockRejectedValueOnce(new Error("upss"));
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("upss");

    // search ok debe limpiar error
    searchNoticesByText.mockResolvedValueOnce([n3]);
    await act(async () => {
      await result.current.search("c");
    });
    expect(result.current.error).toBeNull();
    expect(result.current.notices).toEqual([n3]);
  });
});
