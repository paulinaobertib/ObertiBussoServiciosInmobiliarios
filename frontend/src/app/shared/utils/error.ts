export function extractApiError(e: any): string {
  const data = e?.response?.data;
  return (
    data?.message ||
    data?.error ||
    data?.detail ||
    (typeof data === "string" && data ? data : null) ||
    (Array.isArray(data) && data.length > 0 ? data.join("\n") : null) ||
    (typeof data === "object" && data !== null ? JSON.stringify(data) : null) ||
    e?.message ||
    "Ocurrió un error que no supimos identificar"
  );
}


