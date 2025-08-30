import { useState, useEffect } from "react";
import { getMe, putUser } from "../services/user.service";
import { useAuthContext } from "../context/AuthContext";
import type { User } from "../types/user";
import { useApiErrors } from "../../shared/hooks/useErrors";

export function useProfile() {
  const { info, setInfo } = useAuthContext();
  const { handleError } = useApiErrors();

  const [profile, setProfile] = useState<User | null>(info ?? null);
  const [loading, setLoading] = useState(!info);

  /* ── carga inicial si aún no teníamos info ────────────────────── */
  useEffect(() => {
    if (info) return; // ya estaba en sesión
    (async () => {
      setLoading(true);
      try {
        const r = await getMe();
        setProfile(r.data);
        setInfo(
          (prev) =>
            prev
              ? { ...prev, ...r.data } // preserva roles y preferences
              : { ...r.data, roles: [], preferences: [] } // inicializa vacíos
        );
      } catch (e) {
        handleError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── guardar cambios ──────────────────────────────────────────── */
  const updateProfile = async (data: User) => {
    try {
      const { data: updated } = await putUser(data); // puede venir vacío
      const merged: User = { ...data, ...updated }; // priorizamos backend

      setProfile(merged);
      setInfo((prev) => (prev ? { ...prev, ...merged } : { ...merged, roles: [], preferences: [] }));

      return merged;
    } catch (e) {
      handleError(e);
      return null;
    }
  };

  return { profile, loading, updateProfile };
}