import { useState, useCallback } from "react";

export function useLoading<T extends (...args: any[]) => Promise<any>>(fn: T) {
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (...args: Parameters<T>) => {
      setLoading(true);
      try {
        return await fn(...args);
      } finally {
        setLoading(false);
      }
    },
    [fn]
  );

  return { loading, run };
}
