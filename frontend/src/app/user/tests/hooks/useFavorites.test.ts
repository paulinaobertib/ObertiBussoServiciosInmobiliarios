// src/app/user/tests/hooks/useFavorites.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedFunction } from "vitest";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AxiosHeaders } from "axios";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFavorites } from "../../hooks/useFavorites";

/* ============ Mocks de módulos ============ */
vi.mock("../../services/favorite.service", () => ({
  getFavoritesByUser: vi.fn(),
  createFavorite: vi.fn(),
  deleteFavorite: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

vi.mock("../../../shared/context/AlertContext", () => ({
  useGlobalAlert: vi.fn(),
}));

// 👇 Mock de useApiErrors (importante para cubrir las ramas de error)
const handleErrorMock = vi.fn();
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: handleErrorMock }),
}));

/* ============ Imports reales (ya mockeados arriba) ============ */
import * as favoriteService from "../../services/favorite.service";
import { useAuthContext as _useAuthContext } from "../../context/AuthContext";
import { useGlobalAlert as _useGlobalAlert } from "../../../shared/context/AlertContext";

const getFavoritesByUser = favoriteService.getFavoritesByUser as MockedFunction<
  typeof favoriteService.getFavoritesByUser
>;
const createFavorite = favoriteService.createFavorite as MockedFunction<
  typeof favoriteService.createFavorite
>;
const deleteFavorite = favoriteService.deleteFavorite as MockedFunction<
  typeof favoriteService.deleteFavorite
>;
const useAuthContext = _useAuthContext as MockedFunction<typeof _useAuthContext>;
const useGlobalAlert = _useGlobalAlert as MockedFunction<typeof _useGlobalAlert>;

type Favorite = { id: number; propertyId: number; userId?: number };

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

describe("useFavorites", () => {
  const showAlert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    handleErrorMock.mockClear();
    useGlobalAlert.mockReturnValue({ showAlert } as any);
  });

  it("cuando no está logueado, no carga favoritos y deja []", async () => {
    useAuthContext.mockReturnValue({ info: null, isLogged: false } as any);

    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(getFavoritesByUser).not.toHaveBeenCalled();
  });

  it("cuando está logueado, carga favoritos y maneja loading", async () => {
    useAuthContext.mockReturnValue({ info: { id: 7 }, isLogged: true } as any);

    const data: Favorite[] = [
      { id: 1, propertyId: 10, userId: 7 },
      { id: 2, propertyId: 20, userId: 7 },
    ];
    getFavoritesByUser.mockResolvedValue(axiosResponse(data));

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getFavoritesByUser).toHaveBeenCalledWith(7);
    expect(result.current.favorites).toEqual(data);
  });

  it("isFavorite devuelve true/false según el propertyId", async () => {
    useAuthContext.mockReturnValue({ info: { id: 1 }, isLogged: true } as any);
    getFavoritesByUser.mockResolvedValue(
      axiosResponse<Favorite[]>([{ id: 1, propertyId: 99, userId: 1 }])
    );

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isFavorite(99)).toBe(true);
    expect(result.current.isFavorite(100)).toBe(false);
  });

  it("toggleFavorite: si no está logueado, muestra alerta y no llama servicios", async () => {
    useAuthContext.mockReturnValue({ info: null, isLogged: false } as any);

    const { result } = renderHook(() => useFavorites());
    await act(async () => {
      await result.current.toggleFavorite(10);
    });

    expect(showAlert).toHaveBeenCalledWith(
      "Para guardar como favorita esta propiedad, iniciá sesión",
      "info"
    );
    expect(createFavorite).not.toHaveBeenCalled();
    expect(deleteFavorite).not.toHaveBeenCalled();
  });

  it("toggleFavorite: si isLogged=true pero falta info.id → llama handleError y no llama servicios", async () => {
    useAuthContext.mockReturnValue({ info: {} as any, isLogged: true } as any);
    getFavoritesByUser.mockResolvedValue(axiosResponse<Favorite[]>([]));

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleFavorite(10);
    });

    expect(handleErrorMock).toHaveBeenCalled(); // error de autenticación
    expect(createFavorite).not.toHaveBeenCalled();
    expect(deleteFavorite).not.toHaveBeenCalled();
  });

  it("toggleFavorite: agrega favorito cuando no existe", async () => {
    useAuthContext.mockReturnValue({ info: { id: 3 }, isLogged: true } as any);
    getFavoritesByUser.mockResolvedValue(axiosResponse<Favorite[]>([]));

    const newFav: Favorite = { id: 101, propertyId: 55, userId: 3 };
    createFavorite.mockResolvedValue(axiosResponse(newFav));

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleFavorite(55);
    });

    expect(createFavorite).toHaveBeenCalledWith(3, 55);
    expect(result.current.favorites).toEqual([newFav]);
    expect(showAlert).toHaveBeenCalledWith(
      "Propiedad agregada a tus favoritos",
      "info"
    );
  });

  it("toggleFavorite: elimina favorito cuando ya existe", async () => {
    useAuthContext.mockReturnValue({ info: { id: 9 }, isLogged: true } as any);

    const existing: Favorite[] = [
      { id: 200, propertyId: 77, userId: 9 },
      { id: 201, propertyId: 88, userId: 9 },
    ];
    getFavoritesByUser.mockResolvedValue(axiosResponse(existing));
    deleteFavorite.mockResolvedValue(axiosResponse({}));

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleFavorite(77);
    });

    expect(deleteFavorite).toHaveBeenCalledWith(200);
    expect(result.current.favorites).toEqual([{ id: 201, propertyId: 88, userId: 9 }]);
    expect(showAlert).toHaveBeenCalledWith(
      "Propiedad eliminada de tus favoritos",
      "info"
    );
  });

  it("toggleFavorite: si deleteFavorite falla → mantiene lista y llama handleError", async () => {
    useAuthContext.mockReturnValue({ info: { id: 9 }, isLogged: true } as any);

    const existing: Favorite[] = [{ id: 200, propertyId: 77, userId: 9 }];
    getFavoritesByUser.mockResolvedValue(axiosResponse(existing));
    deleteFavorite.mockRejectedValue(new Error("falló borrar"));

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleFavorite(77);
    });

    expect(deleteFavorite).toHaveBeenCalledWith(200);
    expect(handleErrorMock).toHaveBeenCalled();
    // lista intacta
    expect(result.current.favorites).toEqual(existing);
  });

  it("toggleFavorite: si createFavorite falla → NO marca como favorito y llama handleError", async () => {
    useAuthContext.mockReturnValue({ info: { id: 4 }, isLogged: true } as any);
    getFavoritesByUser.mockResolvedValue(axiosResponse<Favorite[]>([]));
    const backendError = new Error("No se pudo crear");
    createFavorite.mockRejectedValue(backendError);

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleFavorite(123);
    });

    expect(handleErrorMock).toHaveBeenCalledWith(backendError);
    expect(result.current.favorites).toEqual([]);
  });

  it("montaje: si getFavoritesByUser rechaza → llama handleError y deja loading=false", async () => {
    useAuthContext.mockReturnValue({ info: { id: 5 }, isLogged: true } as any);
    const boom = new Error("boom");
    getFavoritesByUser.mockRejectedValue(boom);

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(handleErrorMock).toHaveBeenCalledWith(boom);
    expect(result.current.favorites).toEqual([]);
  });

  it("cleanup del efecto: si se desmonta antes de resolver, no llama handleError ni setea estado", async () => {
    useAuthContext.mockReturnValue({ info: { id: 6 }, isLogged: true } as any);

    let resolveFn!: (v: any) => void;
    const slow = new Promise((res) => (resolveFn = res));
    // @ts-ignore
    getFavoritesByUser.mockReturnValue(slow);

    const { unmount } = renderHook(() => useFavorites());
    // Desmontamos antes de resolver
    unmount();
    // resolvemos luego del unmount
    resolveFn(axiosResponse<Favorite[]>([{ id: 1, propertyId: 10, userId: 6 }]));

    // No debería haberse llamado handleError (ni setState luego de unmount)
    expect(handleErrorMock).not.toHaveBeenCalled();
  });

  it("cambio de usuario (info.id) vuelve a cargar favoritos y resetea lista al desloguear", async () => {
    // devolvemos dinámicamente según un ref externo
    const authState = { isLogged: false, info: null as any };
    useAuthContext.mockImplementation(() => authState as any);

    // 1) no logueado
    const { result, rerender } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);

    // 2) logueado con id 10
    getFavoritesByUser.mockResolvedValueOnce(
      axiosResponse<Favorite[]>([{ id: 1, propertyId: 10, userId: 10 }])
    );
    authState.isLogged = true;
    authState.info = { id: 10 };

    rerender();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getFavoritesByUser).toHaveBeenCalledWith(10);
    expect(result.current.favorites).toEqual([{ id: 1, propertyId: 10, userId: 10 }]);

    // 3) cambia a id 11 → vuelve a cargar
    getFavoritesByUser.mockResolvedValueOnce(
      axiosResponse<Favorite[]>([{ id: 2, propertyId: 11, userId: 11 }])
    );
    authState.info = { id: 11 };
    rerender();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getFavoritesByUser).toHaveBeenCalledWith(11);
    expect(result.current.favorites).toEqual([{ id: 2, propertyId: 11, userId: 11 }]);

    // 4) se desloguea → limpia a []
    authState.isLogged = false;
    authState.info = null;
    rerender();
    expect(result.current.favorites).toEqual([]);
  });
});
