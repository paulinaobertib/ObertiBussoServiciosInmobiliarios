import { useState, useCallback } from 'react';

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  onSuccess: (result: T) => void = () => {},
  onError: (error: any) => void = () => {}
) {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async () => {
    setLoading(true);
    try {
      const result = await asyncFunction();
      onSuccess(result);
    } catch (err) {
      onError(err);
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, onSuccess, onError]);

  return { execute, loading };
}
