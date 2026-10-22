import { api } from "../../../api";
import type { PortalAccess } from "../types/portalAccess";

export const getMyPortalAccess = async (): Promise<PortalAccess> => {
  const { data } = await api.get(`/users/portalAccess/me`, { withCredentials: true });
  return data;
};

export const getPortalAccess = async (userId: string): Promise<PortalAccess> => {
  const { data } = await api.get(`/users/portalAccess/${userId}`, { withCredentials: true });
  return data;
};

export const putPortalAccess = async (userId: string, access: Omit<PortalAccess, "userId">): Promise<PortalAccess> => {
  const { data } = await api.put(`/users/portalAccess/${userId}`, { userId, ...access }, { withCredentials: true });
  return data;
};
