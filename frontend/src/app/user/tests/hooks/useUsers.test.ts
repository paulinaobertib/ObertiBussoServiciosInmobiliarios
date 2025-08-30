import { renderHook, act, waitFor } from "@testing-library/react";
import { useUsers, type Filter } from "../../hooks/useUsers";

const mockHandleError = vi.fn();
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: mockHandleError }),
}));

vi.mock("../../services/user.service", () => ({
  getAllUsers: vi.fn(),
  getTenants: vi.fn(),
  searchUsersByText: vi.fn(),
  getRoles: vi.fn(),
}));

import {
  getAllUsers,
  getTenants,
  searchUsersByText,
  getRoles,
} from "../../services/user.service";

type AnyUser = { id: string; name?: string };

const U1: AnyUser = { id: "1", name: "Ana" };
const U2: AnyUser = { id: "2", name: "Beto" };
const U3: AnyUser = { id: "3", name: "Teo" };

const ok = <T,>(v: T) => Promise.resolve(v);

beforeEach(() => {
  vi.clearAllMocks();
  // valores por defecto (se pueden sobrescribir por test con mockResolvedValueOnce/mockRejectedValueOnce)
  (getAllUsers as any).mockResolvedValue({ data: [U1, U2] });
  (getTenants as any).mockResolvedValue({ data: [U3] });
  (searchUsersByText as any).mockImplementation((txt: string) =>
    ok<AnyUser[]>([{ id: "4", name: `res-${txt}` }])
  );
  (getRoles as any).mockImplementation((userId: string) =>
    userId === "1"
      ? ok({ data: ["user"] })
      : userId === "2"
      ? ok({ data: ["admin"] })
      : ok({ data: [] })
  );
});

describe("useUsers (alta cobertura)", () => {
  test("carga inicial (TODOS): usa getAllUsers, enriquece roles y deja loading=false", async () => {
    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.users.length).toBe(2);
    });

    // users enriquecidos
    const [a, b] = result.current.users;
    expect(a.roles).toEqual(["user"]);
    expect(b.roles).toEqual(["admin"]);

    expect(getAllUsers).toHaveBeenCalledTimes(1);
    expect(getTenants).not.toHaveBeenCalled();
    expect(getRoles).toHaveBeenCalledTimes(2);

    // API selección
    expect(result.current.selected).toBeNull();
    expect(result.current.isSelected("1")).toBe(false);
  });

  test("toggleSelect: string → toggle on/off; array toma el último; null y array [] limpian", async () => {
    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // string
    act(() => result.current.toggleSelect("1"));
    expect(result.current.selected).toBe("1");
    expect(result.current.isSelected("1")).toBe(true);

    // mismo id → des-selecciona
    act(() => result.current.toggleSelect("1"));
    expect(result.current.selected).toBeNull();

    // array => último
    act(() => result.current.toggleSelect(["x", "2"]));
    expect(result.current.selected).toBe("2");

    // null
    act(() => result.current.toggleSelect(null));
    expect(result.current.selected).toBeNull();

    // array vacío
    act(() => result.current.toggleSelect([]));
    expect(result.current.selected).toBeNull();
  });

  test("setFilter('ADMIN') filtra por rol 'admin'", async () => {
    const { result } = renderHook(() => useUsers());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.users.length).toBe(2);

    act(() => result.current.setFilter("ADMIN"));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.users.length).toBe(1);
    });

    expect(result.current.users[0].id).toBe("2"); // tenía rol admin
    // Debe haber re-enriquecido
    expect(getRoles).toHaveBeenCalled();
  });

  test("setFilter('USER') filtra por rol 'user'", async () => {
    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setFilter("USER"));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.users.length).toBe(1);
    });

    expect(result.current.users[0].id).toBe("1"); // tenía rol user
  });

  test("initialFilter 'TENANT' usa getTenants y enriquece", async () => {
    const { result } = renderHook(() => useUsers("TENANT" as Filter));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.users.length).toBe(1);
    });

    expect(getTenants).toHaveBeenCalledTimes(1);
    // Igual enriquece (aunque devuelva vacío)
    expect(getRoles).toHaveBeenCalledTimes(1);
    expect(result.current.users[0].id).toBe("3");
    expect(result.current.users[0].roles).toEqual([]);
  });

  test("fetchAll: retorna y setea lista enriquecida (y sobreescribe state)", async () => {
    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Cambiamos lo que devolverá fetchAll
    (getAllUsers as any).mockResolvedValueOnce({ data: [U1] });
    (getRoles as any).mockResolvedValueOnce({ data: ["user"] });

    let out: any[] = [];
    await act(async () => {
      out = await result.current.fetchAll();
    });

    expect(out.length).toBe(1);
    expect(out[0].roles).toEqual(["user"]);
    expect(result.current.users.length).toBe(1);
    expect(result.current.users[0].id).toBe("1");
  });

  test("fetchByText: usa searchUsersByText (Array<User>), enriquece y setea", async () => {
    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    (searchUsersByText as any).mockResolvedValueOnce([U2, U1]);
    (getRoles as any)
      .mockResolvedValueOnce({ data: ["admin"] }) // para U2
      .mockResolvedValueOnce({ data: ["user"] }); // para U1

    let out: any[] = [];
    await act(async () => {
      out = await result.current.fetchByText("abc");
    });

    expect(searchUsersByText).toHaveBeenCalledWith("abc");
    expect(out.map((u) => u.roles)).toEqual([["admin"], ["user"]]);
    expect(result.current.users.length).toBe(2);
  });

  test("enrich: si getRoles falla para un user, deja roles=[] (cubre catch interno)", async () => {
    (getRoles as any)
      .mockResolvedValueOnce({ data: ["user"] }) // U1 ok
      .mockRejectedValueOnce(new Error("roles-fail")); // U2 falla

    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const [a, b] = result.current.users;
    expect(a.roles).toEqual(["user"]);
    expect(b.roles).toEqual([]); // por catch en enrich
  });

  test("load: si getAllUsers falla, handleError es llamado y users=[]; loading vuelve a false", async () => {
    (getAllUsers as any).mockRejectedValueOnce(new Error("fetch-fail"));

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.users).toEqual([]); // setUsers([]) en catch
    });

    expect(mockHandleError).toHaveBeenCalledTimes(1);
  });

  test("fetchAll: si falla, retorna [] y NO cambia el state", async () => {
    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    // estado actual: 2 users (del load inicial)
    const prevIds = result.current.users.map((u) => u.id);

    (getAllUsers as any).mockRejectedValueOnce(new Error("fail-ff"));

    let out: any[] = [{}] as any;
    await act(async () => {
      out = await result.current.fetchAll();
    });

    expect(out).toEqual([]);
    expect(result.current.users.map((u) => u.id)).toEqual(prevIds);
    expect(mockHandleError).toHaveBeenCalledTimes(1);
  });

  test("fetchByText: si falla, retorna [] y NO cambia el state", async () => {
    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const prevIds = result.current.users.map((u) => u.id);

    (searchUsersByText as any).mockRejectedValueOnce(new Error("fail-s"));

    let out: any[] = [{}] as any;
    await act(async () => {
      out = await result.current.fetchByText("zzz");
    });

    expect(out).toEqual([]);
    expect(result.current.users.map((u) => u.id)).toEqual(prevIds);
    expect(mockHandleError).toHaveBeenCalledTimes(1);
  });

  test("exponer setUsers permite sobreescribir manualmente el estado (rama de retorno)", async () => {
    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setUsers([{ id: "999", roles: ["x"] } as any]);
    });

    expect(result.current.users).toEqual([{ id: "999", roles: ["x"] }]);
  });

  test("cambiar varios filtros encadena cargas (cubre dependencias de load/enrich)", async () => {
    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setFilter("USER"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.users.every((u) => u.roles.includes("user"))).toBe(true);

    act(() => result.current.setFilter("ADMIN"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.users.every((u) => u.roles.includes("admin"))).toBe(true);

    act(() => result.current.setFilter("TODOS"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.users.length).toBeGreaterThan(0);
  });
});
