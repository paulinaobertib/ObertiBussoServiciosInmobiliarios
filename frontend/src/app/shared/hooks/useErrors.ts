import { useCallback, useState } from "react";
import { useGlobalAlert } from "../context/AlertContext";
import { extractApiError } from "../utils/error";

export function useApiErrors() {
  const { showAlert } = useGlobalAlert();
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback(
    (e: any) => {
      const msg = extractApiError(e);
      setError(msg);
      showAlert(msg, "error");
      return msg;
    },
    [showAlert]
  );

  return { error, setError, handleError };
}