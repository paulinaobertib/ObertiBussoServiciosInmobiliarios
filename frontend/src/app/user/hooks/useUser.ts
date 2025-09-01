import { useState, useEffect } from "react";
import { getUserById } from "../services/user.service";
import type { User } from "../types/user";
import { useApiErrors } from "../../shared/hooks/useErrors";

export function useUser(userId: string) {
  const { handleError } = useApiErrors();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!userId) {
      setUser(null);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await getUserById(userId);
        if (!mounted) return;
        setUser(res.data);
      } catch (e) {
        if (!mounted) return;
        handleError(e); // dispara toast y setea el mensaje
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId, handleError]);

  return { user, loading };
}
