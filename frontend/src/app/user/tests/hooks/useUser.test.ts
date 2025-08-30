import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { MockedFunction } from "vitest";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AxiosHeaders } from "axios";
import { renderHook, waitFor } from "@testing-library/react";
import { useUser } from "../../hooks/useUser";
import type { User } from "../../types/user";

/* Mocks */
vi.mock("../../services/user.service", () => ({
  getUserById: vi.fn(),
}));

const handleErrorMock = vi.fn((e: any) => (e instanceof Error ? e.message : String(e)));
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: handleErrorMock }),
}));

import { getUserById as _getUserById } from "../../services/user.service";
const getUserById = _getUserById as MockedFunction<typeof _getUserById>;

/* Helper AxiosResponse */
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

describe("useUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("NO llama al servicio si userId es '', null o undefined; deja user=null y loading=false", async () => {
    const { result, rerender } = renderHook(({ id }) => useUser(id as any), {
      initialProps: { id: "" },
    });

    expect(getUserById).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);

    rerender({ id: null as any });
    expect(getUserById).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);

    rerender({ id: undefined as any });
    expect(getUserById).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("éxito: setea user y loading pasa true→false", async () => {
    const fakeUser: User = { id: "42", name: "Ana" } as any;
    getUserById.mockResolvedValueOnce(axiosResponse(fakeUser));

    const { result } = renderHook(() => useUser("42"));

    // loading se activa
    await waitFor(() => expect(result.current.loading).toBe(true));
    // …y luego se apaga con user seteado
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(fakeUser);
    expect(getUserById).toHaveBeenCalledWith("42");
  });

  it("error: llama handleError, deja user=null y loading=false", async () => {
    const boom = new Error("No encontrado");
    getUserById.mockRejectedValueOnce(boom);

    const { result } = renderHook(() => useUser("999"));

    await waitFor(() => expect(result.current.loading).toBe(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(getUserById).toHaveBeenCalledWith("999");
    expect(handleErrorMock).toHaveBeenCalledWith(boom);
  });

  it("cleanup: no intenta setear estado tras unmount (promesa tardía)", async () => {
    vi.useFakeTimers();

    getUserById.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(axiosResponse({ id: "1", name: "Tarde" } as any));
          }, 100);
        })
    );

    const { unmount } = renderHook(() => useUser("1"));
    // desmonto antes de que resuelva
    unmount();

    // avanza timers para resolver la promesa
    vi.advanceTimersByTime(150);

    // El test pasa si no hay warnings/errores por update después del unmount.
    expect(getUserById).toHaveBeenCalledWith("1");
  });

  it("cambia userId: vuelve a buscar y actualiza user; si luego es '', resetea y no llama servicio", async () => {
    const alice: User = { id: "A", name: "Alice" } as any;
    const bob: User = { id: "B", name: "Bob" } as any;

    getUserById.mockResolvedValueOnce(axiosResponse(alice));
    const { result, rerender } = renderHook(
      ({ id }) => useUser(id),
      { initialProps: { id: "A" } }
    );

    await waitFor(() => expect(result.current.loading).toBe(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(alice);

    // cambia a B
    getUserById.mockResolvedValueOnce(axiosResponse(bob));
    rerender({ id: "B" });

    await waitFor(() => expect(result.current.loading).toBe(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(bob);

    // ahora id vacío: resetea user y no pega al servicio
    rerender({ id: "" as any });
    expect(result.current.user).toBeNull();
  });

  it("loading flip controlado con promesa diferida", async () => {
    let resolveFn!: (value: AxiosResponse<User>) => void;
    const pending = new Promise<AxiosResponse<User>>((res) => {
      resolveFn = res;
    });

    getUserById.mockReturnValueOnce(pending as any);

    const { result } = renderHook(() => useUser("Z"));
    await waitFor(() => expect(result.current.loading).toBe(true));
    expect(result.current.user).toBeNull();

    // resuelvo
    resolveFn(axiosResponse({ id: "Z", name: "Zed" } as any));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user?.id).toBe("Z");
  });
});
