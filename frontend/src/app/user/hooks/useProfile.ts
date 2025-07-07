// src/app/user/hooks/useProfile.ts
import { useState, useEffect } from "react";
import { getMe, putUser } from "../services/user.service";
import { useAuthContext } from "../context/AuthContext";
import type { User } from "../types/user";

export function useProfile() {
  const { info, setInfo } = useAuthContext();

  const [profile, setProfile] = useState<User | null>(info ?? null);
  const [loading, setLoading] = useState(!info);
  const [error, setError] = useState<string | null>(null);

  /* ── carga inicial si aún no teníamos info ────────────────────── */
  useEffect(() => {
    if (info) return; // ya estaba en sesión
    getMe()
      .then((r) => {
        setProfile(r.data);
        setInfo(
          (prev) =>
            prev
              ? { ...prev, ...r.data } // preserva roles y preferences
              : { ...r.data, roles: [], preferences: [] } // inicializa vacíos
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── guardar cambios ──────────────────────────────────────────── */
  const updateProfile = async (data: User) => {
    const { data: updated } = await putUser(data); // puede venir vacío
    const merged: User = { ...data, ...updated }; // priorizamos backend

    setProfile(merged);

    // ← aseguramos roles y preferences siempre presentes
    setInfo(
      (prev) =>
        prev
          ? { ...prev, ...merged } // roles y preferences ya están en prev
          : { ...merged, roles: [], preferences: [] } // si era null, inicializamos
    );

    return merged;
  };

  return { profile, loading, error, updateProfile };
}
