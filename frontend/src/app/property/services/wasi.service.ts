import { api } from "../../../api";
import type { WasiLocationMapping, WasiPortal } from "../types/property";

export const getWasiPortals = async (): Promise<WasiPortal[]> => {
  const res = await api.get(`/properties/property/wasi/portals`, { withCredentials: true });
  const data = (res as any)?.data ?? res;
  return Array.isArray(data) ? data : [];
};

export const getWasiCompanies = async (): Promise<string[]> => {
  const res = await api.get(`/properties/property/wasi/companies`, { withCredentials: true });
  const data = (res as any)?.data ?? res;
  return Array.isArray(data) ? data : [];
};

export const getWasiSyncStatus = async (propertyId: number) => {
  const res = await api.get(`/properties/property/wasi/sync-status/${propertyId}`, { withCredentials: true });
  return (res as any)?.data ?? res;
};

export const saveWasiLocationMapping = async (body: WasiLocationMapping) => {
  await api.post(`/properties/property/wasi/locations/mapping`, body, { withCredentials: true });
};

export const getWasiActivity = async (): Promise<{ at: string; level: string; message: string }[]> => {
  const res = await api.get(`/properties/property/wasi/activity`, { withCredentials: true });
  const data = (res as any)?.data ?? res;
  return Array.isArray(data) ? data : [];
};

/** Opens PDF URL or downloads blob depending on backend response */
export const downloadPropertyPdf = async (propertyId: number) => {
  const res = await api.get(`/properties/property/pdf/${propertyId}`, {
    withCredentials: true,
    responseType: "arraybuffer",
  });
  const contentType = (res as any).headers?.["content-type"] || "";
  const buffer = (res as any).data;
  if (contentType.includes("application/json")) {
    const text = new TextDecoder().decode(buffer);
    const j = JSON.parse(text);
    if (j.url) {
      window.open(j.url, "_blank", "noopener,noreferrer");
      return;
    }
  }
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `propiedad-${propertyId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};
