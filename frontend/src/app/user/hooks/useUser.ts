// src/app/user/hooks/useUser.ts
import { useState, useEffect } from "react";
import { getUserById } from "../services/user.service";
import type { User } from "../types/user";

export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!userId) return;

    getUserById(userId)
      .then(res => {
        if (mounted) {
          setUser(res.data);
          setError(null);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err.message);
        }
      });

    return () => {
      mounted = false;
    };
  }, [userId]);

  return { user, error };
}
