export function extractApiError(e: any): string {
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    (typeof e?.response?.data === "string" ? e.response.data : null) ||
    e?.message ||
    "Ocurrió un error que no supimos identificar"
  );
}