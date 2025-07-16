// src/app/user/hooks/useUsers.ts
import { useState, useEffect, useCallback } from "react";
import {
  getAllUsers,
  getTenants,
  searchUsersByText,
  getRoles,
} from "../services/user.service";
import type { User, Role } from "../types/user";

export type Filter = "TODOS" | "ADMIN" | "USER" | "TENANT";

export function useUsers(initialFilter: Filter = "TODOS") {
  const [users, setUsers] = useState<(User & { roles: Role[] })[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>(initialFilter);

  // helper que añade roles
  const enrich = useCallback(async (list: User[]) => {
    return Promise.all(
      list.map(async (u) => {
        try {
          const res = await getRoles(u.id);
          return { ...u, roles: res.data };
        } catch {
          return { ...u, roles: [] };
        }
      })
    );
  }, []);

  // carga según filter
  const load = useCallback(async () => {
    setLoading(true);
    try {
      let base: User[];
      if (filter === "TENANT") {
        base = (await getTenants()).data;
      } else {
        base = (await getAllUsers()).data;
      }
      let enriched = await enrich(base);
      if (filter === "ADMIN")
        enriched = enriched.filter((u) => u.roles.includes("admin"));
      if (filter === "USER")
        enriched = enriched.filter((u) => u.roles.includes("user"));
      setUsers(enriched);
    } finally {
      setLoading(false);
    }
  }, [filter, enrich]);

  // recarga al cambiar filter
  useEffect(() => {
    load();
  }, [load]);

  // para SearchBar
  const fetchAll = useCallback(async () => {
    const all = (await getAllUsers()).data;
    return enrich(all);
  }, [enrich]);

  const fetchByText = useCallback(
    async (text: string) => {
      const found = (await searchUsersByText(text)).data;
      return enrich(found);
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
  };
}
