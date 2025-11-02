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
  loading: false,
  refreshing: false,
  sessionExpired: false,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

const AUTH_EVENT_STORAGE_KEY = "auth:event";

const ensureDefaultPreferences = async (userId: string): Promise<UserNotificationPreference[]> => {
  // 1) leer existentes
  const resp = await getUserNotificationPreferencesByUser(userId);
  let prefs: UserNotificationPreference[] = resp.data ?? resp;

  // 2) crear si no hay ninguna
  if (!prefs || !prefs.length) {
    const defaults: NotificationType[] = ["PROPIEDADNUEVA", "PROPIEDADINTERES"];
    const created: UserNotificationPreference[] = [];
    for (const type of defaults) {
      const body = { userId, type, enabled: true }; // coincide con tu UserNotificationPreferenceCreate
      const r = await createUserNotificationPreference(body);
      created.push(r.data ?? r);
    }
    prefs = created;
  }

  return prefs;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = localStorage.getItem("authInfo");
  const hasStoredInfo = Boolean(stored);
  const [info, setInfo] = useState<AuthInfo | null>(stored ? JSON.parse(stored) : null);
  const [loading, setLoading] = useState(!stored);
  const [refreshing] = useState(false);
  const [ready, setReady] = useState(Boolean(stored)); // listo para renderizar
  const [sessionExpired, setSessionExpired] = useState(false);

  const GW_URL = import.meta.env.VITE_GATEWAY_URL as string;
  const loginBaseUrl = `${GW_URL}/oauth2/authorization/keycloak-client`;

  const isLogged = Boolean(info);
  const isAdmin = info?.roles.includes("admin") ?? false;
  const isTenant = info?.roles.includes("tenant") ?? false;

  //para que aparezcan seleccionadas las caracteristicas al editar un contrato
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
      localStorage.setItem(
        AUTH_EVENT_STORAGE_KEY,
        JSON.stringify({ type, ts: Date.now() })
      );
    } catch {}
  }, []);

  const markSessionExpired = useCallback(() => {
    setInfo(null);
    setReady(false);
    setSessionExpired(true);
    clearPropertyUiState();
    broadcastAuthEvent("session-expired");
  }, [broadcastAuthEvent, clearPropertyUiState]);

  // Sincronizar con localStorage
  useEffect(() => {
    if (info) {
      localStorage.setItem("authInfo", JSON.stringify(info));
    } else {
      localStorage.removeItem("authInfo");
    }
  }, [info]);

  // Carga completa de info de sesión
  const loadUserInfo = async () => {
    setLoading(true);
    if (isLogged) setReady(false);
    try {
      // 1) datos básicos
      const meResponse = await getMe();
      const user = meResponse?.data ?? meResponse;
      if (!user) throw new Error("No se pudo obtener la información del usuario");

      // 3) si no hay roles, asignar principal y reintentar obtenerlos
      await addPrincipalRole();
      // pequeña espera para que Keycloak/DB refleje el cambio
      await sleep(1000);

      // 2) roles (pueden venir vacíos en primer login)
      const rolesResponse = await getRoles(user.id);
      let rawRoles: string[] = rolesResponse?.data ?? rolesResponse ?? [];
      let roles = rawRoles.map((r: string) => r.toLowerCase() as Role);

      // Reintenta 5 veces con 700ms entre intentos
      rawRoles = await retry(
        async () => {
          const resp = await getRoles(user.id);
          const data = resp?.data ?? resp ?? [];
          if (!data.length) throw new Error("Roles aún no asignados");
          return data;
        },
        { attempts: 5, delayMs: 700 }
      );

      roles = rawRoles.map((r: string) => r.toLowerCase() as Role);

      // 4) preferencias (solo si no es admin)

      let preferences: UserNotificationPreference[] = [];
      if (roles.includes("admin")) {
        preferences = [];
      } else {
        preferences = await ensureDefaultPreferences(user.id);
      }
      // modificado para la logica de que aparezcan seleccionadas las caracteristicas al editar contrato
      setInfo({ ...user, roles, preferences });
      setSessionExpired(false);
      clearPropertyUiState();
      broadcastAuthEvent("user-loaded");
      setReady(true);
    } catch (e: any) {
      const status = e?.response?.status ?? e?.status;
      if (status === 401 || status === 403) {
        if (isLogged || hasStoredInfo) {
          markSessionExpired();
        } else {
          setSessionExpired(false);
          setReady(true);
        }
      } else {
        // si algo falla, limpiamos y marcamos no listo
        setInfo(null);
        setReady(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Listener para eventos de localStorage (funciona entre pestañas)
    const handleStorage = (event: StorageEvent) => {
      // Detectar cambios en authInfo directamente
      if (event.key === "authInfo") {
        if (event.newValue) {
          try {
            const authInfo = JSON.parse(event.newValue);
            setInfo(authInfo);
            setSessionExpired(false);
            setLoading(false);
            setReady(true);
          } catch {
            // Si falla el parse, no hacer nada
          }
        } else {
          // Si se eliminó authInfo, cerrar sesión
          setInfo(null);
          setSessionExpired(false);
          setLoading(false);
          setReady(true);
        }
        return;
      }
      
      // Manejar eventos de auth:event para logout y session-expired
      if (event.key !== AUTH_EVENT_STORAGE_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as { type?: string };
        const type = parsed?.type;
        
        if (type === "logout") {
          localStorage.clear();
          clearPropertyUiState();
          setInfo(null);
          setSessionExpired(false);
          setLoading(false);
          setReady(true);
        }
        if (type === "session-expired") {
          localStorage.clear();
          clearPropertyUiState();
          setInfo(null);
          setSessionExpired(true);
          setLoading(false);
          setReady(true);
        }
      } catch {}
    };

    // Listener para eventos personalizados (funciona en la misma pestaña)
    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ type: string }>;
      const type = customEvent.detail?.type;
      
      if (type === "user-loaded" || type === "logout" || type === "session-expired") {
        // Forzar re-render leyendo de localStorage
        const storedInfo = localStorage.getItem("authInfo");
        if (storedInfo && type === "user-loaded") {
          try {
            const authInfo = JSON.parse(storedInfo);
            setInfo(authInfo);
            setSessionExpired(false);
            setLoading(false);
            setReady(true);
          } catch {
            // Si falla el parse, no hacer nada
          }
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

  // Al montar, siempre refrescar desde la API (aunque haya stored) para evitar estados viejos
  useEffect(() => {
    loadUserInfo();
  }, []);

  const login = () => {
    const nextPath = "/";
    try {
      localStorage.setItem("postLoginNext", nextPath);
    } catch {}
    setSessionExpired(false);
    // Don't set loading=true or ready=false here - if user clicks back instead of logging in,
    // they get stuck in permanent loading state. Let loadUserInfo handle the loading state.
    
    clearPropertyUiState(); // limpia selección/estado previo
    broadcastAuthEvent("login"); // por si otro contexto quiere reaccionar

    const loginUrl = `${loginBaseUrl}?next=${encodeURIComponent(nextPath || "/")}`;
    window.location.href = loginUrl;
  };

  const logout = () => {
    setInfo(null);
    setSessionExpired(false);
    setReady(false);
    setLoading(true);
    localStorage.clear();

    clearPropertyUiState(); // idem
    broadcastAuthEvent("logout"); // por si querés resetear selección en otros contextos

    try {
      const target = new URL(`${GW_URL}/oidc/logout`);
      window.location.href = target.toString();
    } catch {
      window.location.href = `${GW_URL}/oidc/logout`;
    }
  };

  const refreshUser = async () => {
    await loadUserInfo();
  };

  // Interceptor mínimo: si detectamos caducidad, intentamos refrescar y, si falla, marcamos sesión expirada
  useEffect(() => {
    const resId = api.interceptors.response.use(
      (resp) => resp,
      async (error: any) => {
        const status = error?.response?.status;
        const originalRequest = error?.config as { _retry?: boolean } | undefined;

        if ((status === 401 || status === 403) && originalRequest) {
          if (!isLogged) {
            return Promise.reject(error);
          }
          if (originalRequest._retry) {
            markSessionExpired();
            return Promise.reject(error);
          }

          originalRequest._retry = true;
          try {
            const next = window.location.pathname + window.location.search;
            localStorage.setItem("postLoginNext", next);
          } catch {}

          markSessionExpired();
          return Promise.reject(error);
        }

        // 1) NetworkError (sin response) y estamos online -> tratar como sesión expirada
        if (!error?.response && isLogged) {
          const isOnline = typeof navigator === "undefined" ? true : navigator.onLine;
          if (isOnline) {
            try {
              const next = window.location.pathname + window.location.search;
              localStorage.setItem("postLoginNext", next);
            } catch {}
            markSessionExpired();
          }
        }
        return Promise.reject(error);
      }
    );
    return () => {
      api.interceptors.response.eject(resId);
    };
  }, [isLogged, markSessionExpired]);

  useEffect(() => {
    if (!ready || !isLogged) return;
    try {
      const next = localStorage.getItem("postLoginNext");
      if (next && next !== window.location.pathname + window.location.search) {
        localStorage.removeItem("postLoginNext");
        window.location.replace(next);
      } else if (next) {
        localStorage.removeItem("postLoginNext");
      }
    } catch {}
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
