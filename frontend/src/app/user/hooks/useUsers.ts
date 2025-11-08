import { useState, useEffect, useCallback } from "react";
import { getAllUsers, getTenants, searchUsersByText, getRoles } from "../services/user.service";
import type { User, Role } from "../types/user";
import { useApiErrors } from "../../shared/hooks/useErrors";

export type Filter = "TODOS" | "ADMIN" | "USER" | "TENANT";

export function useUsers(initialFilter: Filter = "TODOS") {
  /* ── datos ── */
  const [users, setUsers] = useState<(User & { roles: Role[] })[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const { handleError } = useApiErrors();

  /* ── selección ── */
  const [selected, setSelected] = useState<string | null>(null);

  /**
   * toggleSelect ahora acepta string | string[] | null para encajar con GridSection
   */
  const toggleSelect = useCallback((selectedInput: string | string[] | null) => {
    let id: string | null;
    if (Array.isArray(selectedInput)) {
      id = selectedInput.length > 0 ? selectedInput[selectedInput.length - 1] : null;
    } else {
      id = selectedInput;
    }
    setSelected((prev) => (prev === id ? null : id));
  }, []);

  const isSelected = useCallback((id: string) => selected === id, [selected]);

  /* ── helper roles ── */
  const enrich = useCallback(
    async (list: User[]) =>
      Promise.all(
        list.map(async (u) => {
          try {
            const res = await getRoles(u.id);
            return { ...u, roles: res.data };
          } catch {
            return { ...u, roles: [] };
          }
        })
      ),
    []
  );

  /* ── carga ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const base = filter === "TENANT" ? (await getTenants()).data : (await getAllUsers()).data;

      let enriched = await enrich(base);
      if (filter === "ADMIN") enriched = enriched.filter((u) => u.roles.includes("admin"));
      if (filter === "USER") enriched = enriched.filter((u) => u.roles.includes("user"));

      setUsers(enriched);
    } catch (error) {
      handleError(error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filter, enrich]);

  useEffect(() => {
    load();
  }, [load]);

  /* ── buscador ── */
  const fetchAll = useCallback(async () => {
    try {
      const res = await getAllUsers();
      const enriched = await enrich(res.data);
      setUsers(enriched); // ← vuelco al state
      return enriched;
    } catch (error) {
      handleError(error);
      return [];
    }
  }, [enrich]);

  const fetchByText = useCallback(
    async (txt: string) => {
      try {
        const list = await searchUsersByText(txt); // ahora devuelve Array<User>
        const enriched = await enrich(list);
        setUsers(enriched);
        return enriched;
      } catch (error) {
        handleError(error);
        return [];
      }
    },
    [enrich]
  );

  return {
    users,
    setUsers,
    loading,
    filter,
    setFilter,
    load,
    fetchAll,
    fetchByText,
    /* selección */
    selected,
    toggleSelect,
    isSelected,
  };
}
