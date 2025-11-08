import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { MockedFunction } from "vitest";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AxiosHeaders } from "axios";
import { useProfile } from "../../hooks/useProfile";
import type { User } from "../../types/user";

/* Mocks */
vi.mock("../../services/user.service", () => ({
  getMe: vi.fn(),
  putUser: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

const handleErrorMock = vi.fn((e: any) => (e instanceof Error ? e.message : String(e)));
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: handleErrorMock }),
}));

/* Imports reales (ya mockeados arriba) */
import * as svc from "../../services/user.service";
import { useAuthContext as _useAuthContext } from "../../context/AuthContext";

const getMe = svc.getMe as MockedFunction<typeof svc.getMe>;
const putUser = svc.putUser as MockedFunction<typeof svc.putUser>;
const useAuthContext = _useAuthContext as MockedFunction<typeof _useAuthContext>;

/* Helper para AxiosResponse válido */
function axiosResponse<T>(data: T, init?: Partial<AxiosResponse<T>>): AxiosResponse<T> {
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
    handleErrorMock.mockClear();
  });

  it("con info en contexto: profile=info, loading=false y NO llama getMe", async () => {
    const ctxInfo: any = {
      id: "U1",
      name: "Ana",
      email: "a@b.com",
      roles: ["TENANT"],
      preferences: [{ type: "X", enabled: true }],
    };
    const setInfo = vi.fn();

    useAuthContext.mockReturnValue({ info: ctxInfo, setInfo } as any);

    const { result } = renderHook(() => useProfile());

    expect(result.current.loading).toBe(false);
    expect(result.current.profile?.id).toBe("U1");
    expect(getMe).not.toHaveBeenCalled();

    // updateProfile prioriza lo que devuelva el backend
    const input: User = { id: "U1", name: "Ana 2", email: "x@y.com" } as any;
    putUser.mockResolvedValueOnce(axiosResponse({ name: "SRV", email: "srv@ex.com" }));

    let out: User | null = null;
    await act(async () => {
      out = await result.current.updateProfile(input);
    });

    const merged = { ...input, name: "SRV", email: "srv@ex.com" };
    expect(putUser).toHaveBeenCalledWith(input);
    expect(result.current.profile).toEqual(merged);
    expect(out).toEqual(merged);

    // Verificamos el updater pasado a setInfo (branch prev truthy)
    const updater = setInfo.mock.calls[0][0] as (prev: any) => any;
    const prev = { ...ctxInfo, extra: "keep" };
    const after = updater(prev);
    expect(after).toEqual({ ...prev, ...merged });
  });

  it("sin info: carga inicial llama getMe, setea profile y usa setInfo(prev) para prev=null y prev truthy", async () => {
    const setInfo = vi.fn();
    useAuthContext.mockReturnValue({ info: null, setInfo } as any);

    const me = { id: "U2", name: "Beto", email: "b@ex.com" } as any;
    getMe.mockResolvedValueOnce(axiosResponse(me));

    const { result } = renderHook(() => useProfile());

    // inicia en loading=true
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getMe).toHaveBeenCalledTimes(1);
    expect(result.current.profile).toEqual(me);

    // Updater enviado a setInfo desde el effect
    const updater = setInfo.mock.calls[0][0] as (prev: any) => any;

    // prev = null -> inicializa roles/preferences vacíos
    const withNull = updater(null);
    expect(withNull).toEqual({ ...me, roles: [], preferences: [] });

    // prev truthy -> merge con prioridad a datos de me
    const prev = { id: "OLD", roles: ["ADMIN"], preferences: [1], keep: true } as any;
    const withPrev = updater(prev);
    expect(withPrev).toEqual({ ...prev, ...me });
  });

  it("sin info: si getMe falla, llama handleError y deja profile=null, loading=false", async () => {
    const setInfo = vi.fn();
    useAuthContext.mockReturnValue({ info: null, setInfo } as any);

    getMe.mockRejectedValueOnce(new Error("fail me"));

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(handleErrorMock).toHaveBeenCalledWith(new Error("fail me"));
    expect(result.current.profile).toBeNull();
  });

  it("updateProfile éxito con backend vacío: usa sólo data de entrada, setea profile y setInfo (prev truthy)", async () => {
    const ctxInfo: any = {
      id: "U3",
      name: "Carla",
      roles: ["TENANT"],
      preferences: [],
    };
    const setInfo = vi.fn();
    useAuthContext.mockReturnValue({ info: ctxInfo, setInfo } as any);

    const payload: User = { id: "U3", name: "Carla Z", phone: "123" } as any;
    // backend sin cambios (data vacío)
    putUser.mockResolvedValueOnce(axiosResponse({}));

    let out: User | null = null;
    const { result } = renderHook(() => useProfile());
    await act(async () => {
      out = await result.current.updateProfile(payload);
    });

    expect(putUser).toHaveBeenCalledWith(payload);
    expect(result.current.profile).toEqual(payload);
    expect(out).toEqual(payload);

    const updater = setInfo.mock.calls[0][0] as (prev: any) => any;
    const after = updater(ctxInfo);
    expect(after).toEqual({ ...ctxInfo, ...payload });
  });

  it("updateProfile éxito con prev=null en updater: agrega roles/preferences vacíos", async () => {
    const setInfo = vi.fn();
    useAuthContext.mockReturnValue({ info: null, setInfo } as any);
    getMe.mockResolvedValueOnce(axiosResponse({ id: "BOOT" } as any));

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    putUser.mockResolvedValueOnce(axiosResponse({ email: "ok@ex.com" }));
    const payload = { id: "BOOT", name: "Boot Name" } as any;

    await act(async () => {
      await result.current.updateProfile(payload);
    });

    // segunda llamada a setInfo es desde updateProfile
    const calls = setInfo.mock.calls;
    const updater = calls[calls.length - 1][0] as (prev: any) => any;

    const applied = updater(null);
    expect(applied).toEqual({
      ...payload,
      email: "ok@ex.com",
      roles: [],
      preferences: [],
    });
  });

  it("updateProfile error: retorna null, llama handleError y no toca profile", async () => {
    const ctxInfo: any = { id: "U4", name: "Dino", roles: [], preferences: [] };
    const setInfo = vi.fn();
    useAuthContext.mockReturnValue({ info: ctxInfo, setInfo } as any);

    const { result } = renderHook(() => useProfile());

    putUser.mockRejectedValueOnce(new Error("bad update"));

    let out: User | null = null;
    await act(async () => {
      out = await result.current.updateProfile({ id: "U4", name: "X" } as any);
    });

    expect(out).toBeNull();
    expect(handleErrorMock).toHaveBeenCalledWith(new Error("bad update"));
    expect(result.current.profile).toEqual(ctxInfo);
  });
});
