// src/app/user/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Role, User } from "../types/user";
import { NotificationType, UserNotificationPreference } from "../types/notification";
import {
  getUserNotificationPreferencesByUser,
  createUserNotificationPreference,
} from "../services/notification.service";
import { getMe, getRoles, addPrincipalRole } from "../services/user.service";
import { retry, sleep } from "../../shared/utils/retry";

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
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

const ensureDefaultPreferences = async (userId: string): Promise<UserNotificationPreference[]> => {
  // 1) leer existentes
  const resp = await getUserNotificationPreferencesByUser(userId);
  let prefs: UserNotificationPreference[] = resp.data ?? resp; // según tu helper, puede ser .data o el objeto directo

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
  const [ready, setReady] = useState(Boolean(stored)); // listo para renderizar

  const GW_URL = import.meta.env.VITE_GATEWAY_URL as string;
  const loginUrl = `${GW_URL}/oauth2/authorization/keycloak-client?next=/`;

  const isLogged = Boolean(info);
  const isAdmin = info?.roles.includes("ADMIN" as Role) ?? false;
  const isTenant = info?.roles.includes("TENANT" as Role) ?? false;

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
      await sleep(100000);

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
      // ...
      setInfo({ ...user, roles, preferences });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = () => {
    window.location.href = loginUrl;
  };

  const logout = () => {
    setInfo(null);
    sessionStorage.clear();
    window.location.href = `${GW_URL}/logout`;
  };

  const refreshUser = async () => {
    await loadUserInfo();
  };

  return (
    <AuthContext.Provider
      value={{ info, setInfo, isLogged, isAdmin, isTenant, loading, ready, login, logout, refreshUser }}
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
