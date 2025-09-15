import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
  const stored = sessionStorage.getItem("authInfo");
  const [info, setInfo] = useState<AuthInfo | null>(stored ? JSON.parse(stored) : null);
  const [loading, setLoading] = useState(!stored);
  const [refreshing, setRefreshing] = useState(false);
  const [ready, setReady] = useState(Boolean(stored)); // listo para renderizar
  const [sessionExpired, setSessionExpired] = useState(false);

  const GW_URL = import.meta.env.VITE_GATEWAY_URL as string;
  const loginUrl = `${GW_URL}/oauth2/authorization/keycloak-client?next=/`;

  const isLogged = Boolean(info);
  const isAdmin = info?.roles.includes("ADMIN" as Role) ?? false;
  const isTenant = info?.roles.includes("TENANT" as Role) ?? false;

  //para que aparezcan seleccionadas las caracteristicas al editar un contrato
  const clearPropertyUiState = () => {
    try {
      localStorage.removeItem('selectedPropertyId');
      localStorage.removeItem('propertyCategorySelection');
    } catch {}
  };

  const broadcastAuthEvent = (type: 'login' | 'logout' | 'user-loaded' | 'session-expired') => {
    try {
      window.dispatchEvent(new CustomEvent('auth:event', { detail: { type } }));
    } catch {}
  };

  // Sincronizar con sessionStorage
  useEffect(() => {
    if (info) sessionStorage.setItem("authInfo", JSON.stringify(info));
    else sessionStorage.removeItem("authInfo");
  }, [info]);

  // Carga completa de info de sesión
  const loadUserInfo = async () => {
    setLoading(true);
    setReady(false);
    try {
      // 1) datos básicos
      const { data: user } = await getMe();

      // 3) si no hay roles, asignar principal y reintentar obtenerlos
      await addPrincipalRole();
      // pequeña espera para que Keycloak/DB refleje el cambio
      await sleep(1000);

      // 2) roles (pueden venir vacíos en primer login)
      let { data: rawRoles } = await getRoles(user.id);
      let roles = rawRoles.map((r: string) => r.toUpperCase() as Role);

      // Reintenta 5 veces con 700ms entre intentos
      rawRoles = await retry(
        async () => {
          const resp = await getRoles(user.id);
          if (!resp.data || !resp.data.length) throw new Error("Roles aún no asignados");
          return resp.data;
        },
        { attempts: 5, delayMs: 700 }
      );

      roles = rawRoles.map((r: string) => r.toUpperCase() as Role);

      // 4) preferencias (solo si no es admin)

      let preferences: UserNotificationPreference[] = [];
      if (roles.includes("ADMIN" as Role)) {
        preferences = [];
      } else {
        preferences = await ensureDefaultPreferences(user.id);
      }
      // modificado para la logica de que aparezcan seleccionadas las caracteristicas al editar contrato
      setInfo({ ...user, roles, preferences });
      setSessionExpired(false);
      clearPropertyUiState();
      broadcastAuthEvent('user-loaded');
      setReady(true);

    } catch (e) {
      // si algo falla, limpiamos y marcamos no listo
      setInfo(null);
      setReady(false);
    } finally {
      setLoading(false);
    }
  };

  // Al montar, siempre refrescar desde la API (aunque haya stored) para evitar estados viejos
  useEffect(() => {
    loadUserInfo();
  }, []);

  const login = () => {
    try {
      const next = window.location.pathname + window.location.search;
      sessionStorage.setItem("postLoginNext", next);
    } catch {}
    setSessionExpired(false);

    clearPropertyUiState();         // limpia selección/estado previo
    broadcastAuthEvent('login');    // por si otro contexto quiere reaccionar

    window.location.href = loginUrl;
  };

  const logout = () => {
    setInfo(null);
    setSessionExpired(false);
    sessionStorage.clear();

    clearPropertyUiState();         // idem
    broadcastAuthEvent('logout');   // por si querés resetear selección en otros contextos

    window.location.href = `${GW_URL}/logout`;
  };

  const refreshUser = async () => {
    await loadUserInfo();
  };

  // Interceptor mínimo: si detectamos caducidad, mostramos diálogo
  useEffect(() => {
    const resId = api.interceptors.response.use(
      (resp) => resp,
      async (error: any) => {
        // 1) NetworkError (sin response) y estamos online -> tratar como sesión expirada
        if (!error?.response) {
          const isOnline = typeof navigator === 'undefined' ? true : navigator.onLine;
          if (isOnline) {
            try {
              const next = window.location.pathname + window.location.search;
              sessionStorage.setItem("postLoginNext", next);
            } catch {}
            setRefreshing(false);
            setSessionExpired(true);
            broadcastAuthEvent('session-expired'); // notifica evento global
          }
          return Promise.reject(error);
        }
      }
    );
    return () => {
      api.interceptors.response.eject(resId);
    };
  }, []);

  useEffect(() => {
    if (!ready || !isLogged) return;
    try {
      const next = sessionStorage.getItem("postLoginNext");
      if (next && next !== window.location.pathname + window.location.search) {
        sessionStorage.removeItem("postLoginNext");
        window.location.replace(next);
      } else if (next) {
        sessionStorage.removeItem("postLoginNext");
      }
    } catch {}
  }, [ready, isLogged]);

  return (
    <AuthContext.Provider
      value={{ info, setInfo, isLogged, isAdmin, isTenant, loading, refreshing, sessionExpired, ready, login, logout, refreshUser }}
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