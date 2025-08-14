import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedFunction } from "vitest";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AxiosHeaders } from "axios";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUsers, type Filter } from "../../hooks/useUsers";
import type { User, Role } from "../../types/user";

// ---- Mocks de servicios ----
// MUY IMPORTANTE: el path debe coincidir con el que usa el hook
vi.mock("../../services/user.service", () => ({
  getAllUsers: vi.fn(),
  getTenants: vi.fn(),
  searchUsersByText: vi.fn(),
  getRoles: vi.fn(),
}));

import * as userService from "../../services/user.service";

const getAllUsers = userService.getAllUsers as MockedFunction<
  typeof userService.getAllUsers
>;
const getTenants = userService.getTenants as MockedFunction<
  typeof userService.getTenants
>;
const searchUsersByText = userService.searchUsersByText as MockedFunction<
  typeof userService.searchUsersByText
>;
const getRoles = userService.getRoles as MockedFunction<
  typeof userService.getRoles
>;

// ---- Helper AxiosResponse mínimo válido (Axios v1 exige config.headers) ----
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

// ---- Datos de ejemplo ----
const u1: User = { id: "1", name: "Ana" } as any;
const u2: User = { id: "2", name: "Bob" } as any;
const u3: User = { id: "3", name: "Cris" } as any;

describe("useUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("carga inicial con filtro TODOS: usa getAllUsers, enriquece roles y setea users", async () => {
    getAllUsers.mockResolvedValue(axiosResponse<User[]>([u1, u2]));
    // u1 -> ["admin"], u2 -> ["user"]
    getRoles.mockImplementation(async (id: string) =>
      id === "1" ? axiosResponse<Role[]>(["admin"]) : axiosResponse<Role[]>(["user"])
    );

    const { result } = renderHook(() => useUsers("TODOS"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getAllUsers).toHaveBeenCalledTimes(1);
    expect(getRoles).toHaveBeenCalledTimes(2);

    const rolesById = Object.fromEntries(result.current.users.map((u) => [u.id, u.roles]));
    expect(rolesById["1"]).toEqual(["admin"]);
    expect(rolesById["2"]).toEqual(["user"]);
  });

  it("carga con filtro TENANT: usa getTenants (no getAllUsers) y enriquece", async () => {
    getTenants.mockResolvedValue(axiosResponse<User[]>([u2, u3]));
    getRoles.mockResolvedValue(axiosResponse<Role[]>(["user"]));

    const { result } = renderHook(() => useUsers("TENANT"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getTenants).toHaveBeenCalledTimes(1);
    expect(getAllUsers).not.toHaveBeenCalled();
    expect(result.current.users).toHaveLength(2);
    expect(result.current.users.every((u) => u.roles.includes("user"))).toBe(true);
  });

  it("filtro ADMIN: mantiene sólo usuarios con rol 'admin'", async () => {
    getAllUsers.mockResolvedValue(axiosResponse<User[]>([u1, u2, u3]));
    getRoles.mockImplementation(async (id: string) => {
      if (id === "1") return axiosResponse<Role[]>(["admin"]);
      if (id === "2") return axiosResponse<Role[]>(["user"]);
      return axiosResponse<Role[]>([]); // u3 sin roles
    });

    const { result } = renderHook(() => useUsers("ADMIN"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.users.map((u) => u.id)).toEqual(["1"]);
  });

  it("filtro USER: mantiene sólo usuarios con rol 'user'", async () => {
    getAllUsers.mockResolvedValue(axiosResponse<User[]>([u1, u2, u3]));
    getRoles.mockImplementation(async (id: string) => {
      if (id === "1") return axiosResponse<Role[]>(["admin"]);
      if (id === "2") return axiosResponse<Role[]>(["user"]);
      return axiosResponse<Role[]>([]);
    });

    const { result } = renderHook(() => useUsers("USER"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.users.map((u) => u.id)).toEqual(["2"]);
  });

  it("enrich maneja error en getRoles devolviendo roles=[]", async () => {
    getAllUsers.mockResolvedValue(axiosResponse<User[]>([u1]));
    getRoles.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useUsers("TODOS"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.users[0].roles).toEqual([]);
  });

  it("fetchAll: pide getAllUsers, enriquece y actualiza state", async () => {
    getAllUsers.mockResolvedValue(axiosResponse<User[]>([u1, u2]));
    getRoles.mockResolvedValue(axiosResponse<Role[]>(["user"]));

    const { result } = renderHook(() => useUsers("TODOS"));
    // Esperá el load inicial
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Cambiamos el state con fetchAll
    await act(async () => {
      await result.current.fetchAll();
    });

    expect(getAllUsers).toHaveBeenCalledTimes(2); // inicial + fetchAll
    expect(result.current.users).toHaveLength(2);
  });

  it("fetchByText: usa searchUsersByText (devuelve User[]), enriquece y actualiza state", async () => {
    // Para el mount inicial
    getAllUsers.mockResolvedValue(axiosResponse<User[]>([]));
    getRoles.mockResolvedValue(axiosResponse<Role[]>([]));

    // Para la búsqueda (nota: el hook espera que searchUsersByText devuelva Array<User>)
    searchUsersByText.mockResolvedValue([u3]);
    getRoles.mockResolvedValueOnce(axiosResponse<Role[]>(["admin"]));

    const { result } = renderHook(() => useUsers("TODOS"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const enriched = await act(async () => {
      return await result.current.fetchByText("cris");
    });

    expect(searchUsersByText).toHaveBeenCalledWith("cris");
    expect(enriched).toHaveLength(1);
    expect(enriched?.[0]?.roles).toEqual(["admin"]);
    expect(result.current.users.map((u) => u.id)).toEqual(["3"]);
  });

  it("toggleSelect: funciona con string, array y null, e isSelected refleja el estado", async () => {
    // Mount básico
    getAllUsers.mockResolvedValue(axiosResponse<User[]>([]));
    const { result } = renderHook(() => useUsers("TODOS"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    // arranca en null
    expect(result.current.selected).toBeNull();
    expect(result.current.isSelected("1")).toBe(false);

    // seleccionar con string
    await act(async () => {
      result.current.toggleSelect("1");
    });
    expect(result.current.selected).toBe("1");
    expect(result.current.isSelected("1")).toBe(true);

    // toggle con el mismo id -> vuelve a null
    await act(async () => {
      result.current.toggleSelect("1");
    });
    expect(result.current.selected).toBeNull();

    // seleccionar con array -> toma el último
    await act(async () => {
      result.current.toggleSelect(["2", "3"]);
    });
    expect(result.current.selected).toBe("3");
    expect(result.current.isSelected("3")).toBe(true);

    // array vacío -> null (y hace toggle si ya era null)
    await act(async () => {
      result.current.toggleSelect([]);
    });
    expect(result.current.selected).toBeNull();

    // null explícito -> null
    await act(async () => {
      result.current.toggleSelect(null);
    });
    expect(result.current.selected).toBeNull();
  });

  it("setFilter cambia el filtro y load vuelve a ejecutarse", async () => {
    getAllUsers.mockResolvedValue(axiosResponse<User[]>([u1]));
    getRoles.mockResolvedValue(axiosResponse<Role[]>(["user"]));

    const { result } = renderHook(() => useUsers("TODOS"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getAllUsers).toHaveBeenCalledTimes(1);

    // Cambiar filtro dispara useEffect(load)
    getAllUsers.mockResolvedValueOnce(axiosResponse<User[]>([u2]));
    await act(async () => {
      result.current.setFilter("USER" as Filter);
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getAllUsers).toHaveBeenCalledTimes(2);
    expect(result.current.users.map((u) => u.id)).toEqual(["2"]);
  });
});
