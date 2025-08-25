// p.ej. src/app/user/__tests__/useFavorites.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedFunction } from "vitest";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AxiosHeaders } from "axios";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFavorites } from "../../hooks/useFavorites";

// 🔧 Ajustá estos paths si tu estructura difiere
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

// Importamos los módulos mockeados y los tipamos con MockedFunction
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

// ✅ Helper: AxiosResponse mínimo válido (Axios v1 exige config.headers)
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
    useGlobalAlert.mockReturnValue({ showAlert } as any);
  });

  it("cuando no está logueado, no carga favoritos y deja []", async () => {
    useAuthContext.mockReturnValue({ info: null, isLogged: false } as any);

    getFavoritesByUser.mockResolvedValue(axiosResponse<Favorite[]>([]));

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

  it("si falla la carga inicial, muestra alerta de error y apaga loading", async () => {
    useAuthContext.mockReturnValue({ info: { id: 5 }, isLogged: true } as any);
    getFavoritesByUser.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(showAlert).toHaveBeenCalledWith(
      "No se pudieron cargar los favoritos",
      "error"
    );
    expect(result.current.favorites).toEqual([]);
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

  it("toggleFavorite: muestra mensaje de error del backend si viene en error.response.data", async () => {
    useAuthContext.mockReturnValue({ info: { id: 4 }, isLogged: true } as any);
    getFavoritesByUser.mockResolvedValue(axiosResponse<Favorite[]>([]));

    const backendError = { response: { data: "No se pudo crear" } };
    createFavorite.mockRejectedValue(backendError);

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleFavorite(123);
    });

    expect(showAlert).toHaveBeenCalledWith("No se pudo crear", "error");
    expect(result.current.favorites).toEqual([]);
  });

  it("toggleFavorite: si error sin response.data, muestra 'Error desconocido'", async () => {
    useAuthContext.mockReturnValue({ info: { id: 4 }, isLogged: true } as any);
    getFavoritesByUser.mockResolvedValue(axiosResponse<Favorite[]>([]));
    createFavorite.mockRejectedValue(new Error("falló"));

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleFavorite(321);
    });

    expect(showAlert).toHaveBeenCalledWith("Error desconocido", "error");
  });
});
