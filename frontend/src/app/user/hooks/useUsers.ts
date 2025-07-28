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
  /* ── datos ── */
  const [users, setUsers] = useState<(User & { roles: Role[] })[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>(initialFilter);

  /* ── selección ── */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds],
  );

  /* ── helper roles ── */
  const enrich = useCallback(async (list: User[]) =>
    Promise.all(
      list.map(async u => {
        try {
          const res = await getRoles(u.id);
          return { ...u, roles: res.data };
        } catch {
          return { ...u, roles: [] };
        }
      }),
    ),
  [],);

  /* ── carga ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const base =
        filter === "TENANT"
          ? (await getTenants()).data
          : (await getAllUsers()).data;

      let enriched = await enrich(base);
      if (filter === "ADMIN") enriched = enriched.filter(u => u.roles.includes("admin"));
      if (filter === "USER") enriched = enriched.filter(u => u.roles.includes("user"));

      setUsers(enriched);
    } finally {
      setLoading(false);
    }
  }, [filter, enrich]);

  useEffect(() => { load(); }, [load]);

  /* ── buscador ── */
  const fetchAll   = useCallback(() => getAllUsers().then(r => enrich(r.data)), [enrich]);
  const fetchByText = useCallback(
    (txt: string) => searchUsersByText(txt).then(r => enrich(r.data)),
    [enrich],
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
    toggleSelect,
    isSelected,
  };
}
