// src/app/user/tests/hooks/useProfile.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedFunction } from "vitest";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AxiosHeaders } from "axios";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useProfile } from "../../hooks/useProfile";
import type { User } from "../../types/user";

// 🔧 Mocks (¡paths relativos correctos desde ESTE test!)
vi.mock("../../services/user.service", () => ({
  getMe: vi.fn(),
  putUser: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

import { getMe as _getMe, putUser as _putUser } from "../../services/user.service";
import { useAuthContext as _useAuthContext } from "../../context/AuthContext";

const getMe = _getMe as MockedFunction<typeof _getMe>;
const putUser = _putUser as MockedFunction<typeof _putUser>;
const useAuthContext = _useAuthContext as MockedFunction<typeof _useAuthContext>;

// Helper AxiosResponse mínimo válido (Axios v1 exige config.headers)
function axiosResponse<T>(
  data: T,
  init?: Partial<AxiosResponse<T>>
): AxiosResponse<T> {
  const config = {
    url: "/",
    method: "get",
    headers: new AxiosHeaders(),
  } as unknown as InternalAxiosRequestConfig<any>;

  return {
    data,
    status: 200,
    statusText: "OK",
    headers: new AxiosHeaders(),
    config,
    ...init,
  };
}

describe("useProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("si el contexto ya trae info, inicializa profile con info y no llama getMe", async () => {
    const ctxInfo: User = { id: "1", name: "Ana", roles: ["admin"], preferences: [] } as any;

    const setInfo = vi.fn();

    useAuthContext.mockReturnValue({ info: ctxInfo, setInfo } as any);

    const { result } = renderHook(() => useProfile());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.profile).toEqual(ctxInfo);
    expect(getMe).not.toHaveBeenCalled();
    expect(setInfo).not.toHaveBeenCalled();
  });

  it("si no hay info, llama getMe, setea profile y setInfo inicializando roles/preferences", async () => {
    const fetched: User = { id: "2", name: "Bob" } as any;

    // simulamos que en el contexto no hay info inicial
    let prevInfo: User | null = null;
    let lastSetInfoValue: any = null;
    const setInfo = vi.fn((updater: any) => {
      lastSetInfoValue =
        typeof updater === "function" ? updater(prevInfo) : updater;
      prevInfo = lastSetInfoValue;
      return lastSetInfoValue;
    });

    useAuthContext.mockReturnValue({ info: null, setInfo } as any);
    getMe.mockResolvedValueOnce(axiosResponse(fetched));

    const { result } = renderHook(() => useProfile());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getMe).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
    expect(result.current.profile).toEqual(fetched);

    // setInfo debe haber inicializado roles y preferences si antes eran null
    expect(setInfo).toHaveBeenCalledTimes(1);
    expect(lastSetInfoValue).toEqual({
      ...fetched,
      roles: [],
      preferences: [],
    });
  });

  it("si getMe falla, setea error y apaga loading", async () => {
    const setInfo = vi.fn();
    useAuthContext.mockReturnValue({ info: null, setInfo } as any);
    getMe.mockRejectedValueOnce(new Error("Fallo en getMe"));

    const { result } = renderHook(() => useProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBe("Fallo en getMe");
    expect(setInfo).not.toHaveBeenCalled();
  });

  it("updateProfile: hace merge priorizando backend, actualiza state y setInfo (con prev)", async () => {
    const prevInfo: User = {
      id: "10",
      name: "Prev",
      roles: ["admin"],
      preferences: ["dark"],
      email: "prev@mail.com",
    } as any;

    let lastSetInfoValue: any = null;
    const setInfo = vi.fn((updater: any) => {
      lastSetInfoValue =
        typeof updater === "function" ? updater(prevInfo) : updater;
      return lastSetInfoValue;
    });

    useAuthContext.mockReturnValue({ info: prevInfo, setInfo } as any);

    const { result } = renderHook(() => useProfile());

    const data: User = { id: "10" } as any;
    const backendPatch = {
    nick: "Nombre del Backend",
    } as any;
    putUser.mockResolvedValueOnce(axiosResponse(backendPatch as User));

    let merged!: User;
    await act(async () => {
      merged = await result.current.updateProfile(data);
    });

    expect(merged).toEqual({ ...data, ...backendPatch });
    expect(result.current.profile).toEqual(merged);

    expect(setInfo).toHaveBeenCalledTimes(1);
    expect(lastSetInfoValue).toEqual({
      ...prevInfo,
      ...merged,
    });
    expect((lastSetInfoValue as any).roles).toEqual(["admin"]);
    expect((lastSetInfoValue as any).preferences).toEqual(["dark"]);
  });

    it("updateProfile: si no había prev (info=null), setea roles/preferences vacíos", async () => {
    let prevInfo: User | null = null;
    let lastSetInfoValue: any = null;
    const setInfo = vi.fn((updater: any) => {
        lastSetInfoValue = typeof updater === "function" ? updater(prevInfo) : updater;
        prevInfo = lastSetInfoValue;
        return lastSetInfoValue;
    });
    
    useAuthContext.mockReturnValue({ info: null, setInfo } as any);
    getMe.mockResolvedValueOnce(axiosResponse({ id: "seed" } as any));

    const { result } = renderHook(() => useProfile());

    // Esperá a que termine la carga inicial (getMe)
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Ahora probá updateProfile como ya lo tenías…
    const data: User = { id: "5" } as any;
    const backendPatch = { anyField: "whatever" } as any;
    putUser.mockResolvedValueOnce(axiosResponse(backendPatch));

    await act(async () => {
        await result.current.updateProfile(data);
    });

    expect((lastSetInfoValue as any).roles).toEqual([]);
    expect((lastSetInfoValue as any).preferences).toEqual([]);
    expect(result.current.profile).toEqual({ ...data, ...backendPatch });
    });

});
