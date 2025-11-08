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

/* --------- Mock de useApiErrors --------- */
const handleErrorMock = vi.fn((e: any) => (e instanceof Error ? e.message : String(e)));
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: handleErrorMock }),
}));

/* --------- Mock de useGlobalAlert --------- */
const mockAlertApi = {
  success: vi.fn(),
  doubleConfirm: vi.fn().mockResolvedValue(true),
};
vi.mock("../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => mockAlertApi,
}));

/* --------- Imports reales (ya mockeados arriba) --------- */
import * as service from "../../services/notice.service";
import { useAuthContext as _useAuthContext } from "../../../user/context/AuthContext";

const getAllNotices = service.getAllNotices as MockedFunction<typeof service.getAllNotices>;
const searchNoticesByText = service.searchNoticesByText as MockedFunction<typeof service.searchNoticesByText>;
const createNotice = service.createNotice as MockedFunction<typeof service.createNotice>;
const updateNotice = service.updateNotice as MockedFunction<typeof service.updateNotice>;
const deleteNotice = service.deleteNotice as MockedFunction<typeof service.deleteNotice>;
const useAuthContext = _useAuthContext as MockedFunction<typeof _useAuthContext>;

/* --------- Datos base --------- */
const n1: Notice = { id: 1, title: "A", description: "aa", userId: 10 } as any;
const n2: Notice = { id: 2, title: "B", description: "bb", userId: 10 } as any;
const n3: Notice = { id: 3, title: "C", description: "cc", userId: 99 } as any;

describe("useNotices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handleErrorMock.mockClear();
    mockAlertApi.success.mockClear();
    mockAlertApi.doubleConfirm.mockClear();
    useAuthContext.mockReturnValue({ info: { id: 10 } } as any);
  });

  it("carga inicial (fetchAll en mount) setea notices y apaga loading", async () => {
    getAllNotices.mockResolvedValueOnce([n1, n2]);

    const { result } = renderHook(() => useNotices());

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

  it("fetchAll (manual) devuelve lista y limpia error", async () => {
    getAllNotices.mockResolvedValueOnce([]);
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    getAllNotices.mockResolvedValueOnce([n1]);
    await act(async () => {
      const list = await result.current.fetchAll();
      expect(list).toEqual([n1]);
    });

    expect(result.current.notices).toEqual([n1]);
    expect(result.current.error).toBeNull();
  });

  it("search: éxito actualiza notices y limpia error", async () => {
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
  });

  it("search: error setea error y devuelve []", async () => {
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
  });

  it("add: usa info.id, llama createNotice y luego recarga", async () => {
    getAllNotices.mockResolvedValueOnce([n1]);
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    getAllNotices.mockResolvedValueOnce([n1, n2]);
    createNotice.mockResolvedValueOnce(undefined as any);

    const body: NoticeCreate = { title: "B", description: "bb" } as any;
    await act(async () => {
      await result.current.add(body);
    });

    expect(createNotice).toHaveBeenCalledWith({ ...body, userId: 10 });
    expect(result.current.notices).toEqual([n1, n2]);
  });

  it("add: sin info.id -> error y no llama al servicio", async () => {
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
    expect(result.current.error).toBe("No se encontró el usuario autenticado.");
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
    expect(result.current.notices).toEqual([n1, updatedN2]);
  });

  it("remove: llama deleteNotice y recarga", async () => {
    getAllNotices.mockResolvedValueOnce([n1, n2]);
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    getAllNotices.mockResolvedValueOnce([n1]);
    deleteNotice.mockResolvedValueOnce(undefined as any);

    await act(async () => {
      await result.current.remove(2);
    });

    expect(deleteNotice).toHaveBeenCalledWith(2);
    expect(result.current.notices).toEqual([n1]);
  });
});
