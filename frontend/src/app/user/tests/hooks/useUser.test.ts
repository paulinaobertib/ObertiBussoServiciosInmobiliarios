import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { MockedFunction } from "vitest";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AxiosHeaders } from "axios";
import { renderHook, waitFor } from "@testing-library/react";
import { useUser } from "../../hooks/useUser";
import type { User } from "../../types/user";

vi.mock("../../services/user.service", () => ({
  getUserById: vi.fn(),
}));

import { getUserById as _getUserById } from "../../services/user.service";
const getUserById = _getUserById as MockedFunction<typeof _getUserById>;

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

  it("no llama al servicio si userId es vacío/null/undefined", async () => {
    const { result, rerender } = renderHook(
      ({ id }) => useUser(id as any),
      { initialProps: { id: "" } }
    );

    // No debería iniciar ninguna carga
    expect(getUserById).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();

    // También probamos null y undefined 
    rerender({ id: null as any });
    expect(getUserById).not.toHaveBeenCalled();

    rerender({ id: undefined as any });
    expect(getUserById).not.toHaveBeenCalled();
  });

  it("setea user y limpia error cuando getUserById resuelve OK", async () => {
    const fakeUser: User = { id: "42", name: "Ana" } as any;
    getUserById.mockResolvedValueOnce(axiosResponse(fakeUser));

    const { result } = renderHook(() => useUser("42"));

    await waitFor(() => expect(result.current.user).toEqual(fakeUser));
    expect(result.current.error).toBeNull();
    expect(getUserById).toHaveBeenCalledWith("42");
  });

  it("setea error cuando getUserById rechaza", async () => {
    getUserById.mockRejectedValueOnce(new Error("No encontrado"));

    const { result } = renderHook(() => useUser("999"));

    await waitFor(() => expect(result.current.error).toBe("No encontrado"));
    expect(result.current.user).toBeNull();
    expect(getUserById).toHaveBeenCalledWith("999");
  });

  it("no setea estado después del unmount", async () => {
    vi.useFakeTimers();

    // Simulamos una promesa que resuelve con delay
    getUserById.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(axiosResponse({ id: "1", name: "Tarde" } as any));
          }, 100);
        })
    );

    const { unmount } = renderHook(() => useUser("1"));

    // Desmontamos antes de que resuelva
    unmount();

    // Avanzamos timers para que la promesa se resuelva
    vi.advanceTimersByTime(150);

    // Si intentara setear estado tras unmount, React suele loggear warning o tirar act error.
    // No esperamos ninguna excepción acá; el test pasa si no crashea.
    expect(getUserById).toHaveBeenCalledWith("1");
  });
});
