import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedFunction } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useNotices } from "../../hooks/useNotices";
import type { Notice, NoticeCreate } from "../../types/notice";

vi.mock("../../services/notice.service", () => ({
  getAllNotices: vi.fn(),
  searchNoticesByText: vi.fn(),
  createNotice: vi.fn(),
  updateNotice: vi.fn(),
  deleteNotice: vi.fn(),
}));

vi.mock("../../../user/context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

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

const n1: Notice = { id: 1, title: "A", description: "aa", userId: 10 } as any;
const n2: Notice = { id: 2, title: "B", description: "bb", userId: 10 } as any;
const n3: Notice = { id: 3, title: "C", description: "cc", userId: 99 } as any;

describe("useNotices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Contexto por defecto con user id=10
    useAuthContext.mockReturnValue({ info: { id: 10 } } as any);
  });

  it("carga inicial: fetchAll en mount setea notices y apaga loading", async () => {
    getAllNotices.mockResolvedValueOnce([n1, n2]);

    const { result } = renderHook(() => useNotices());

    // Arranca en loading=true
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getAllNotices).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
    expect(result.current.notices).toEqual([n1, n2]);
  });

  it("carga inicial: si getAllNotices falla setea error y deja []", async () => {
    getAllNotices.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useNotices());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("boom");
    expect(result.current.notices).toEqual([]);
  });

  it("search: éxito actualiza notices y limpia error", async () => {
    // para el mount
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

  it("search: error setea error y devuelve []", async () => {
    getAllNotices.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    searchNoticesByText.mockRejectedValueOnce(new Error("nope"));

    await act(async () => {
      const list = await result.current.search("x");
      expect(list).toEqual([]);
    });

    expect(result.current.error).toBe("nope");
    expect(result.current.loading).toBe(false);
  });

  it("add: usa info.id, llama createNotice y luego recarga con fetchAll", async () => {
    // mount
    getAllNotices.mockResolvedValueOnce([n1]);
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // al agregar, esperamos que luego de fetchAll queden [n1, n2]
    getAllNotices.mockResolvedValueOnce([n1, n2]);
    createNotice.mockResolvedValueOnce(undefined as any);

    const body: NoticeCreate = { title: "B", description: "bb" } as any;

    await act(async () => {
      await result.current.add(body);
    });

    // createNotice debe haber recibido userId del contexto
    expect(createNotice).toHaveBeenCalledWith({ ...body, userId: 10 });
    // fetchAll tras crear:
    expect(getAllNotices).toHaveBeenCalledTimes(2);
    expect(result.current.notices).toEqual([n1, n2]);
    expect(result.current.loading).toBe(false);
  });

  it("edit: usa info.id, llama updateNotice y recarga", async () => {
    getAllNotices.mockResolvedValueOnce([n1, n2]);
    const { result } = renderHook(() => useNotices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // después de editar, simulamos que el backend devuelve [n1, n2] con n2 cambiado
    const updatedN2 = { ...n2, title: "B2" } as Notice;
    getAllNotices.mockResolvedValueOnce([n1, updatedN2]);
    updateNotice.mockResolvedValueOnce(undefined as any);

    await act(async () => {
      await result.current.edit({ ...n2, title: "B2" });
    });

    expect(updateNotice).toHaveBeenCalledWith({ ...n2, title: "B2", userId: 10 });
    expect(getAllNotices).toHaveBeenCalledTimes(2);
    expect(result.current.notices).toEqual([n1, updatedN2]);
    expect(result.current.loading).toBe(false);
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
    expect(result.current.loading).toBe(false);
  });
});
