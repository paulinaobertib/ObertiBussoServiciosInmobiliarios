import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { Role, User } from "../types/user";
import { NotificationType, UserNotificationPreference } from "../types/notification";
import {
  getUserNotificationPreferencesByUser,
  createUserNotificationPreference,
} from "../services/notification.service";
import { getMe, getRoles, addPrincipalRole } from "../services/user.service";
import { retry, sleep } from "../../shared/utils/retry";
import { api } from "../../../api";

export type AuthInfo = User & {
  roles: Role[];
  preferences: UserNotificationPreference[];
};

interface AuthContextValue {
  info: AuthInfo | null;
  setInfo: React.Dispatch<React.SetStateAction<AuthInfo | null>>;
  isLogged: boolean;
  isAdmin: boolean;
  isTenant: boolean;
  ready: boolean;
  loading: boolean;
  refreshing: boolean;
  sessionExpired: boolean;
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  info: null,
  setInfo: () => {},
  isLogged: false,
  isAdmin: false,
  isTenant: false,
  ready: false,
  loading: true,
  refreshing: false,
  sessionExpired: false,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

const AUTH_EVENT_STORAGE_KEY = "auth:event";

const ensureDefaultPreferences = async (userId: string): Promise<UserNotificationPreference[]> => {
  const resp = await getUserNotificationPreferencesByUser(userId);
  let prefs: UserNotificationPreference[] = resp.data ?? resp;

  if (!prefs || !prefs.length) {
    const defaults: NotificationType[] = ["PROPIEDADNUEVA", "PROPIEDADINTERES"];
    const created: UserNotificationPreference[] = [];
    for (const type of defaults) {
      const body = { userId, type, enabled: true };
      const r = await createUserNotificationPreference(body);
      created.push(r.data ?? r);
    }
    prefs = created;
  }
  return prefs;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<AuthInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const ready = !loading;
  const isLogged = Boolean(info);
  const isAdmin = info?.roles.includes("admin") ?? false;
  const isTenant = info?.roles.includes("tenant") ?? false;

  const GW_URL = import.meta.env.VITE_GATEWAY_URL as string;
  const loginBaseUrl = `${GW_URL}/oauth2/authorization/keycloak-client`;

  const clearPropertyUiState = useCallback(() => {
    try {
      localStorage.removeItem("selectedPropertyId");
      localStorage.removeItem("propertyCategorySelection");
    } catch {}
  }, []);

  const broadcastAuthEvent = useCallback((type: "login" | "logout" | "user-loaded" | "session-expired") => {
    try {
      window.dispatchEvent(new CustomEvent("auth:event", { detail: { type } }));
    } catch {}
    try {
      localStorage.setItem(AUTH_EVENT_STORAGE_KEY, JSON.stringify({ type, ts: Date.now() }));
    } catch {}
  }, []);

  const markSessionExpired = useCallback(() => {
    setInfo(null);
    setSessionExpired(true);
    setLoading(false);
    clearPropertyUiState();
    broadcastAuthEvent("session-expired");
  }, [broadcastAuthEvent, clearPropertyUiState]);

  useEffect(() => {
    if (info) {
      localStorage.setItem("authInfo", JSON.stringify(info));
    } else {
      localStorage.removeItem("authInfo");
    }
  }, [info]);

  const loadUserInfo = useCallback(async () => {
    // Si ya hay una carga en curso, no iniciar otra.
    // Esto es un candado simple para evitar ejecuciones concurrentes del efecto.
    if (loading && info) {
      return;
    }
    setLoading(true);
    try {
      const meResponse = await getMe();
      const user = meResponse?.data ?? meResponse;
      if (!user) throw new Error("No se pudo obtener la información del usuario");

      await addPrincipalRole();
      await sleep(1000);

      const rolesResponse = await getRoles(user.id);
      let rawRoles: string[] = rolesResponse?.data ?? rolesResponse ?? [];

      rawRoles = await retry(
        async () => {
          const resp = await getRoles(user.id);
          const data = resp?.data ?? resp ?? [];
          if (!data.length) throw new Error("Roles aún no asignados");
          return data;
        },
        { attempts: 5, delayMs: 700 }
      );

      const roles = rawRoles.map((r: string) => r.toLowerCase() as Role);

      let preferences: UserNotificationPreference[] = [];
      if (!roles.includes("admin")) {
        preferences = await ensureDefaultPreferences(user.id);
      }
      
      setInfo({ ...user, roles, preferences });
      setSessionExpired(false);
      // No limpiar estado de UI aquí para no interferir con la navegación normal
      // clearPropertyUiState(); 
      broadcastAuthEvent("user-loaded");
    } catch (e: any) {
      const status = e?.response?.status ?? e?.status;
      const storedInfo = localStorage.getItem("authInfo");
      
      if (status === 401 || status === 403) {
        if (storedInfo) {
          markSessionExpired();
        } else {
          setInfo(null);
          setSessionExpired(false);
        }
      } else {
        setInfo(null);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, info, markSessionExpired, broadcastAuthEvent]);
  
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "authInfo") {
        if (event.newValue) {
          try {
            setInfo(JSON.parse(event.newValue));
            setSessionExpired(false);
            setLoading(false);
          } catch {}
        } else {
          setInfo(null);
          setSessionExpired(false);
          setLoading(false);
        }
        return;
      }

      if (event.key !== AUTH_EVENT_STORAGE_KEY || !event.newValue) return;
      try {
        const type = (JSON.parse(event.newValue) as { type?: string })?.type;
        if (type === "logout" || type === "session-expired") {
          localStorage.clear();
          clearPropertyUiState();
          setInfo(null);
          setSessionExpired(type === "session-expired");
          setLoading(false);
        }
      } catch {}
    };

    const handleCustomEvent = (event: Event) => {
      const type = (event as CustomEvent<{ type: string }>).detail?.type;
      if (type === "user-loaded") {
        const storedInfo = localStorage.getItem("authInfo");
        if (storedInfo) {
          try {
            setInfo(JSON.parse(storedInfo));
            setSessionExpired(false);
            setLoading(false);
          } catch {}
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth:event", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth:event", handleCustomEvent);
    };
  }, [clearPropertyUiState]);

  useEffect(() => {
    loadUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = () => {
    const nextPath = "/";
    try {
      localStorage.setItem("postLoginNext", nextPath);
    } catch {}
    setSessionExpired(false);
    clearPropertyUiState();
    broadcastAuthEvent("login");
    window.location.href = `${loginBaseUrl}?next=${encodeURIComponent(nextPath || "/")}`;
  };

  const logout = () => {
    setInfo(null);
    setSessionExpired(false);
    setLoading(true);
    localStorage.clear();
    clearPropertyUiState();
    broadcastAuthEvent("logout");
    try {
      window.location.href = new URL(`${GW_URL}/oidc/logout`).toString();
    } catch {
      window.location.href = `${GW_URL}/oidc/logout`;
    }
  };

  const refreshUser = async () => {
    await loadUserInfo();
  };

  useEffect(() => {
    const resId = api.interceptors.response.use(
      (resp) => resp,
      async (error: any) => {
        const status = error?.response?.status;
        const originalRequest = error?.config as { _retry?: boolean } | undefined;

        if ((status === 401 || status === 403) && originalRequest) {
          if (!isLogged || originalRequest._retry) {
            markSessionExpired();
            return Promise.reject(error);
          }
          originalRequest._retry = true;
          try {
            localStorage.setItem("postLoginNext", window.location.pathname + window.location.search);
          } catch {}
          markSessionExpired();
          return Promise.reject(error);
        }
        
        if (!error?.response && isLogged && (navigator.onLine ?? true)) {
          try {
            localStorage.setItem("postLoginNext", window.location.pathname + window.location.search);
          } catch {}
          markSessionExpired();
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(resId);
  }, [isLogged, markSessionExpired]);

  useEffect(() => {
    if (ready && isLogged) {
      try {
        const next = localStorage.getItem("postLoginNext");
        if (next) {
          localStorage.removeItem("postLoginNext");
          if (next !== window.location.pathname + window.location.search) {
             window.location.replace(next);
          }
        }
      } catch {}
    }
  }, [ready, isLogged]);

  return (
    <AuthContext.Provider
      value={{
        info,
        setInfo,
        isLogged,
        isAdmin,
        isTenant,
        loading,
        refreshing,
        sessionExpired,
        ready,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};
